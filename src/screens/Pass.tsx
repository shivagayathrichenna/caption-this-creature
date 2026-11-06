import { Avatar, Button, Page } from "../components/ui";
import type { Player } from "../game/types";

/** Privacy screen shown between turns: nothing from the previous player is visible. */
export default function Pass({
  player,
  mode,
  turn,
  total,
  banner,
  onReady,
}: {
  player: Player;
  mode: "write" | "vote";
  turn: number;
  total: number;
  banner?: string;
  onReady: () => void;
}) {
  return (
    <Page className="flex min-h-[80vh] max-w-xl flex-col items-center justify-center text-center">
      <div key={`${mode}-${turn}`} className="w-full animate-pop">
        {banner && (
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border-[3px] border-ink bg-mint px-4 py-1.5 font-display font-semibold">
            {banner}
          </div>
        )}
        <div className="text-sm font-bold uppercase tracking-widest text-ink/60">
          {mode === "write" ? "Caption" : "Voting"} · player {turn + 1} of {total}
        </div>
        <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Pass the device to</h1>
        <div className="mt-6 flex justify-center">
          <Avatar player={player} size="xl" className="animate-wiggle border-4" />
        </div>
        <div className="mt-4 font-display text-5xl font-bold" style={{ textShadow: `3px 3px 0 ${player.color}` }}>
          {player.name}
        </div>
        <p className="mx-auto mt-4 max-w-sm font-semibold text-ink/75">
          Everyone else: eyes away! {player.name}, tap below when the screen is only yours.
        </p>
        <div className="mt-8">
          <Button size="lg" onClick={onReady} autoFocus>
            I'm {player.name}. {mode === "write" ? "Show me the creature" : "Show me the captions"}
          </Button>
        </div>
      </div>
    </Page>
  );
}
