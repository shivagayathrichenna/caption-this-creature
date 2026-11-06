export interface Player {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export type DeckMode = "mix" | "builtin" | "custom";

export interface Settings {
  /** true = points + voting leaderboard, false = just-for-laughs, nothing is tallied */
  scoring: boolean;
  rounds: number;
  /** seconds per caption, 0 = no timer */
  timer: number;
  deck: DeckMode;
  showNames: boolean;
}

export interface SetupState {
  players: Player[];
  settings: Settings;
}

export interface Creature {
  id: string;
  name: string;
  seed: number;
  twists?: string[];
  custom?: boolean;
}

export interface Caption {
  playerId: string;
  text: string;
}

export interface Round {
  creature: Creature;
  /** player ids in the order they take the device */
  writers: string[];
  captions: Caption[];
  /** shuffled author ids – the anonymous display order */
  order: string[];
  /** voterId -> authorId (scoring mode) */
  votes: Record<string, string>;
  /** authorId -> emoji -> count (no-score mode) */
  reactions: Record<string, Record<string, number>>;
  /** group-picked favourite in no-score mode */
  crown: string | null;
}

export interface Game {
  players: Player[];
  settings: Settings;
  rounds: Round[];
  spare: Creature[];
  roundIdx: number;
}

export type Screen =
  | { name: "home" }
  | { name: "setup" }
  | { name: "lab"; from: "home" | "setup" }
  | { name: "intro" }
  | { name: "pass"; turn: number }
  | { name: "write"; turn: number }
  | { name: "votePass"; turn: number }
  | { name: "vote"; turn: number }
  | { name: "applause" }
  | { name: "reveal" }
  | { name: "final" };
