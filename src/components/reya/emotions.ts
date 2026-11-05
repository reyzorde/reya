import type { Mood } from "./store";

export const MOODS: Mood[] = [
  "idle", "listening", "thinking", "speaking", "happy", "laughing", "angry",
  "shy", "sad", "crying", "disappointed", "surprised", "sleeping", "curious",
  "confident", "love", "wink", "proud", "worried", "error",
];

export const LIGHT: Record<Mood, string> = {
  idle: "#7ee0ff",
  listening: "#7ee0ff",
  thinking: "#b388ff",
  speaking: "#7ee0ff",
  happy: "#f0c27a",
  laughing: "#ffd27a",
  angry: "#ff5a6a",
  shy: "#ff8fb8",
  sad: "#6aa7ff",
  crying: "#6aa7ff",
  disappointed: "#8d97a3",
  surprised: "#fff1a8",
  sleeping: "#6d7a88",
  curious: "#7ee0ff",
  confident: "#f0c27a",
  love: "#ff8fb8",
  wink: "#f0c27a",
  proud: "#f0c27a",
  worried: "#8eb6ff",
  error: "#ff5a6a",
};

export function inferMood(text: string): Mood {
  const t = text.toLowerCase();
  const rules: [Mood, string[]][] = [
    ["laughing", ["haha", "lol", "kuldir", "kulgi", "смеш", "ahah"]],
    ["crying", ["yig'", "yigla", "ko'z yosh", "плач", "cry"]],
    ["angry", ["jahli", "g'azab", "ishlamadi", "bad", "angry", "злой", "yomon"]],
    ["shy", ["qiziqsan", "uyat", "blush", "стесн", "sen juda"]],
    ["sad", ["xafa", "sad", "груст", "yomon kayf"]],
    ["disappointed", ["hafsalam", "disappoint", "umidim"]],
    ["surprised", ["voy", "wow", "ajoyib", "ого", "surprised"]],
    ["love", ["sevaman", "love", "люблю", "yoqtir"]],
    ["thinking", ["o'yla", "think", "nima deb", "дума"]],
    ["curious", ["nega", "why", "qanday", "почему"]],
    ["confident", ["albatta", "ishonch", "sure", "конечно"]],
    ["worried", ["xavotir", "worry", "qo'rq", "беспоко"]],
    ["happy", ["yaxshi", "zo'r", "happy", "rahmat", "отлично", "great"]],
    ["sleeping", ["uxla", "sleep", "спат"]],
  ];
  for (const [mood, keys] of rules) {
    if (keys.some((k) => t.includes(k))) return mood;
  }
  return "happy";
}
