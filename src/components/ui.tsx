import { useState, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../utils/cn";
import type { Player } from "../game/types";

const VARIANTS = {
  primary: "bg-sunny text-ink",
  secondary: "bg-white text-ink",
  mint: "bg-mint text-ink",
  sky: "bg-sky text-ink",
  grape: "bg-grape text-white",
  danger: "bg-tomato text-white",
  ghost: "border-transparent bg-transparent text-ink shadow-none hover:translate-y-0 hover:bg-ink/5 hover:shadow-none active:translate-y-0 active:shadow-none",
} as const;

const SIZES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-3 text-base",
  lg: "px-7 py-4 text-xl",
} as const;

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex cursor-pointer select-none items-center justify-center gap-2 rounded-2xl border-[3px] border-ink font-display font-semibold leading-tight",
        "shadow-[0_4px_0_0_#2b2140] transition-all duration-150",
        "hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_#2b2140]",
        "active:translate-y-[3px] active:shadow-[0_1px_0_0_#2b2140]",
        "focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-grape",
        "disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_0_0_#2b2140]",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    />
  );
}

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-3xl border-[3px] border-ink bg-white p-5 shadow-[0_6px_0_0_#2b2140]", className)}
      {...rest}
    />
  );
}

export function Badge({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border-2 border-ink bg-white px-3 py-1 font-display text-sm font-semibold",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Segmented<T extends string | number>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  label: string;
  options: { value: T; label: ReactNode; disabled?: boolean; title?: string }[];
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={o.disabled}
            title={o.title}
            onClick={() => onChange(o.value)}
            className={cn(
              "cursor-pointer rounded-xl border-[3px] border-ink px-4 py-2 font-display text-base font-semibold transition-all",
              "focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-grape",
              active ? "bg-sunny shadow-[0_3px_0_0_#2b2140]" : "bg-white hover:bg-cream",
              o.disabled && "cursor-not-allowed opacity-40 hover:bg-white",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="font-display text-base font-semibold">{label}</div>
        {hint && <div className="text-sm text-ink/70">{hint}</div>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-8 w-14 shrink-0 cursor-pointer rounded-full border-[3px] border-ink transition-colors",
          "focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-grape",
          checked ? "bg-mint" : "bg-white",
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-[3px] border-ink bg-white transition-all",
            checked ? "left-[calc(100%-1.5rem)]" : "left-0.5",
          )}
        />
      </button>
    </div>
  );
}

const AVATAR_SIZES = { xs: 28, sm: 38, md: 52, lg: 84, xl: 120 } as const;

export function Avatar({
  player,
  size = "md",
  className,
}: {
  player: Pick<Player, "emoji" | "color">;
  size?: keyof typeof AVATAR_SIZES;
  className?: string;
}) {
  const px = AVATAR_SIZES[size];
  return (
    <span
      aria-hidden
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full border-[3px] border-ink", className)}
      style={{ width: px, height: px, background: player.color, fontSize: px * 0.55, lineHeight: 1 }}
    >
      {player.emoji}
    </span>
  );
}

export function PlayerChip({ player, className }: { player: Player; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border-2 border-ink bg-white py-0.5 pl-0.5 pr-3 font-display text-sm font-semibold",
        className,
      )}
    >
      <Avatar player={player} size="xs" className="border-2" />
      {player.name}
    </span>
  );
}

export function Logo({ small = false }: { small?: boolean }) {
  return (
    <div className={cn("font-display font-bold leading-none tracking-tight", small ? "text-xl" : "text-5xl sm:text-6xl")}>
      <span className="text-ink">Caption </span>
      <span className="text-tomato">This </span>
      <span className="text-grape">Creature</span>
    </div>
  );
}

export function GameHeader({
  round,
  rounds,
  scoring,
  onQuit,
}: {
  round: number;
  rounds: number;
  scoring: boolean;
  onQuit: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3 px-4 pt-4">
        <div className="flex items-center gap-3">
          <span className="hidden sm:block">
            <Logo small />
          </span>
          <span aria-hidden className="text-3xl sm:hidden">
            🐾
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="whitespace-nowrap bg-white">
            Round {round}/{rounds}
          </Badge>
          <Badge className={cn("whitespace-nowrap", scoring ? "bg-sunny" : "bg-mint")}>
            {scoring ? "🏆 Points" : "😂 No scores"}
          </Badge>
          <Button size="sm" variant="secondary" onClick={() => setConfirm(true)} aria-label="Quit game">
            ✕
          </Button>
        </div>
      </header>
      {confirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Quit game?"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4"
        >
          <Card className="w-full max-w-sm animate-pop text-center">
            <div className="text-5xl">🙀</div>
            <h2 className="mt-2 font-display text-2xl font-bold">Leave the game?</h2>
            <p className="mt-1 text-ink/70">The creatures will miss you. Captions and scores from this game will be lost.</p>
            <div className="mt-5 flex justify-center gap-3">
              <Button variant="secondary" onClick={() => setConfirm(false)} autoFocus>
                Keep playing
              </Button>
              <Button variant="danger" onClick={onQuit}>
                Quit
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return <main className={cn("mx-auto w-full max-w-4xl px-4 pb-16 pt-6", className)}>{children}</main>;
}

export function SpeechBubble({
  children,
  className,
  tail = "bottom",
}: {
  children: ReactNode;
  className?: string;
  tail?: "bottom" | "none";
}) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border-[3px] border-ink bg-white px-4 py-3 font-display text-lg font-medium leading-snug shadow-[0_4px_0_0_#2b2140]",
        className,
      )}
    >
      {children}
      {tail === "bottom" && (
        <>
          <span className="absolute -bottom-[13px] left-8 h-5 w-5 rotate-45 border-b-[3px] border-r-[3px] border-ink bg-white" />
        </>
      )}
    </div>
  );
}
