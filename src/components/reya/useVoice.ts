import { useEffect, useRef } from "react";
import { askReya } from "@/lib/chat";
import { inferMood } from "./emotions";
import { useReya, type Lang, type Mood } from "./store";

const WAKE = ["hey reya", "hey raya", "salom reya", "privet reya"];

const RECOG_LANG: Record<Lang, string> = { uz: "uz-UZ", ru: "ru-RU", en: "en-US" };
const SPEAK_LANG: Record<Lang, string> = { uz: "uz-UZ", ru: "ru-RU", en: "en-US" };

type Rec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal?: boolean }> }) => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getRec(): Rec | null {
  const w = window as unknown as {
    SpeechRecognition?: new () => Rec;
    webkitSpeechRecognition?: new () => Rec;
  };
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

function isWake(text: string) {
  const t = text.toLowerCase();
  return WAKE.some((w) => t.includes(w));
}

export function useVoice() {
  const recRef = useRef<Rec | null>(null);
  const wantRef = useRef(false);

  const speak = (text: string, after: Mood) => {
    const { volume, lang, set } = useReya.getState();
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = SPEAK_LANG[lang];
    u.volume = volume;
    u.rate = lang === "uz" ? 0.95 : 1;
    u.onstart = () => set({ mood: "speaking", mode: "active", mouth: 0.4 });
    u.onboundary = () => set({ mouth: Math.random() });
    u.onend = () => {
      set({ mood: after, mouth: 0, status: "Tayyor" });
      window.setTimeout(() => {
        if (useReya.getState().mood === after) {
          set({ mode: "idle", mood: "sleeping", status: "Kutish rejimi" });
        }
      }, 2800);
    };
    u.onerror = () => set({ mood: "error", status: "Ovoz chiqarilmadi" });
    synth.speak(u);
  };

  const ask = async (text: string) => {
    const { history, lang, push, set } = useReya.getState();
    const user = text.replace(/hey reya|hey raya|salom reya|privet reya/gi, "").trim() || text;
    push({ role: "user", content: user });
    set({ mode: "active", mood: "thinking", status: "O\u2018ylayapman\u2026" });
    const next = [...history, { role: "user" as const, content: user }];
    const res = await askReya(next, lang);
    if (!res.ok) {
      set({ mood: "error", status: res.error });
      return;
    }
    const mood = res.mood || inferMood(`${user} ${res.text}`);
    push({ role: "assistant", content: res.text });
    set({ mood });
    speak(res.text, mood);
  };

  const startMic = () => {
    const rec = getRec();
    if (!rec) {
      useReya.getState().set({
        status: "Bu brauzer nutqni tushunmaydi. Matn maydonidan yozing.",
        mood: "error",
        mode: "active",
      });
      return;
    }
    wantRef.current = true;
    rec.lang = RECOG_LANG[useReya.getState().lang];
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (ev) => {
      const last = ev.results[ev.results.length - 1];
      const text = last?.[0]?.transcript ?? "";
      if (!last || !(last as { isFinal?: boolean }).isFinal) return;
      const state = useReya.getState();
      if (state.mode === "idle") {
        if (isWake(text)) {
          state.set({ mode: "active", mood: "listening", status: "Tinglayapman" });
          const rest = text.replace(/hey reya|hey raya|salom reya|privet reya/gi, "").trim();
          if (rest) void ask(rest);
        }
        return;
      }
      if (state.mood === "speaking" || state.mood === "thinking") return;
      void ask(text);
    };
    rec.onerror = (ev) => {
      if (ev.error === "not-allowed") {
        useReya.getState().set({ micOn: false, status: "Mikrofon ruxsati berilmadi", mood: "error" });
        wantRef.current = false;
      }
    };
    rec.onend = () => {
      if (wantRef.current) {
        try {
          rec.start();
        } catch {
          /* already started */
        }
      }
    };
    try {
      rec.start();
      recRef.current = rec;
      useReya.getState().set({
        micOn: true,
        mood: "listening",
        mode: "active",
        status: "Tinglayapman \u2014 \u201cHey Reya\u201d",
      });
    } catch {
      useReya.getState().set({ status: "Mikrofon ochilmadi", mood: "error" });
    }
  };

  const stopMic = () => {
    wantRef.current = false;
    recRef.current?.stop();
    recRef.current = null;
    window.speechSynthesis.cancel();
    useReya.getState().set({
      micOn: false,
      mode: "idle",
      mood: "sleeping",
      mouth: 0,
      status: "Kutish rejimi",
    });
  };

  useEffect(() => () => stopMic(), []);

  return { startMic, stopMic, ask, speak };
}
