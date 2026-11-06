import CreatureView from "../components/CreatureView";
import { Avatar, Button, Page } from "../components/ui";
import type { Game } from "../game/types";

export default function Intro({
  game,
  onReroll,
  onStart,
}: {
  game: Game;
  onReroll: () => void;
  onStart: () => void;
}) {
  const round = game.rounds[game.roundIdx];
  const first = game.players.find((p) => p.id === round.writers[0])!;
  const isLast = game.roundIdx === game.rounds.length - 1;

  return (
    <Page className="max-w-2xl text-center">
      <div key={round.creature.id} className="animate-pop">
        <div className="font-display text-lg font-semibold uppercase tracking-widest text-grape">
          {isLast ? "Final round" : `Round ${game.roundIdx + 1}`}
        </div>
        <h1 className="mt-1 font-display text-4xl font-bold">Meet your creature!</h1>
        <div className="mx-auto mt-6 max-w-md">
          <CreatureView creature={round.creature} showName={game.settings.showNames} />
        </div>
      </div>

      <p className="mx-auto mt-8 max-w-md font-semibold text-ink/75">
        Everyone take a good look. Next, the device gets passed around so each player can write a caption in private.
      </p>

      <div className="mt-4 inline-flex items-center gap-2 rounded-full border-[3px] border-ink bg-white py-1 pl-1 pr-4 font-display font-semibold">
        <Avatar player={first} size="sm" className="border-2" />
        First up: {first.name}
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button variant="secondary" onClick={onReroll}>
          🎲 Different creature
        </Button>
        <Button size="lg" onClick={onStart}>
          Start passing →
        </Button>
      </div>
    </Page>
  );
}
