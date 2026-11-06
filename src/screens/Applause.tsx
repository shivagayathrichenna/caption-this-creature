import { useState } from "react";
import CreatureView from "../components/CreatureView";
import { Avatar, Button, Card } from "../components/ui";
import { REACTIONS } from "../game/data";
import type { Game } from "../game/types";
import { cn } from "../utils/cn";

const LETTERS = "ABCDEFGH";

/** The no-score "voting round": read the captions together, react, crown a favourite. Nothing is tallied. */
export default function Applause({
  game,
  onReact,
  onCrown,
  onNext,
}: {
  game: Game;
  onReact: (authorId: string, emoji: string) => void;
  onCrown: (authorId: string) => void;
  onNext: () => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const round = game.rounds[game.roundIdx];
  const isLast = game.roundIdx === game.rounds.length - 1;
  const byId = Object.fromEntries(game.players.map((p) => [p.id, p]));

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-16 pt-6">
      <div className="text-center">
        <div className="font-display text-lg font-semibold uppercase tracking-widest text-grape">Laugh round</div>
        <h1 className="mt-1 font-display text-4xl font-bold">
          {revealed ? "Here's who wrote what!" : "Read them out loud!"}
        </h1>
        <p className="mx-auto mt-2 max-w-lg font-semibold text-ink/70">
          {revealed
            ? "No points, just bragging rights. Crown your favourite if you like."
            : "Take turns reading each caption to the group. Tap reactions as you laugh, and crown the group favourite. Nothing is scored."}
        </p>
      </div>

      <div className="mt-6 grid items-start gap-6 md:grid-cols-[260px_1fr]">
        <div className="mx-auto w-full max-w-[260px] md:sticky md:top-4">
          <CreatureView creature={round.creature} showName={game.settings.showNames} compact />
        </div>

        <ul className="grid gap-4">
          {round.order.map((authorId, i) => {
            const cap = round.captions.find((c) => c.playerId === authorId);
            if (!cap) return null;
            const author = byId[authorId];
            const crowned = round.crown === authorId;
            const reacts = round.reactions[authorId] ?? {};
            return (
              <li key={authorId} className="animate-rise" style={{ animationDelay: `${i * 90}ms` }}>
                <Card className={cn("p-4", crowned && "bg-sunny")}>
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[3px] border-ink bg-white font-display font-bold">
                      {LETTERS[i]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="break-words font-display text-xl font-medium leading-snug">{cap.text}</p>
                      {revealed && (
                        <div className="mt-2 inline-flex animate-pop items-center gap-2 rounded-full border-2 border-ink bg-white py-0.5 pl-0.5 pr-3 font-display text-sm font-semibold">
                          <Avatar player={author} size="xs" className="border-2" />
                          {author.name}
                        </div>
                      )}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {REACTIONS.map((e) => (
                          <button
                            key={e}
                            type="button"
                            onClick={() => onReact(authorId, e)}
                            aria-label={`React ${e} to caption ${LETTERS[i]}`}
                            className="cursor-pointer rounded-full border-2 border-ink bg-white px-3 py-1 text-lg transition-transform hover:scale-110 active:scale-95 focus-visible:outline-4 focus-visible:outline-grape"
                          >
                            {e}
                            {reacts[e] ? <span className="ml-1 font-display text-sm font-bold">{reacts[e]}</span> : null}
                          </button>
                        ))}
                        <button
                          type="button"
                          aria-pressed={crowned}
                          onClick={() => onCrown(authorId)}
                          className={cn(
                            "ml-auto cursor-pointer rounded-full border-2 border-ink px-3 py-1 font-display text-sm font-semibold transition-colors focus-visible:outline-4 focus-visible:outline-grape",
                            crowned ? "bg-white" : "bg-cream hover:bg-white",
                          )}
                        >
                          👑 {crowned ? "Group favourite!" : "Crown it"}
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {!revealed ? (
          <Button size="lg" variant="mint" onClick={() => setRevealed(true)}>
            🎭 Reveal who wrote what
          </Button>
        ) : (
          <Button size="lg" onClick={onNext}>
            {isLast ? "🏁 Finish" : "Next creature →"}
          </Button>
        )}
      </div>
    </div>
  );
}
