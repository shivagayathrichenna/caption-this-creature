import { Avatar, Button, Card, Logo, Page, Segmented, Toggle } from "../components/ui";
import { BUILTIN_CREATURES, MAX_PLAYERS, PLAYER_COLORS, PLAYER_EMOJIS } from "../game/data";
import { minPlayers, uid } from "../game/logic";
import type { Player, Settings, SetupState } from "../game/types";
import { cn } from "../utils/cn";

export default function Setup({
  setup,
  setSetup,
  customCount,
  onStart,
  onBack,
  onLab,
}: {
  setup: SetupState;
  setSetup: (next: SetupState | ((prev: SetupState) => SetupState)) => void;
  customCount: number;
  onStart: () => void;
  onBack: () => void;
  onLab: () => void;
}) {
  const { players, settings } = setup;
  const need = minPlayers(settings.scoring);
  const tooFew = players.length < need;

  const setPlayers = (fn: (p: Player[]) => Player[]) => setSetup((s) => ({ ...s, players: fn(s.players) }));
  const setSettings = (patch: Partial<Settings>) => setSetup((s) => ({ ...s, settings: { ...s.settings, ...patch } }));

  const addPlayer = () =>
    setPlayers((ps) => {
      if (ps.length >= MAX_PLAYERS) return ps;
      const emoji = PLAYER_EMOJIS.find((e) => !ps.some((p) => p.emoji === e)) ?? PLAYER_EMOJIS[0];
      const color = PLAYER_COLORS.find((c) => !ps.some((p) => p.color === c)) ?? PLAYER_COLORS[0];
      return [...ps, { id: uid(), name: "", emoji, color }];
    });

  const cycleEmoji = (id: string) =>
    setPlayers((ps) =>
      ps.map((p) => {
        if (p.id !== id) return p;
        const taken = new Set(ps.filter((x) => x.id !== id).map((x) => x.emoji));
        let i = PLAYER_EMOJIS.indexOf(p.emoji);
        for (let n = 0; n < PLAYER_EMOJIS.length; n++) {
          i = (i + 1) % PLAYER_EMOJIS.length;
          if (!taken.has(PLAYER_EMOJIS[i])) break;
        }
        return { ...p, emoji: PLAYER_EMOJIS[i] };
      }),
    );

  const deckOptions = [
    { value: "mix" as const, label: `Mix (${BUILTIN_CREATURES.length + customCount})`, disabled: customCount === 0, title: customCount === 0 ? "Add a creature in the Creature Lab to mix it in" : undefined },
    { value: "builtin" as const, label: `Built-in (${BUILTIN_CREATURES.length})` },
    { value: "custom" as const, label: `Mine only (${customCount})`, disabled: customCount === 0, title: customCount === 0 ? "Add a creature in the Creature Lab first" : undefined },
  ];
  // if the chosen deck is no longer available, treat it as built-in
  const deckValue = customCount === 0 ? "builtin" : settings.deck;

  return (
    <Page>
      <div className="mb-6 flex items-center justify-between">
        <Button variant="secondary" size="sm" onClick={onBack}>
          ← Back
        </Button>
        <Logo small />
      </div>

      <h1 className="font-display text-4xl font-bold">Set up the game</h1>

      <div className="mt-6 grid gap-6">
        {/* Players */}
        <Card>
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-bold">Who's playing?</h2>
            <span className="font-display text-sm font-semibold text-ink/60">
              {players.length}/{MAX_PLAYERS}
            </span>
          </div>
          <p className="text-sm text-ink/70">Tap an avatar to swap it. Names can be nicknames.</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {players.map((p, i) => (
              <li key={p.id} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => cycleEmoji(p.id)}
                  aria-label={`Change avatar for player ${i + 1}`}
                  className="cursor-pointer rounded-full transition-transform hover:scale-105 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-grape"
                >
                  <Avatar player={p} size="md" />
                </button>
                <input
                  value={p.name}
                  maxLength={14}
                  placeholder={`Player ${i + 1}`}
                  aria-label={`Name for player ${i + 1}`}
                  onChange={(e) => setPlayers((ps) => ps.map((x) => (x.id === p.id ? { ...x, name: e.target.value } : x)))}
                  className="min-w-0 flex-1 rounded-xl border-[3px] border-ink bg-cream px-3 py-2.5 font-display text-lg font-semibold placeholder:font-normal placeholder:text-ink/40 focus:bg-white focus:outline-4 focus:outline-offset-2 focus:outline-grape"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  aria-label={`Remove player ${i + 1}`}
                  disabled={players.length <= 2}
                  onClick={() => setPlayers((ps) => ps.filter((x) => x.id !== p.id))}
                >
                  ✕
                </Button>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <Button variant="mint" onClick={addPlayer} disabled={players.length >= MAX_PLAYERS}>
              + Add player
            </Button>
          </div>
        </Card>

        {/* Mode */}
        <Card>
          <h2 className="font-display text-2xl font-bold">How do you want to play?</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2" role="radiogroup" aria-label="Scoring mode">
            {[
              {
                scoring: true,
                emoji: "🏆",
                title: "Play for points",
                text: "Everyone votes secretly for their favourite caption (not their own). 100 pts per vote, +50 for the round winner. Needs 3+ players.",
                color: "bg-sunny",
              },
              {
                scoring: false,
                emoji: "😂",
                title: "Just for laughs",
                text: "No votes, no points, no leaderboard. Read the captions, react together, crown a favourite. Works with 2+ players.",
                color: "bg-mint",
              },
            ].map((m) => {
              const active = settings.scoring === m.scoring;
              return (
                <button
                  key={m.title}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSettings({ scoring: m.scoring })}
                  className={cn(
                    "cursor-pointer rounded-2xl border-[3px] border-ink p-4 text-left transition-all focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-grape",
                    active ? `${m.color} shadow-[0_5px_0_0_#2b2140]` : "bg-white hover:bg-cream",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{m.emoji}</span>
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full border-[3px] border-ink bg-white text-xs",
                      )}
                    >
                      {active ? "✓" : ""}
                    </span>
                  </div>
                  <div className="mt-1 font-display text-xl font-bold">{m.title}</div>
                  <p className="mt-1 text-sm font-semibold text-ink/75">{m.text}</p>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Options */}
        <Card className="grid gap-6">
          <h2 className="font-display text-2xl font-bold">Game options</h2>
          <div>
            <div className="mb-2 font-display text-base font-semibold">Rounds</div>
            <Segmented
              label="Number of rounds"
              value={settings.rounds}
              onChange={(rounds) => setSettings({ rounds })}
              options={[3, 5, 8, 10].map((n) => ({ value: n, label: `${n}` }))}
            />
          </div>
          <div>
            <div className="mb-1 font-display text-base font-semibold">Caption timer</div>
            <p className="mb-2 text-sm text-ink/70">Time each player gets to write. When it runs out, whatever you typed is sealed.</p>
            <Segmented
              label="Caption timer"
              value={settings.timer}
              onChange={(timer) => setSettings({ timer })}
              options={[
                { value: 0, label: "Off" },
                { value: 30, label: "30s" },
                { value: 60, label: "60s" },
                { value: 90, label: "90s" },
              ]}
            />
          </div>
          <div>
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
              <span className="font-display text-base font-semibold">Creature deck</span>
              <Button size="sm" variant="secondary" onClick={onLab}>
                🧪 Add your own creatures
              </Button>
            </div>
            <Segmented
              label="Creature deck"
              value={deckValue}
              onChange={(deck) => setSettings({ deck })}
              options={deckOptions}
            />
            {customCount === 0 && (
              <p className="mt-2 text-sm text-ink/70">
                Tip: invent custom prompts in the Creature Lab (like "A smug raccoon in a tiny crown") and they'll show up here.
              </p>
            )}
          </div>
          <Toggle
            checked={settings.showNames}
            onChange={(showNames) => setSettings({ showNames })}
            label="Show creature descriptions"
            hint="Turn off for a pure picture-only challenge."
          />
        </Card>
      </div>

      <div className="mt-8 flex flex-col items-center gap-3">
        {tooFew && (
          <p role="alert" className="rounded-xl border-[3px] border-ink bg-tomato/15 px-4 py-2 text-center font-semibold">
            Scoring needs at least {need} players. Add one more, or switch to "Just for laughs".
          </p>
        )}
        <Button size="lg" onClick={onStart} disabled={tooFew}>
          🚀 Let's go!
        </Button>
      </div>
    </Page>
  );
}
