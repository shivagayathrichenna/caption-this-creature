import type { Creature, Settings, SetupState } from "./types";

export const PLAYER_EMOJIS = ["🦊", "🐙", "🦄", "🐸", "🦖", "🐧", "🦉", "🐝"];
export const PLAYER_COLORS = ["#FF8FB1", "#4CC9F0", "#FFC933", "#3DDC97", "#B79BFF", "#FFA85C", "#FF6B6B", "#5EEAD4"];

export const MAX_PLAYERS = 8;
export const MAX_CAPTION = 120;
export const MAX_PROMPT = 80;

export const POINTS_PER_VOTE = 100;
export const WINNER_BONUS = 50;

export const REACTIONS = ["😂", "🤯", "🥹", "👏"];

export const FILLERS = [
  "…I panicked and said nothing.",
  "*awkward silence*",
  "[This caption was eaten by the creature]",
  "Ran out of time, kept the vibes.",
  "Words failed me. The creature understands.",
];

export const TIPS = [
  "What is the creature thinking right now?",
  "Give it a very specific, very boring job.",
  "What would its dating profile say?",
  "Imagine it just got an email. What does it say?",
  "What did it do that it's NOT sorry about?",
  "Write what it says to the camera.",
];

export const STARTERS = ["POV: ", "Nobody: … This creature: ", "Wanted for ", "Me at 3am: "];

export const EXAMPLE_PROMPTS = [
  "A smug raccoon in a tiny crown",
  "Orange cat who files taxes",
  "Three-eyed purple frog wizard",
  "Sad sloth in sunglasses",
  "Fancy goose with a mustache",
  "Tiny dragon who loves pancakes",
];

export const DEFAULT_SETTINGS: Settings = {
  scoring: true,
  rounds: 5,
  timer: 0,
  deck: "mix",
  showNames: true,
};

export function defaultSetup(): SetupState {
  return {
    players: [0, 1, 2].map((i) => ({
      id: `p${i}`,
      name: "",
      emoji: PLAYER_EMOJIS[i],
      color: PLAYER_COLORS[i],
    })),
    settings: DEFAULT_SETTINGS,
  };
}

const RAW: [string, number][] = [
  ["A disapproving hamster in a top hat", 11],
  ["Three-eyed frog wearing a crown", 138],
  ["Sleepy flamingo who does taxes", 211],
  ["Grumpy octopus chef", 318],
  ["Fluffy wizard goat", 404],
  ["Judgmental walrus with a mustache", 512],
  ["Anxious snail in a scarf", 623],
  ["Cool dragon in sunglasses", 705],
  ["Nervous purple penguin", 811],
  ["Space llama from Mars", 902],
  ["Giant spotted moth", 1017],
  ["Cowboy pig", 1103],
  ["Regal bunny with tiny wings", 1288],
  ["Hypnotized goldfish", 1304],
  ["Furious tiny robot", 1411],
  ["Banana-colored ghost", 1533],
  ["Birthday hippo who hates parties", 1609],
  ["Lanky giraffe in a beanie", 1722],
  ["Fancy sloth with a monocle", 1813],
  ["Confused chicken in sunglasses", 1927],
  ["Pink crab late for a meeting", 2011],
  ["Bored unicorn", 2128],
  ["Spotted dog with a propeller hat", 2239],
  ["Mustached bear baker", 2307],
  ["Cow wearing a tiny hat", 2411],
  ["Evil bee in a bowtie", 2548],
  ["Lonely caterpillar with glasses", 2655],
  ["Spiky fox with fangs", 2714],
  ["Sleepy penguin professor", 2833],
  ["Suspicious striped zebra", 2942],
  ["Lost blue jellyfish", 3051],
  ["Tuxedo cat who owns a library", 3166],
];

export const BUILTIN_CREATURES: Creature[] = RAW.map(([name, seed], i) => ({
  id: `b${i}`,
  name,
  seed,
}));
