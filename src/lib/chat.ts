import type { Lang, Mood, Turn } from "@/components/reya/store";
import { inferMood } from "@/components/reya/emotions";

const FALLBACK: Record<Lang, string[]> = {
  uz: [
    "Salom! Men REYA man. Bugun sizga qanday yordam bera olaman?",
    "Tushundim. Qisqa qilib aytsam, men sizning yonida man.",
    "Zo'r savol. Keling, birgalikda o'ylab ko'ramiz.",
  ],
  ru: [
    "Привет! Я REYA. Чем могу помочь?",
    "Поняла. Я рядом, давайте продолжим.",
    "Интересный вопрос. Давайте разберёмся.",
  ],
  en: [
    "Hi! I'm REYA. How can I help you today?",
    "Got it. I'm right here with you.",
    "Interesting question. Let's think it through together.",
  ],
};

/** Demo chat. Wire a secure backend for real AI keys. */
export async function askReya(
  messages: Turn[],
  lang: Lang,
): Promise<{ ok: true; text: string; mood: Mood } | { ok: false; error: string }> {
  const last = messages[messages.length - 1]?.content ?? "";
  await new Promise((r) => setTimeout(r, 500 + Math.random() * 400));
  const pool = FALLBACK[lang];
  const text = pool[Math.floor(Math.random() * pool.length)];
  const mood = inferMood(`${last} ${text}`);
  return { ok: true, text, mood };
}
