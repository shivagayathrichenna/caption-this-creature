import { BUILTIN_CREATURES, POINTS_PER_VOTE, WINNER_BONUS } from "./data";
import type { Creature, Game, Player, Round, Settings } from "./types";

export const uid = () => Math.random().toString(36).slice(2, 9);

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function rotate<T>(arr: readonly T[], n: number): T[] {
  if (!arr.length) return [];
  const k = ((n % arr.length) + arr.length) % arr.length;
  return [...arr.slice(k), ...arr.slice(0, k)];
}

/** Makes sure every player has a unique, non-empty name. */
export function normalizePlayers(players: Player[]): Player[] {
  const seen = new Map<string, number>();
  return players.map((p, i) => {
    let name = p.name.trim().replace(/\s+/g, " ") || `Player ${i + 1}`;
    const key = name.toLowerCase();
    const n = (seen.get(key) ?? 0) + 1;
    seen.set(key, n);
    if (n > 1) name = `${name} ${n}`;
    return { ...p, name };
  });
}

export function minPlayers(scoring: boolean) {
  return scoring ? 3 : 2;
}

export function buildPool(settings: Settings, custom: Creature[]): Creature[] {
  if (settings.deck === "custom" && custom.length) return custom;
  if (settings.deck === "mix" && custom.length) return [...BUILTIN_CREATURES, ...custom];
  return BUILTIN_CREATURES;
}

function makeRound(creature: Creature, players: Player[], index: number): Round {
  const ids = players.map((p) => p.id);
  return {
    creature,
    writers: rotate(ids, index),
    captions: [],
    order: shuffle(ids),
    votes: {},
    reactions: {},
    crown: null,
  };
}

export function newGame(players: Player[], settings: Settings, custom: Creature[]): Game {
  const pool = shuffle(buildPool(settings, custom));
  const rounds: Round[] = [];
  for (let i = 0; i < settings.rounds; i++) {
    const base = pool[i % pool.length];
    const cycle = Math.floor(i / pool.length);
    // if the deck is smaller than the game, repeat creatures with a fresh look
    const creature = cycle ? { ...base, id: `${base.id}-${cycle}`, seed: base.seed + cycle * 7777 } : base;
    rounds.push(makeRound(creature, players, i));
  }
  return { players, settings, rounds, spare: pool.slice(settings.rounds), roundIdx: 0 };
}

/** Swap the current round's creature for another one (before anyone has captioned). */
export function rerollCreature(game: Game): Game {
  const round = game.rounds[game.roundIdx];
  if (!round || round.captions.length) return game;
  let next: Creature;
  let spare = game.spare;
  if (spare.length) {
    next = spare[0];
    spare = [...spare.slice(1), round.creature];
  } else {
    // nothing left in the deck: same prompt, brand-new look
    next = { ...round.creature, id: `${round.creature.id}-r${uid()}`, seed: Math.floor(Math.random() * 100000) };
  }
  return {
    ...game,
    spare,
    rounds: game.rounds.map((r, i) => (i === game.roundIdx ? { ...r, creature: next } : r)),
  };
}

export interface Tally {
  playerId: string;
  text: string;
  votes: number;
  voters: string[];
  points: number;
  winner: boolean;
}

export function isRoundScored(round: Round, players: Player[]) {
  return Object.keys(round.votes).length >= players.length && players.length > 0;
}

/** Captions sorted best-first with the points each earned. */
export function tallyRound(round: Round): Tally[] {
  const rows = round.order
    .map((id) => round.captions.find((c) => c.playerId === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .map((c) => {
      const voters = Object.entries(round.votes)
        .filter(([, author]) => author === c.playerId)
        .map(([voter]) => voter);
      return { playerId: c.playerId, text: c.text, votes: voters.length, voters, points: 0, winner: false };
    });
  const max = Math.max(0, ...rows.map((r) => r.votes));
  for (const r of rows) {
    r.winner = max > 0 && r.votes === max;
    r.points = r.votes * POINTS_PER_VOTE + (r.winner ? WINNER_BONUS : 0);
  }
  return rows.sort((a, b) => b.votes - a.votes);
}

export function totals(game: Game): Record<string, number> {
  const out: Record<string, number> = Object.fromEntries(game.players.map((p) => [p.id, 0]));
  for (const round of game.rounds) {
    if (!isRoundScored(round, game.players)) continue;
    for (const t of tallyRound(round)) out[t.playerId] += t.points;
  }
  return out;
}

export function standings(game: Game) {
  const t = totals(game);
  return game.players
    .map((p) => ({ player: p, points: t[p.id] ?? 0 }))
    .sort((a, b) => b.points - a.points);
}

export function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
