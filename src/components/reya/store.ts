import { create } from "zustand";

export type Mood =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking"
  | "happy"
  | "laughing"
  | "angry"
  | "shy"
  | "sad"
  | "crying"
  | "disappointed"
  | "surprised"
  | "sleeping"
  | "curious"
  | "confident"
  | "love"
  | "wink"
  | "proud"
  | "worried"
  | "error";

export type Lang = "uz" | "ru" | "en";
export type Turn = { role: "user" | "assistant"; content: string };

type ReyaState = {
  mode: "idle" | "active";
  mood: Mood;
  lang: Lang;
  volume: number;
  micOn: boolean;
  status: string;
  history: Turn[];
  mouth: number;
  set: (partial: Partial<ReyaState>) => void;
  push: (turn: Turn) => void;
};

export const useReya = create<ReyaState>((set) => ({
  mode: "idle",
  mood: "sleeping",
  lang: "uz",
  volume: 0.9,
  micOn: false,
  status: "Kutish rejimi",
  history: [],
  mouth: 0,
  set: (partial) => set(partial),
  push: (turn) => set((s) => ({ history: [...s.history, turn].slice(-16) })),
}));
