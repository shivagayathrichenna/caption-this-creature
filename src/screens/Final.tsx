import { useState } from "react";
import CreatureView from "../components/CreatureView";
import { Avatar, Button, Card, Logo, Page, PlayerChip, SpeechBubble } from "../components/ui";
import { standings, tallyRound } from "../game/logic";
import type { Game } from "../game/types";
import { cn } from "../utils/cn";

export default function Final({
  game,
  onAgain,
  onSetup,
  onHome,
}: {
  game: Game;
  onAgain: () => void;
  onSetup: () => void;
  onHome: () => void;
}) {
  const scoring = game.settings.scoring;
  const byId = Object.fromEntries(game.players.map((p) => [p.id, p]));
  const [copied, setCopied] = useState<"ok" | "fail" | null>(null);

  const board = standings(game);
  const topPoints = board[0]?.points ?? 0;
  const champs = board.filter((b) => b.points === topPoints);
  // dense-ish ranking so ties share a place
  const ranked = board.map((b) => ({ ...b, place: board.filter((x) => x.points > b.points).length + 1 }));
  const podium = [ranked.find((r) => r.place === 2), ranked.find((r) => r.place === 1), ranked.find((r) => r.place === 3)];
  const podiumHeights = ["h-28", "h-40", "h-20"];
  const medals = ["🥈", "🥇", "🥉"];

  const copy = async () => {
    const text = game.rounds
      .map((r, i) => {
        const lines = r.order
          .map((id) => r.captions.find((c) => c.playerId === id))
          .filter((c): c is NonNullable<typeof c> => Boolean(c))
          .map((c) => `  - "${c.text}" (${byId[c.playerId].name})${!scoring && r.crown === c.playerId ? " 👑" : ""}`);
        return `Round ${i + 1}: ${r.creature.name}\n${lines.join("\n")}`;
      })
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(`Caption This Creature\n\n${text}`);
      setCopied("ok");
    } catch {
      setCopied("fail");
    }
    window.setTimeout(() => setCopied(null), 2500);
  };

  return (
    <Page className="max-w-5xl pt-8">
      <div className="text-center">
        <Logo small />
        {scoring ? (
          <>
            <div className="mt-6 animate-wiggle text-6xl">🎉</div>
            <h1 className="mt-2 animate-pop font-display text-4xl font-bold sm:text-5xl">
              {champs.length === 1 ? `${champs[0].player.name} is the Caption Champion!` : `${champs.map((c) => c.player.name).join(" & ")} share the crown!`}
            </h1>
            <p className="mt-2 font-semibold text-ink/70">{game.rounds.length} creatures captioned. Great work, everyone.</p>
          </>
        ) : (
          <>
            <div className="mt-6 animate-wiggle text-6xl">😂</div>
            <h1 className="mt-2 animate-pop font-display text-4xl font-bold sm:text-5xl">That's a wrap!</h1>
            <p className="mt-2 font-semibold text-ink/70">
              {game.rounds.length} creatures, zero scores, all the laughs. Here's your gallery of greatest hits.
            </p>
          </>
        )}
      </div>

      {scoring && (
        <>
          <div className="mx-auto mt-10 flex max-w-xl items-end justify-center gap-3">
            {podium.map((p, i) =>
              p ? (
                <div key={p.player.id} className="flex flex-1 animate-rise flex-col items-center" style={{ animationDelay: `${(2 - i) * 200}ms` }}>
                  <Avatar player={p.player} size={i === 1 ? "lg" : "md"} />
                  <div className="mt-1 max-w-full truncate font-display font-bold">{p.player.name}</div>
                  <div className="font-display text-sm font-semibold text-ink/70">{p.points} pts</div>
                  <div
                    className={cn(
                      "mt-2 flex w-full items-start justify-center rounded-t-2xl border-[3px] border-b-0 border-ink pt-2 text-3xl",
                      podiumHeights[i],
                    )}
                    style={{ background: p.player.color }}
                  >
                    {medals[i]}
                  </div>
                </div>
              ) : (
                <div key={i} className="flex-1" />
              ),
            )}
          </div>
          <div className="mx-auto h-[3px] max-w-xl bg-ink" />

          <Card className="mx-auto mt-8 max-w-xl">
            <h2 className="font-display text-2xl font-bold">Final standings</h2>
            <ol className="mt-3 grid gap-2">
              {ranked.map((r) => (
                <li key={r.player.id} className="flex items-center gap-3">
                  <span className="w-6 text-center font-display text-lg font-bold text-ink/60">{r.place}</span>
                  <Avatar player={r.player} size="sm" />
                  <span className="flex-1 truncate font-display text-lg font-semibold">{r.player.name}</span>
                  <span className="font-display text-xl font-bold">{r.points}</span>
                </li>
              ))}
            </ol>
          </Card>
        </>
      )}

      <section className="mt-12" aria-labelledby="gallery">
        <h2 id="gallery" className="font-display text-3xl font-bold">
          {scoring ? "Hall of fame: round winners" : "The gallery"}
        </h2>
        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          {game.rounds.map((r, i) => {
            const tally = tallyRound(r);
            const shown = scoring
              ? tally.filter((t) => t.winner)
              : tally.filter((t) => t.playerId === r.crown).length
                ? tally.filter((t) => t.playerId === r.crown)
                : tally;
            return (
              <Card key={i} className="p-4">
                <div className="flex gap-4">
                  <div className="w-28 shrink-0 sm:w-32">
                    <CreatureView creature={r.creature} showName={false} compact />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold uppercase tracking-widest text-ink/60">Round {i + 1}</div>
                    {game.settings.showNames && <div className="font-display font-bold leading-tight">{r.creature.name}</div>}
                  </div>
                </div>
                <div className="mt-4 grid gap-3">
                  {shown.map((t) => (
                    <div key={t.playerId}>
                      <SpeechBubble tail="none" className={cn("break-words text-base shadow-none", !scoring && r.crown === t.playerId && "bg-sunny")}>
                        {t.text}
                      </SpeechBubble>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <PlayerChip player={byId[t.playerId]} />
                        {scoring && <span className="font-display text-sm font-semibold">🏆 {t.votes} vote{t.votes === 1 ? "" : "s"}</span>}
                        {!scoring && r.crown === t.playerId && <span className="font-display text-sm font-semibold">👑 group favourite</span>}
                      </div>
                    </div>
                  ))}
                </div>
                {!scoring && shown.length > 1 && <p className="mt-2 text-xs font-semibold text-ink/60">No favourite crowned; all captions shown.</p>}
              </Card>
            );
          })}
        </div>
      </section>

      <div className="mt-12 flex flex-wrap justify-center gap-3">
        <Button size="lg" onClick={onAgain}>
          🔁 Play again
        </Button>
        <Button size="lg" variant="secondary" onClick={onSetup}>
          ⚙️ Change setup
        </Button>
        <Button size="lg" variant="secondary" onClick={copy}>
          📋 Copy all captions
        </Button>
        <Button size="lg" variant="ghost" onClick={onHome}>
          Home
        </Button>
      </div>
      <p role="status" className="mt-3 h-6 text-center font-semibold">
        {copied === "ok" && "Copied to your clipboard! ✅"}
        {copied === "fail" && "Couldn't copy on this browser. Try selecting the text instead."}
      </p>
    </Page>
  );
}
