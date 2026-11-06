import CreatureView from "../components/CreatureView";
import { Button, Card, Logo, Page, SpeechBubble } from "../components/ui";

const HERO = [
  { name: "Judgmental walrus with a mustache", seed: 512, caption: "Per my last email…", tilt: -4, delay: "0s" },
  { name: "Three-eyed frog wearing a crown", seed: 138, caption: "I can see your browser history. All three of me.", tilt: 3, delay: "0.6s" },
  { name: "A disapproving hamster in a top hat", seed: 11, caption: "You call that a snack?", tilt: -2, delay: "1.2s" },
];

const STEPS = [
  { emoji: "🐾", title: "Meet the creature", text: "Everyone gets a good look at a weird, wonderful animal." },
  { emoji: "🤫", title: "Caption in secret", text: "Pass the one device around. Each player writes in private, and the screen hides between turns." },
  { emoji: "🗳️", title: "Vote or react", text: "Play for points with a private ballot, or go no-scores and just laugh together." },
  { emoji: "🎉", title: "Reveal & repeat", text: "See who wrote what, then on to the next creature." },
];

export default function Home({
  onPlay,
  onLab,
  customCount,
}: {
  onPlay: () => void;
  onLab: () => void;
  customCount: number;
}) {
  return (
    <Page className="max-w-5xl pt-10">
      <div className="text-center">
        <div className="inline-block animate-rise">
          <Logo />
        </div>
        <p className="mx-auto mt-4 max-w-xl animate-rise text-lg font-semibold text-ink/80 [animation-delay:80ms]">
          The pass-the-device party game where you write hilarious captions for very odd animals. 3–8 players, one screen, zero
          prep.
        </p>
        <div className="mt-7 flex animate-rise flex-wrap justify-center gap-3 [animation-delay:160ms]">
          <Button size="lg" onClick={onPlay}>
            🎲 Start a game
          </Button>
          <Button size="lg" variant="secondary" onClick={onLab}>
            🧪 Creature Lab{customCount ? ` (${customCount})` : ""}
          </Button>
        </div>
      </div>

      <div className="mt-14 grid gap-8 sm:grid-cols-3">
        {HERO.map((h) => (
          <div
            key={h.name}
            className="animate-floaty"
            style={{ ["--tilt" as string]: `${h.tilt}deg`, animationDelay: h.delay }}
          >
            <SpeechBubble className="mb-5 text-center text-base">“{h.caption}”</SpeechBubble>
            <CreatureView creature={h} showName={false} />
          </div>
        ))}
      </div>

      <section className="mt-16" aria-labelledby="how">
        <h2 id="how" className="text-center font-display text-3xl font-bold">
          How it works
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Card key={s.title} className="relative pt-8">
              <span className="absolute -top-4 left-4 flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-ink bg-sunny font-display font-bold">
                {i + 1}
              </span>
              <div className="text-4xl">{s.emoji}</div>
              <h3 className="mt-2 font-display text-xl font-bold">{s.title}</h3>
              <p className="mt-1 text-ink/75">{s.text}</p>
            </Card>
          ))}
        </div>
      </section>
    </Page>
  );
}
