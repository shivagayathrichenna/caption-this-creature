import { useState } from "react";
import CreatureView from "../components/CreatureView";
import { Button, Card, Logo, Page } from "../components/ui";
import { TWISTS } from "../creature/spec";
import { BUILTIN_CREATURES, EXAMPLE_PROMPTS, MAX_PROMPT } from "../game/data";
import { uid } from "../game/logic";
import type { Creature } from "../game/types";
import { cn } from "../utils/cn";

const newSeed = () => Math.floor(Math.random() * 90000) + 100;

export default function Lab({
  custom,
  onAdd,
  onDelete,
  onBack,
}: {
  custom: Creature[];
  onAdd: (c: Creature) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}) {
  const [text, setText] = useState("");
  const [twists, setTwists] = useState<string[]>([]);
  const [seed, setSeed] = useState(newSeed);
  const [flash, setFlash] = useState<string | null>(null);

  const clean = text.trim().replace(/\s+/g, " ");
  const canAdd = clean.length >= 3;
  const preview = { name: clean || "A mystery creature", seed, twists };

  const toggleTwist = (id: string) => setTwists((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));

  const add = () => {
    if (!canAdd) return;
    onAdd({ id: `c-${uid()}`, name: clean, seed, twists, custom: true });
    setFlash(`"${clean}" joined the deck!`);
    setText("");
    setTwists([]);
    setSeed(newSeed());
    window.setTimeout(() => setFlash(null), 2800);
  };

  return (
    <Page>
      <div className="mb-6 flex items-center justify-between">
        <Button variant="secondary" size="sm" onClick={onBack}>
          ← Back
        </Button>
        <Logo small />
      </div>

      <h1 className="font-display text-4xl font-bold">🧪 Creature Lab</h1>
      <p className="mt-1 max-w-2xl font-semibold text-ink/75">
        Describe any creature and the lab draws it. Words like "frog", "wizard", "angry", "sunglasses" or "tentacles" change how it
        looks. Shuffle until it's perfectly odd.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_320px]">
        <Card className="order-2 md:order-1">
          <label htmlFor="prompt" className="font-display text-xl font-bold">
            Your creature prompt
          </label>
          <div className="mt-2">
            <textarea
              id="prompt"
              value={text}
              maxLength={MAX_PROMPT}
              rows={2}
              placeholder="e.g. A nervous purple penguin who just saw the bill"
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  add();
                }
              }}
              className="w-full resize-none rounded-2xl border-[3px] border-ink bg-cream px-4 py-3 font-display text-lg font-medium placeholder:text-ink/40 focus:bg-white focus:outline-4 focus:outline-offset-2 focus:outline-grape"
            />
            <div className="mt-1 text-right text-xs font-semibold text-ink/60">
              {text.length}/{MAX_PROMPT}
            </div>
          </div>

          <div className="mt-2">
            <div className="mb-2 text-sm font-bold text-ink/70">Need ideas? Tap one:</div>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setText(p)}
                  className="cursor-pointer rounded-full border-2 border-ink bg-white px-3 py-1 text-sm font-semibold transition-colors hover:bg-sunny/50 focus-visible:outline-4 focus-visible:outline-grape"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-2 font-display text-lg font-bold">Add a twist</div>
            <div className="flex flex-wrap gap-2">
              {TWISTS.map((t) => {
                const on = twists.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleTwist(t.id)}
                    className={cn(
                      "cursor-pointer rounded-xl border-[3px] border-ink px-3 py-1.5 font-display text-sm font-semibold transition-all focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-grape",
                      on ? "bg-mint shadow-[0_3px_0_0_#2b2140]" : "bg-white hover:bg-cream",
                    )}
                  >
                    {t.emoji} {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button onClick={add} disabled={!canAdd}>
              ➕ Add to my deck
            </Button>
            <Button variant="secondary" onClick={() => setSeed(newSeed())}>
              🎲 Shuffle look
            </Button>
            {flash && (
              <span role="status" className="animate-pop font-display font-semibold text-ink">
                ✅ {flash}
              </span>
            )}
          </div>
        </Card>

        <div className="order-1 md:order-2">
          <div className="md:sticky md:top-6">
            <CreatureView creature={preview} showName={false} />
            <p className="mt-3 text-center font-display font-semibold text-ink/70">Live preview</p>
          </div>
        </div>
      </div>

      <section className="mt-12" aria-labelledby="mine">
        <h2 id="mine" className="font-display text-2xl font-bold">
          My creatures ({custom.length})
        </h2>
        {custom.length === 0 ? (
          <Card className="mt-3 text-center text-ink/70">
            <div className="text-4xl">🥚</div>
            <p className="mt-1 font-semibold">Nothing hatched yet. Your custom creatures will appear here and get saved on this device.</p>
          </Card>
        ) : (
          <ul className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
            {custom.map((c) => (
              <li key={c.id} className="relative">
                <CreatureView creature={c} compact />
                <button
                  type="button"
                  aria-label={`Delete ${c.name}`}
                  onClick={() => onDelete(c.id)}
                  className="absolute -right-2 -top-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-[3px] border-ink bg-tomato text-sm font-bold text-white shadow-[0_2px_0_0_#2b2140] hover:scale-110 focus-visible:outline-4 focus-visible:outline-grape"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <details className="group mt-12">
        <summary className="cursor-pointer list-none font-display text-2xl font-bold marker:hidden">
          <span className="inline-block transition-transform group-open:rotate-90">▸</span> Built-in creatures ({BUILTIN_CREATURES.length})
        </summary>
        <ul className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
          {BUILTIN_CREATURES.map((c) => (
            <li key={c.id}>
              <CreatureView creature={c} compact />
            </li>
          ))}
        </ul>
      </details>
    </Page>
  );
}
