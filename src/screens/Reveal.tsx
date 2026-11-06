import CreatureView from "../components/CreatureView";
import { Avatar, Button, Card, PlayerChip, SpeechBubble } from "../components/ui";
import { POINTS_PER_VOTE, WINNER_BONUS } from "../game/data";
import { standings, tallyRound } from "../game/logic";
import type { Game } from "../game/types";
import { cn } from "../utils/cn";

export default function Reveal({ game, onNext }: { game: Game; onNext: () => void }) {
  const round = game.rounds[game.roundIdx];
  const isLast = game.roundIdx === game.rounds.length - 1;
  const tally = tallyRound(round);
  const winners = tally.filter((t) => t.winner);
  const byId = Object.fromEntries(game.players.map((p) => [p.id, p]));
  const board = standings(game);
  const top = Math.max(1, ...board.map((b) => b.points));

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-16 pt-6">
      <div className="text-center">
        <div className="font-display text-lg font-semibold uppercase tracking-widest text-grape">Round {game.roundIdx + 1} results</div>
        <h1 className="mt-1 animate-pop font-display text-4xl font-bold">
          {winners.length === 1 ? `🏆 ${byId[winners[0].playerId].name} wins the round!` : "🤝 It's a tie!"}
        </h1>
      </div>

      <div className="mt-6 grid items-start gap-6 md:grid-cols-[260px_1fr]">
        <div className="mx-auto w-full max-w-[260px]">
          <CreatureView creature={round.creature} showName={game.settings.showNames} compact />
        </div>

        <div className="grid gap-4">
          {tally.map((t, i) => {
            const author = byId[t.playerId];
            return (
              <div
                key={t.playerId}
                className="animate-rise"
                style={{ animationDelay: `${(tally.length - 1 - i) * 220}ms` }}
              >
                <Card className={cn("p-4", t.winner && "bg-sunny")}>
                  <div className="flex items-start gap-3">
                    <Avatar player={author} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="font-display text-lg font-bold">{author.name}</span>
                        {t.winner && <span className="rounded-full border-2 border-ink bg-white px-2 text-sm font-semibold">🏆 Winner</span>}
                      </div>
                      <SpeechBubble tail="none" className="mt-2 break-words shadow-none">
                        {t.text}
                      </SpeechBubble>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {t.voters.length === 0 ? (
                          <span className="text-sm font-semibold text-ink/60">No votes. Tough crowd.</span>
                        ) : (
                          <>
                            <span className="text-sm font-semibold text-ink/70">Voted by</span>
                            {t.voters.map((v) => (
                              <PlayerChip key={v} player={byId[v]} />
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="font-display text-2xl font-bold">+{t.points}</div>
                      <div className="text-xs font-semibold text-ink/60">
                        {t.votes} × {POINTS_PER_VOTE}
                        {t.winner ? ` + ${WINNER_BONUS}` : ""}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      <Card className="mt-8 animate-rise" style={{ animationDelay: `${tally.length * 220 + 150}ms` }}>
        <h2 className="font-display text-2xl font-bold">Scoreboard</h2>
        <ol className="mt-4 grid gap-3">
          {board.map((b, i) => (
            <li key={b.player.id} className="flex items-center gap-3">
              <span className="w-6 text-center font-display text-lg font-bold text-ink/60">{i + 1}</span>
              <Avatar player={b.player} size="sm" />
              <span className="w-24 truncate font-display font-semibold sm:w-32">{b.player.name}</span>
              <div className="h-6 flex-1 overflow-hidden rounded-full border-[3px] border-ink bg-cream">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${(b.points / top) * 100}%`, background: b.player.color }}
                />
              </div>
              <span className="w-16 text-right font-display text-lg font-bold">{b.points}</span>
            </li>
          ))}
        </ol>
      </Card>

      <div className="mt-8 text-center">
        <Button size="lg" onClick={onNext}>
          {isLast ? "🏁 See final results" : "Next creature →"}
        </Button>
      </div>
    </div>
  );
}
