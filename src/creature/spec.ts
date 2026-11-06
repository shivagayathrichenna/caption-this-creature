import { hashString, makeRng } from "./rng";

export type BodyShape = "round" | "egg" | "bean" | "pear" | "blob" | "tall";
export type Pattern = "none" | "spots" | "stripes" | "zigzag" | "dots";
export type HeadShape = "round" | "wide" | "square";
export type Ears = "none" | "pointy" | "round" | "long" | "floppy";
export type Topper = "none" | "horns" | "antlers" | "unihorn" | "antennae";
export type Hat =
  | "none"
  | "top"
  | "party"
  | "crown"
  | "propeller"
  | "chef"
  | "wizard"
  | "cowboy"
  | "beanie"
  | "flower";
export type Eyes =
  | "googly"
  | "dot"
  | "sleepy"
  | "wide"
  | "cyclops"
  | "three"
  | "stalks"
  | "spiral"
  | "lidded"
  | "wink";
export type Brows = "none" | "angry" | "worried" | "flat";
export type Mouth =
  | "smile"
  | "grin"
  | "beak"
  | "o"
  | "buck"
  | "tongue"
  | "fangs"
  | "mustache"
  | "snout"
  | "tusks"
  | "flat";
export type Specs = "none" | "round" | "sun" | "monocle";
export type Neckwear = "none" | "bowtie" | "scarf";
export type Legs = "two" | "four" | "tentacles" | "stilts" | "six" | "none";
export type Arms = "none" | "stubby" | "noodle" | "tiny" | "wings";
export type Tail = "none" | "curl" | "fluffy" | "spike" | "fish" | "lightning";

export interface CreatureSpec {
  seed: number;
  palette: number;
  bg: number;
  body: BodyShape;
  pattern: Pattern;
  belly: boolean;
  merged: boolean;
  headShape: HeadShape;
  headScale: number;
  neck: number;
  ears: Ears;
  topper: Topper;
  hat: Hat;
  hatTiny: boolean;
  eyes: Eyes;
  brows: Brows;
  mouth: Mouth;
  blush: boolean;
  whiskers: boolean;
  specs: Specs;
  neckwear: Neckwear;
  legs: Legs;
  arms: Arms;
  tail: Tail;
  tailSide: 1 | -1;
  spikes: boolean;
  shell: boolean;
}

export const PALETTES = [
  { name: "green", body: "#7BD389", belly: "#E4F7C8", accent: "#3FA55B", spot: "#4CB86B" },
  { name: "pink", body: "#FF9BB8", belly: "#FFE3EC", accent: "#E5628A", spot: "#FF6F9C" },
  { name: "purple", body: "#B79BFF", belly: "#EEE5FF", accent: "#7E5BEF", spot: "#8E6BF5" },
  { name: "blue", body: "#6EC6FF", belly: "#DDF3FF", accent: "#2F8FE0", spot: "#3F9CF0" },
  { name: "orange", body: "#FFA85C", belly: "#FFE6C7", accent: "#E8761F", spot: "#F28B33" },
  { name: "red", body: "#FF6B6B", belly: "#FFD9D6", accent: "#D63D3D", spot: "#E24F4F" },
  { name: "yellow", body: "#FFD84D", belly: "#FFF4C2", accent: "#E5A800", spot: "#F2B90F" },
  { name: "teal", body: "#4FD1C5", belly: "#D5F7F2", accent: "#1E9C91", spot: "#2BB5A8" },
  { name: "brown", body: "#C99A6B", belly: "#F2E0C9", accent: "#8E6238", spot: "#A97748" },
  { name: "gray", body: "#B8B5C9", belly: "#EFEEF6", accent: "#7C7894", spot: "#908CAA" },
] as const;

export const BACKGROUNDS = [
  "#FFE9A8",
  "#CFF5E3",
  "#D9ECFF",
  "#FFD9E6",
  "#E6DBFF",
  "#FFDDC4",
  "#D3F3F6",
  "#F3F0B5",
] as const;

const COLOR_WORDS: [RegExp, number][] = [
  [/\b(?:green|slimy|mint)\b/, 0],
  [/\b(?:pink|pinkish)\b/, 1],
  [/\b(?:purple|violet|grape)\b/, 2],
  [/\b(?:blue|azure)\b/, 3],
  [/\b(?:orange|carrot)\b/, 4],
  [/\b(?:red|crimson|fiery)\b/, 5],
  [/\b(?:yellow|golden|banana)\b/, 6],
  [/\b(?:teal|turquoise)\b/, 7],
  [/\b(?:brown|chocolate|muddy)\b/, 8],
  [/\b(?:gr[ae]y|silver|smoky)\b/, 9],
];

type Patch = Partial<CreatureSpec>;
type Rng = ReturnType<typeof makeRng>;

// whole-word match (with optional plural)
const sp = (...w: string[]) => new RegExp(`\\b(?:${w.join("|")})(?:s|es)?\\b`);
// word-start match (stems like "judg" -> "judgmental")
const wd = (...w: string[]) => new RegExp(`\\b(?:${w.join("|")})`);

// Species keywords nudge the drawing so "a grumpy frog" actually looks froggy.
const SPECIES: [RegExp, Patch][] = [
  [sp("frog", "toad", "newt", "axolotl"), { eyes: "stalks", mouth: "grin", legs: "two", ears: "none", topper: "none", palette: 0, body: "blob", merged: true, tail: "none", whiskers: false }],
  [sp("cat", "kitten", "kitty", "lynx", "tiger", "lion", "cheetah", "panther"), { neck: 0, ears: "pointy", whiskers: true, mouth: "smile", tail: "curl", legs: "four", merged: false, topper: "none" }],
  [sp("dog", "puppy", "pup", "corgi", "wolf", "hound", "pug"), { neck: 0, ears: "floppy", mouth: "tongue", tail: "curl", legs: "four", palette: 8, topper: "none" }],
  [sp("bunny", "rabbit", "hare"), { neck: 0, ears: "long", mouth: "buck", tail: "fluffy", legs: "two", whiskers: true, palette: 9, topper: "none" }],
  [sp("hamster", "gerbil", "mouse", "mice", "rat", "capybara", "beaver", "guinea pig"), { neck: 0, ears: "round", mouth: "buck", body: "round", legs: "two", tail: "curl", whiskers: true, palette: 8, topper: "none" }],
  [sp("bear", "panda", "koala", "sloth", "raccoon"), { neck: 0, ears: "round", mouth: "snout", body: "round", legs: "four", palette: 8, topper: "none", whiskers: false }],
  [sp("duck", "duckling", "chicken", "hen", "goose", "parrot", "bird", "toucan", "pigeon", "seagull", "crow", "chick", "rooster", "turkey"), { mouth: "beak", arms: "wings", legs: "two", tail: "fluffy", ears: "none", topper: "none", eyes: "dot", whiskers: false }],
  [sp("flamingo", "heron", "stork", "crane", "ostrich"), { mouth: "beak", arms: "wings", legs: "stilts", palette: 1, neck: 80, body: "egg", ears: "none", topper: "none", whiskers: false, merged: false }],
  [sp("penguin"), { mouth: "beak", arms: "wings", legs: "two", body: "egg", palette: 3, belly: true, ears: "none", topper: "none", pattern: "none", whiskers: false }],
  [sp("owl", "moth", "bat"), { eyes: "wide", mouth: "beak", arms: "wings", legs: "two", ears: "pointy", palette: 8, topper: "none", whiskers: false }],
  [sp("fish", "shark", "whale", "trout", "koi", "piranha", "goldfish", "carp", "anglerfish", "dolphin"), { tail: "fish", legs: "none", mouth: "o", eyes: "googly", body: "bean", arms: "none", merged: true, ears: "none", topper: "none", whiskers: false }],
  [sp("octopus", "octopi", "squid", "kraken", "jellyfish", "cuttlefish"), { legs: "tentacles", body: "round", merged: true, arms: "none", palette: 2, tail: "none", ears: "none", topper: "none", spikes: false, whiskers: false }],
  [sp("goat", "sheep", "ram", "lamb", "cow", "bull", "ox", "yak"), { neck: 0, ears: "floppy", topper: "horns", legs: "four", mouth: "snout", whiskers: false }],
  [sp("llama", "alpaca", "camel", "giraffe"), { neck: 80, legs: "four", ears: "pointy", mouth: "snout", body: "egg", palette: 8, merged: false, topper: "none", whiskers: false }],
  [sp("deer", "moose", "elk", "reindeer"), { neck: 0, topper: "antlers", legs: "four", ears: "floppy", mouth: "snout", palette: 8, whiskers: false }],
  [sp("horse", "pony", "unicorn", "zebra"), { legs: "four", ears: "pointy", mouth: "snout", neck: 35, merged: false, topper: "none", whiskers: false }],
  [sp("unicorn"), { topper: "unihorn", palette: 1 }],
  [sp("snail", "slug"), { shell: true, legs: "none", eyes: "stalks", body: "bean", merged: true, ears: "none", topper: "none", mouth: "smile", arms: "none", whiskers: false, hat: "none" }],
  [sp("spider", "ant", "beetle", "bug", "cricket", "roach", "centipede", "cockroach", "flea"), { legs: "six", topper: "antennae", eyes: "three", ears: "none", mouth: "fangs", arms: "none", whiskers: false }],
  [sp("bee", "wasp", "butterfly", "ladybug", "firefly"), { legs: "six", topper: "antennae", arms: "wings", ears: "none", mouth: "smile", pattern: "stripes", palette: 6, whiskers: false }],
  [sp("dragon", "dino", "dinosaur", "rex", "lizard", "gecko", "crocodile", "gator", "alligator", "iguana", "chameleon", "snake", "serpent"), { spikes: true, tail: "spike", legs: "two", mouth: "fangs", palette: 0, arms: "tiny", ears: "none", whiskers: false }],
  [sp("walrus", "seal", "sea lion", "manatee"), { mouth: "tusks", body: "bean", legs: "none", palette: 8, ears: "none", arms: "stubby", topper: "none", whiskers: false }],
  [sp("pig", "piglet", "hog", "boar", "hippo", "rhino", "elephant"), { neck: 0, mouth: "snout", ears: "floppy", legs: "four", tail: "curl", palette: 1, topper: "none", whiskers: false }],
  [sp("worm", "caterpillar", "noodle"), { body: "tall", legs: "none", arms: "none", ears: "none", eyes: "dot", mouth: "smile", topper: "none", whiskers: false }],
  [sp("ghost", "spirit", "phantom", "cloud", "blob"), { legs: "none", arms: "noodle", body: "pear", merged: true, palette: 9, ears: "none", topper: "none", tail: "none", whiskers: false }],
  [sp("crab", "lobster", "shrimp", "scorpion"), { legs: "six", arms: "noodle", eyes: "stalks", palette: 5, body: "bean", merged: true, ears: "none", mouth: "flat", topper: "none", whiskers: false, hat: "none" }],
  [sp("fox", "squirrel", "chipmunk", "otter", "ferret"), { neck: 0, ears: "pointy", tail: "fluffy", whiskers: true, legs: "four", palette: 4, mouth: "smile", topper: "none" }],
  [sp("monkey", "ape", "gorilla", "chimp", "lemur"), { neck: 0, ears: "round", mouth: "grin", arms: "noodle", legs: "two", tail: "curl", palette: 8, topper: "none", whiskers: false }],
  [sp("robot", "bot", "cyborg", "machine"), { body: "tall", eyes: "wide", topper: "antennae", palette: 9, legs: "two", arms: "stubby", ears: "none", mouth: "flat", pattern: "none", whiskers: false, merged: false }],
];

const WORDS: [RegExp, Patch | ((rng: Rng) => Patch)][] = [
  [wd("goldfish"), { palette: 4 }],
  [wd("top hat", "tophat", "fancy", "posh", "gentle", "sir\\b", "lord\\b", "lady\\b", "mr\\b", "mrs\\b", "dr\\b", "professor", "tuxedo", "butler"), { hat: "top", neckwear: "bowtie", specs: "monocle" }],
  [wd("hats?\\b", "cap\\b"), (r) => ({ hat: r.pick(["top", "beanie", "cowboy", "party"] as Hat[]) })],
  [wd("crown", "kings?\\b", "queens?\\b", "royal", "regal", "prince", "majesty", "emperor"), { hat: "crown" }],
  [wd("wizard", "witch", "magic", "sorcer", "mystic", "spell"), { hat: "wizard" }],
  [wd("chef", "cook", "baker", "soup", "pizza", "pancake", "spaghetti", "cheese", "toast"), { hat: "chef" }],
  [wd("party", "birthday", "celebrat", "confetti", "disco"), { hat: "party" }],
  [wd("cowboy", "cowgirl", "sheriff", "western", "rodeo"), { hat: "cowboy" }],
  [wd("propeller", "helicopter", "pilot"), { hat: "propeller" }],
  [wd("flower", "garden", "bloom", "daisy"), { hat: "flower" }],
  [wd("beanie", "winter", "cold\\b", "frozen", "ice\\b", "snow"), { hat: "beanie", neckwear: "scarf" }],
  [wd("scarf"), { neckwear: "scarf" }],
  [wd("bow ?tie", "tie\\b", "business", "office", "tax(es)?\\b", "accountant", "lawyer", "boss", "manager", "meeting", "email", "corporate"), { neckwear: "bowtie", specs: "round" }],
  [wd("sunglasses", "cool\\b", "shades", "beach", "summer"), { specs: "sun" }],
  [wd("glasses", "nerd", "smart", "genius", "spectacles", "librar", "books?\\b", "study", "quiz"), { specs: "round" }],
  [wd("monocle"), { specs: "monocle" }],
  [wd("wings?\\b", "winged", "fairy", "angel"), { arms: "wings" }],
  [wd("tentacle"), { legs: "tentacles" }],
  [wd("horn", "devil", "demon"), { topper: "horns" }],
  [wd("antler"), { topper: "antlers" }],
  [wd("antenna", "alien", "martian", "cosmic", "space\\b"), { topper: "antennae", eyes: "three", palette: 0 }],
  [wd("three[- ]eye", "third eye", "3 eye", "many eyes"), { eyes: "three" }],
  [wd("one[- ]eye", "cyclops", "single eye"), { eyes: "cyclops" }],
  [wd("googly"), { eyes: "googly" }],
  [wd("sleepy", "tired", "nap\\b", "napping", "snooz", "yawn", "lazy", "exhaust"), { eyes: "sleepy", brows: "flat" }],
  [wd("bored", "judg", "disapprov", "unimpressed", "skeptic", "deadpan", "serious", "stern"), { eyes: "lidded", brows: "flat", mouth: "flat" }],
  [wd("hypno", "dizzy", "confus", "spiral", "lost\\b"), { eyes: "spiral" }],
  [wd("angry", "grumpy", "mad\\b", "furious", "evil", "villain", "menac", "suspicious", "rage"), { brows: "angry", mouth: "fangs" }],
  [wd("worried", "nervous", "anxious", "scared", "shy\\b", "sad\\b", "lonely", "sorry", "regret"), { brows: "worried", mouth: "o" }],
  [wd("fluffy", "fuzzy", "furry", "soft\\b", "cuddly"), { tail: "fluffy", blush: true }],
  [wd("spotted", "spots", "polka", "dotty", "leopard"), { pattern: "spots" }],
  [wd("striped", "stripes", "zebra", "tiger"), { pattern: "stripes" }],
  [wd("mustache", "moustache", "beard"), { mouth: "mustache" }],
  [wd("tall\\b", "long\\b", "lanky", "stretch"), { neck: 80 }],
  [wd("spiky", "spike", "thorn", "cactus", "punk"), { spikes: true }],
  [wd("tongue", "silly", "goofy", "lick", "cheeky"), { mouth: "tongue" }],
  [wd("teeth", "bite", "fang", "vampire"), { mouth: "fangs" }],
  [wd("floating", "float\\b", "levitat", "hover"), { legs: "none" }],
  [wd("tiny hat", "little hat", "small hat"), { hatTiny: true }],
];

export const TWISTS: { id: string; label: string; emoji: string; patch: Patch | ((rng: Rng) => Patch) }[] = [
  { id: "hat", label: "Silly hat", emoji: "🎩", patch: (r) => ({ hat: r.pick(["top", "party", "propeller", "beanie", "cowboy", "chef"] as Hat[]) }) },
  { id: "crown", label: "Crown", emoji: "👑", patch: { hat: "crown" } },
  { id: "wings", label: "Wings", emoji: "🪽", patch: { arms: "wings" } },
  { id: "glasses", label: "Glasses", emoji: "🤓", patch: { specs: "round" } },
  { id: "shades", label: "Shades", emoji: "😎", patch: { specs: "sun" } },
  { id: "eyes", label: "Extra eye", emoji: "👁️", patch: { eyes: "three" } },
  { id: "tentacles", label: "Tentacles", emoji: "🐙", patch: { legs: "tentacles" } },
  { id: "horns", label: "Horns", emoji: "😈", patch: { topper: "horns" } },
  { id: "stilts", label: "Long legs", emoji: "🦩", patch: { legs: "stilts" } },
  { id: "mustache", label: "Mustache", emoji: "🥸", patch: { mouth: "mustache" } },
];

export function buildSpec(text: string, seed: number, twists: string[] = []): CreatureSpec {
  const lower = text.toLowerCase();
  const r = makeRng(seed * 7919 + hashString(lower.slice(0, 3)));

  const bodyShapes: BodyShape[] = ["round", "egg", "bean", "pear", "blob", "tall"];
  const hats: Hat[] = ["top", "party", "crown", "propeller", "chef", "wizard", "cowboy", "beanie", "flower"];

  const spec: CreatureSpec = {
    seed,
    palette: r.int(0, PALETTES.length - 1),
    bg: r.int(0, BACKGROUNDS.length - 1),
    body: r.pick(bodyShapes),
    pattern: r.pick(["none", "none", "spots", "stripes", "zigzag", "dots"] as Pattern[]),
    belly: r.chance(0.55),
    merged: r.chance(0.35),
    headShape: r.pick(["round", "wide", "square"] as HeadShape[]),
    headScale: r.range(0.88, 1.12),
    neck: r.pick([0, 0, 0, 30, 70]),
    ears: r.pick(["none", "pointy", "round", "long", "floppy"] as Ears[]),
    topper: r.pick(["none", "none", "none", "horns", "antlers", "unihorn", "antennae"] as Topper[]),
    hat: r.chance(0.25) ? r.pick(hats) : "none",
    hatTiny: r.chance(0.2),
    eyes: r.pick(["googly", "googly", "dot", "sleepy", "wide", "cyclops", "three", "spiral", "wink", "lidded"] as Eyes[]),
    brows: r.pick(["none", "none", "angry", "worried", "flat"] as Brows[]),
    mouth: r.pick(["smile", "grin", "o", "buck", "tongue", "fangs", "mustache", "snout", "flat"] as Mouth[]),
    blush: r.chance(0.45),
    whiskers: r.chance(0.2),
    specs: r.chance(0.18) ? r.pick(["round", "sun", "monocle"] as Specs[]) : "none",
    neckwear: r.chance(0.2) ? r.pick(["bowtie", "scarf"] as Neckwear[]) : "none",
    legs: r.pick(["two", "four", "tentacles", "stilts", "six", "none", "two", "four"] as Legs[]),
    arms: r.pick(["none", "stubby", "noodle", "tiny", "wings"] as Arms[]),
    tail: r.pick(["none", "curl", "fluffy", "spike", "fish", "lightning"] as Tail[]),
    tailSide: r.chance(0.5) ? 1 : -1,
    spikes: r.chance(0.15),
    shell: false,
  };

  // species first, then descriptive words, then explicit twists (strongest)
  const patches: Patch[] = [];
  for (const [re, patch] of SPECIES) if (re.test(lower)) patches.push(patch.neck === undefined ? { ...patch, neck: 0 } : patch);
  for (const [re, patch] of WORDS) {
    if (re.test(lower)) patches.push(typeof patch === "function" ? patch(r) : patch);
  }
  for (const id of twists) {
    const t = TWISTS.find((x) => x.id === id);
    if (t) patches.push(typeof t.patch === "function" ? t.patch(r) : t.patch);
  }
  const speciesBeak = SPECIES.some(([re, p]) => re.test(lower) && p.mouth === "beak");
  for (const p of patches) Object.assign(spec, p);
  if (speciesBeak && ["o", "fangs", "flat"].includes(spec.mouth)) spec.mouth = "beak";

  // explicit colour words win over species defaults
  for (const [re, idx] of COLOR_WORDS) {
    if (re.test(lower)) {
      spec.palette = idx;
      break;
    }
  }

  // sanity rules to keep the drawing readable
  if (spec.eyes === "stalks" && spec.hat !== "none") spec.eyes = "googly";
  if (spec.topper !== "none" && spec.hat !== "none" && spec.topper !== "antennae") spec.topper = "none";
  if (spec.ears === "long" && spec.topper !== "none") spec.topper = "none";
  if (spec.mouth === "beak" || spec.mouth === "snout" || spec.mouth === "tusks") spec.whiskers = spec.whiskers && spec.mouth === "snout";
  if (spec.neck > 0) spec.merged = false;
  if (spec.mouth === "mustache" && spec.specs === "monocle") spec.specs = "round";
  if (spec.shell) spec.merged = true;
  if (spec.merged && spec.neckwear === "scarf") spec.neckwear = "bowtie";
  if (spec.legs === "stilts" && spec.neck === 0) spec.neck = 30;

  return spec;
}
