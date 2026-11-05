import { Mic, MicOff, Volume2 } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { MOODS } from "@/components/reya/emotions";
import { useReya, type Lang } from "@/components/reya/store";
import { useVoice } from "@/components/reya/useVoice";

const Speaker = lazy(() =>
  import("@/components/reya/Speaker").then((m) => ({ default: m.Speaker })),
);

const LANGS: { id: Lang; label: string }[] = [
  { id: "uz", label: "O\u2018zbek" },
  { id: "ru", label: "\u0420\u0443\u0441\u0441\u043a\u0438\u0439" },
  { id: "en", label: "English" },
];

export default function App() {
  const mode = useReya((s) => s.mode);
  const mood = useReya((s) => s.mood);
  const status = useReya((s) => s.status);
  const lang = useReya((s) => s.lang);
  const volume = useReya((s) => s.volume);
  const micOn = useReya((s) => s.micOn);
  const history = useReya((s) => s.history);
  const set = useReya((s) => s.set);
  const { startMic, stopMic, ask } = useVoice();
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);

  return (
    <main style={{ minHeight: "100vh", overflow: "hidden" }}>
      <header
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "24px 20px 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <p style={{ margin: 0, fontFamily: "var(--font-display)", letterSpacing: "0.28em", color: "var(--primary)", fontSize: 14 }}>
            REYA
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--muted)" }}>Smart speaker \u00b7 pixel companion</p>
        </div>
        <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>{mode === "idle" ? "Standby" : mood}</p>
      </header>

      <section style={{ maxWidth: 960, margin: "0 auto", height: "58vh", minHeight: 380 }}>
        <Suspense fallback={<div style={{ height: "100%", display: "grid", placeItems: "center", color: "var(--muted)" }}>Speaker yuklanmoqda\u2026</div>}>
          <Speaker />
        </Suspense>
      </section>

      <section
        style={{
          maxWidth: 560,
          margin: "0 auto",
          padding: "0 20px 40px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <p style={{ textAlign: "center", margin: 0, fontSize: 14, color: "var(--muted)" }} role="status">
          {status}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
          <button
            type="button"
            onClick={() => (micOn ? stopMic() : startMic())}
            style={{
              height: 48,
              borderRadius: 999,
              border: "none",
              background: "var(--primary)",
              color: "var(--bg)",
              padding: "0 20px",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontWeight: 600,
            }}
          >
            {micOn ? <MicOff size={18} /> : <Mic size={18} />}
            {micOn ? "To\u2018xtatish" : "Hey Reya"}
          </button>
          {LANGS.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => set({ lang: l.id })}
              style={{
                height: 44,
                borderRadius: 999,
                border: "1px solid var(--border)",
                background: lang === l.id ? "var(--surface)" : "transparent",
                color: lang === l.id ? "var(--fg)" : "var(--muted)",
                padding: "0 16px",
              }}
            >
              {l.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
          {MOODS.filter((m) => !["idle", "error", "speaking"].includes(m)).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => set({ mode: "active", mood: m, status: m })}
              style={{
                height: 36,
                borderRadius: 999,
                border: "1px solid var(--border)",
                background: "transparent",
                color: "var(--muted)",
                padding: "0 12px",
                fontSize: 12,
              }}
            >
              {m}
            </button>
          ))}
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--muted)", fontSize: 14 }}>
          <Volume2 size={16} />
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => set({ volume: Number(e.target.value) })}
            style={{ width: "100%", accentColor: "var(--primary)" }}
            aria-label="Volume"
          />
        </label>

        <form
          style={{ display: "flex", gap: 8 }}
          onSubmit={(e) => {
            e.preventDefault();
            const text = draft.trim();
            if (!text) return;
            setDraft("");
            void ask(text);
          }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={lang === "ru" ? "\u041d\u0430\u043f\u0438\u0448\u0438\u0442\u0435 Reya\u2026" : lang === "en" ? "Ask Reya\u2026" : "Reyaga yozing\u2026"}
            style={{
              flex: 1,
              height: 48,
              borderRadius: 999,
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--fg)",
              padding: "0 16px",
              outline: "none",
            }}
          />
          <button
            type="submit"
            style={{
              height: 48,
              borderRadius: 999,
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--fg)",
              padding: "0 16px",
            }}
          >
            Yuborish
          </button>
        </form>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 12 }}
        >
          {open ? "Tarixni yopish" : "Suhbat tarixi"}
        </button>

        {open && (
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 16,
              maxHeight: 192,
              overflow: "auto",
              borderRadius: 16,
              border: "1px solid var(--border)",
              background: "var(--surface)",
              fontSize: 14,
            }}
          >
            {history.length === 0 && <li style={{ color: "var(--muted)" }}>Hali suhbat yo\u2018q.</li>}
            {history.map((t, i) => (
              <li key={i} style={{ marginBottom: 8, color: t.role === "user" ? "var(--fg)" : "var(--primary)" }}>
                {t.role === "user" ? "Siz" : "REYA"} \u2014 {t.content}
              </li>
            ))}
          </ul>
        )}

        <p style={{ textAlign: "center", margin: 0, fontSize: 12, lineHeight: 1.5, color: "var(--muted)" }}>
          Brauzer TTS. Demo AI lokal javoblar. \u201cHey Reya\u201d Chrome mikrofonida.
        </p>
      </section>
    </main>
  );
}
