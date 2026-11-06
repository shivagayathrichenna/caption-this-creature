import { useState } from "react";
import CreatureView from "../components/CreatureView";
import { Avatar, Button, Card } from "../components/ui";
import type { Player, Round } from "../game/types";
import { cn } from "../utils/cn";

const LETTERS = "ABCDEFGH";

export default function Vote({
  voter,
  round,
  showNames,
  onVote,
}: {
  voter: Player;
  round: Round;
  showNames: boolean;
  onVote: (authorId: string) => void;
}) {
  const [pick, setPick] = useState<string | null>(null);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-16 pt-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border-[3px] border-ink bg-white py-1 pl-1 pr-4 font-display font-semibold shadow-[0_3px_0_0_#2b2140]">
          <Avatar player={voter} size="sm" className="border-2" />
          {voter.name}'s secret ballot
        </div>
        <div className="inline-flex items-center gap-1 rounded-full border-[3px] border-ink bg-mint px-3 py-1 font-display text-sm font-semibold">
          🔒 Private
        </div>
      </div>

      <div className="grid items-start gap-6 md:grid-cols-[280px_1fr]">
        <div className="mx-auto w-full max-w-[280px] md:sticky md:top-4">
          <CreatureView creature={round.creature} showName={showNames} compact />
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold">Which caption is funniest?</h1>
          <p className="mt-1 font-semibold text-ink/70">Captions are anonymous. You can't vote for your own.</p>

          <ul className="mt-5 grid gap-3" role="radiogroup" aria-label="Captions">
            {round.order.map((authorId, i) => {
              const cap = round.captions.find((c) => c.playerId === authorId);
              if (!cap) return null;
              const mine = authorId === voter.id;
              const selected = pick === authorId;
              return (
                <li key={authorId}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={mine}
                    onClick={() => setPick(authorId)}
                    className={cn(
                      "flex w-full cursor-pointer items-start gap-3 rounded-2xl border-[3px] border-ink p-4 text-left transition-all",
                      "focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-grape",
                      selected ? "-translate-y-0.5 bg-sunny shadow-[0_5px_0_0_#2b2140]" : "bg-white shadow-[0_3px_0_0_#2b2140] hover:-translate-y-0.5 hover:bg-cream",
                      mine && "cursor-not-allowed border-dashed bg-ink/5 opacity-60 shadow-none hover:translate-y-0 hover:bg-ink/5",
                    )}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[3px] border-ink bg-white font-display font-bold">
                      {LETTERS[i]}
                    </span>
                    <span className="flex-1 break-words font-display text-xl font-medium leading-snug">
                      {cap.text}
                      {mine && <span className="mt-1 block text-sm font-semibold text-ink/70">That's yours. Can't vote for it!</span>}
                    </span>
                    {selected && <span className="text-2xl">👍</span>}
                  </button>
                </li>
              );
            })}
          </ul>

          <Card className="mt-6 flex flex-wrap items-center justify-between gap-3 bg-cream">
            <span className="font-semibold text-ink/75">
              {pick ? "Happy with your pick?" : "Tap a caption to choose it."}
            </span>
            <Button size="lg" disabled={!pick} onClick={() => pick && onVote(pick)}>
              🗳️ Lock in my vote
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
