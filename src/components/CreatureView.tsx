import { useMemo } from "react";
import CreatureArt from "../creature/CreatureArt";
import { buildSpec } from "../creature/spec";
import type { Creature } from "../game/types";
import { cn } from "../utils/cn";

export function useCreatureSpec(creature: Pick<Creature, "name" | "seed" | "twists">) {
  const twistKey = (creature.twists ?? []).join(",");
  return useMemo(() => buildSpec(creature.name, creature.seed, creature.twists), [creature.name, creature.seed, twistKey]);
}

export default function CreatureView({
  creature,
  showName = true,
  className,
  frameClassName,
  compact = false,
}: {
  creature: Pick<Creature, "name" | "seed" | "twists">;
  showName?: boolean;
  className?: string;
  frameClassName?: string;
  compact?: boolean;
}) {
  const spec = useCreatureSpec(creature);
  return (
    <figure className={cn("m-0", className)}>
      <div
        className={cn(
          "overflow-hidden border-[3px] border-ink bg-white",
          compact ? "rounded-2xl shadow-[0_3px_0_0_#2b2140]" : "rounded-3xl shadow-[0_6px_0_0_#2b2140]",
          frameClassName,
        )}
      >
        <CreatureArt spec={spec} label={showName ? creature.name : "A strange creature"} className="block h-auto w-full" />
      </div>
      {showName && (
        <figcaption
          className={cn(
            "text-center font-display font-semibold leading-snug",
            compact ? "mt-2 text-sm" : "mt-4 text-xl",
          )}
        >
          {creature.name}
        </figcaption>
      )}
    </figure>
  );
}
