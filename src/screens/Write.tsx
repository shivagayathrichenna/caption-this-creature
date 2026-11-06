import { useEffect, useRef, useState } from "react";
import CreatureView from "../components/CreatureView";
import { Avatar, Button, Card } from "../components/ui";
import { FILLERS, MAX_CAPTION, STARTERS, TIPS } from "../game/data";
import { pickRandom } from "../game/logic";
import type { Creature, Player } from "../game/types";
import { cn } from "../utils/cn";

export default function Write({
  player,
  creature,
  showNames,
  timer,
  onSubmit,
}: {
  player: Player;
  creature: Creature;
  showNames: boolean;
  timer: number;
  onSubmit: (text: string) => void;
}) {
  const [text, setText] = useState("");
  const [left, setLeft] = useState(timer);
  const [tip] = useState(() => pickRandom(TIPS));
  const textRef = useRef(text);
  const doneRef = useRef(false);
  const submitRef = useRef<(auto: boolean) => void>(() => {});
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textRef.current = text;
  }, [text]);

  useEffect(() => {
    submitRef.current = (auto: boolean) => {
      if (doneRef.current) return;
      const t = textRef.current.trim();
      if (!t && !auto) return;
      doneRef.current = true;
      onSubmit(t || pickRandom(FILLERS));
    };
  });

  useEffect(() => {
    if (!timer) return;
    const id = window.setInterval(() => setLeft((l) => l - 1), 1000);
    return () => window.clearInterval(id);
  }, [timer]);

  useEffect(() => {
    if (timer && left <= 0) submitRef.current(true);
  }, [left, timer]);

  const urgent = timer > 0 && left <= 10;
  const canSubmit = text.trim().length > 0;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-16 pt-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border-[3px] border-ink bg-white py-1 pl-1 pr-4 font-display font-semibold shadow-[0_3px_0_0_#2b2140]">
          <Avatar player={player} size="sm" className="border-2" />
          {player.name}'s caption
        </div>
        <div className="inline-flex items-center gap-1 rounded-full border-[3px] border-ink bg-mint px-3 py-1 font-display text-sm font-semibold">
          🔒 Private
        </div>
      </div>

      {timer > 0 && (
        <div className="mb-4" role="timer" aria-live="off">
          <div className="mb-1 flex justify-between font-display text-sm font-semibold">
            <span>Time left</span>
            <span className={cn(urgent && "animate-wiggle text-tomato")}>{Math.max(left, 0)}s</span>
          </div>
          <div className="h-4 overflow-hidden rounded-full border-[3px] border-ink bg-white">
            <div
              className={cn("h-full transition-all duration-1000 ease-linear", urgent ? "bg-tomato" : "bg-sky")}
              style={{ width: `${Math.max(0, (left / timer) * 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid items-start gap-6 md:grid-cols-2">
        <div className="mx-auto w-full max-w-sm">
          <CreatureView creature={creature} showName={showNames} />
        </div>

        <Card>
          <label htmlFor="caption" className="font-display text-2xl font-bold">
            Write your caption
          </label>
          <p className="mt-1 text-sm font-semibold text-ink/70">💡 {tip}</p>
          <textarea
            id="caption"
            ref={inputRef}
            autoFocus
            value={text}
            maxLength={MAX_CAPTION}
            rows={4}
            placeholder="Type something funny…"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                submitRef.current(false);
              }
            }}
            className="mt-3 w-full resize-none rounded-2xl border-[3px] border-ink bg-cream px-4 py-3 font-display text-xl font-medium leading-snug placeholder:text-ink/35 focus:bg-white focus:outline-4 focus:outline-offset-2 focus:outline-grape"
          />
          <div className="mt-1 text-right text-xs font-semibold text-ink/60">
            {text.length}/{MAX_CAPTION}
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {STARTERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setText((t) => (t.trim() ? t : s));
                  inputRef.current?.focus();
                }}
                className="cursor-pointer rounded-full border-2 border-ink bg-white px-3 py-1 text-sm font-semibold hover:bg-sunny/50 focus-visible:outline-4 focus-visible:outline-grape"
              >
                {s.trim()}…
              </button>
            ))}
          </div>

          <Button size="lg" className="mt-5 w-full" disabled={!canSubmit} onClick={() => submitRef.current(false)}>
            🔒 Seal my caption
          </Button>
          <p className="mt-2 text-center text-xs font-semibold text-ink/60">Nobody sees it until voting. Tip: ⌘/Ctrl + Enter also seals.</p>
        </Card>
      </div>
    </div>
  );
}
