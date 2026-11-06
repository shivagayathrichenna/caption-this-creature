import { useCallback, useState } from "react";
import { GameHeader } from "./components/ui";
import { DEFAULT_SETTINGS, defaultSetup } from "./game/data";
import { newGame, normalizePlayers, rerollCreature } from "./game/logic";
import { useLocalStorage } from "./game/storage";
import type { Creature, Game, Round, Screen, SetupState } from "./game/types";
import Applause from "./screens/Applause";
import Final from "./screens/Final";
import Home from "./screens/Home";
import Intro from "./screens/Intro";
import Lab from "./screens/Lab";
import Pass from "./screens/Pass";
import Reveal from "./screens/Reveal";
import Setup from "./screens/Setup";
import Vote from "./screens/Vote";
import Write from "./screens/Write";

function isSetup(v: unknown): v is SetupState {
  if (!v || typeof v !== "object") return false;
  const s = v as SetupState;
  return (
    Array.isArray(s.players) &&
    s.players.length >= 2 &&
    s.players.every((p) => p && typeof p.id === "string" && typeof p.name === "string" && typeof p.emoji === "string") &&
    !!s.settings &&
    typeof s.settings.rounds === "number"
  );
}

function isCreatureList(v: unknown): v is Creature[] {
  return Array.isArray(v) && v.every((c) => c && typeof c.id === "string" && typeof c.name === "string" && typeof c.seed === "number");
}

export default function App() {
  const [setup, setSetup] = useLocalStorage<SetupState>("cct.setup.v1", defaultSetup(), isSetup);
  const [custom, setCustom] = useLocalStorage<Creature[]>("cct.custom.v1", [], isCreatureList);
  const [screen, setScreen] = useState<Screen>({ name: "home" });
  const [game, setGame] = useState<Game | null>(null);

  // merge in any settings added in later versions
  const settings = { ...DEFAULT_SETTINGS, ...setup.settings };

  const go = useCallback((s: Screen) => {
    setScreen(s);
    window.scrollTo({ top: 0 });
  }, []);

  const startGame = () => {
    const players = normalizePlayers(setup.players);
    setGame(newGame(players, settings, custom));
    go({ name: "intro" });
  };

  const updateRound = (fn: (r: Round) => Round) =>
    setGame((g) => (g ? { ...g, rounds: g.rounds.map((r, i) => (i === g.roundIdx ? fn(r) : r)) } : g));

  const quit = () => {
    setGame(null);
    go({ name: "home" });
  };

  // ---------- screens outside a game ----------
  if (screen.name === "home") {
    return <Home onPlay={() => go({ name: "setup" })} onLab={() => go({ name: "lab", from: "home" })} customCount={custom.length} />;
  }
  if (screen.name === "setup") {
    return (
      <Setup
        setup={{ ...setup, settings }}
        setSetup={setSetup}
        customCount={custom.length}
        onStart={startGame}
        onBack={() => go({ name: "home" })}
        onLab={() => go({ name: "lab", from: "setup" })}
      />
    );
  }
  if (screen.name === "lab") {
    const from = screen.from;
    return (
      <Lab
        custom={custom}
        onAdd={(c) => setCustom((list) => [...list, c])}
        onDelete={(id) => setCustom((list) => list.filter((c) => c.id !== id))}
        onBack={() => go({ name: from })}
      />
    );
  }

  if (!game) {
    // safety net: a game screen with no game
    return <Home onPlay={() => go({ name: "setup" })} onLab={() => go({ name: "lab", from: "home" })} customCount={custom.length} />;
  }

  // ---------- in-game ----------
  const round = game.rounds[game.roundIdx];
  const playerOf = (id: string) => game.players.find((p) => p.id === id)!;
  const total = round.writers.length;

  const afterWriting = () => (game.settings.scoring ? go({ name: "votePass", turn: 0 }) : go({ name: "applause" }));

  const submitCaption = (turn: number, text: string) => {
    const writerId = round.writers[turn];
    updateRound((r) =>
      r.captions.some((c) => c.playerId === writerId) ? r : { ...r, captions: [...r.captions, { playerId: writerId, text }] },
    );
    if (turn + 1 < total) go({ name: "pass", turn: turn + 1 });
    else afterWriting();
  };

  const submitVote = (turn: number, authorId: string) => {
    const voterId = round.writers[turn];
    updateRound((r) => ({ ...r, votes: { ...r.votes, [voterId]: authorId } }));
    if (turn + 1 < total) go({ name: "votePass", turn: turn + 1 });
    else go({ name: "reveal" });
  };

  const react = (authorId: string, emoji: string) =>
    updateRound((r) => {
      const mine = r.reactions[authorId] ?? {};
      return { ...r, reactions: { ...r.reactions, [authorId]: { ...mine, [emoji]: (mine[emoji] ?? 0) + 1 } } };
    });

  const crown = (authorId: string) => updateRound((r) => ({ ...r, crown: r.crown === authorId ? null : authorId }));

  const nextRound = () => {
    if (game.roundIdx + 1 < game.rounds.length) {
      setGame({ ...game, roundIdx: game.roundIdx + 1 });
      go({ name: "intro" });
    } else {
      go({ name: "final" });
    }
  };

  const header = (
    <GameHeader round={game.roundIdx + 1} rounds={game.rounds.length} scoring={game.settings.scoring} onQuit={quit} />
  );

  switch (screen.name) {
    case "intro":
      return (
        <>
          {header}
          <Intro game={game} onReroll={() => setGame(rerollCreature(game))} onStart={() => go({ name: "pass", turn: 0 })} />
        </>
      );
    case "pass":
      return (
        <>
          {header}
          <Pass
            key={`w${game.roundIdx}-${screen.turn}`}
            player={playerOf(round.writers[screen.turn])}
            mode="write"
            turn={screen.turn}
            total={total}
            banner={screen.turn > 0 ? "🔒 Caption sealed. No peeking!" : undefined}
            onReady={() => go({ name: "write", turn: screen.turn })}
          />
        </>
      );
    case "write": {
      const turn = screen.turn;
      return (
        <>
          {header}
          <Write
            key={`w${game.roundIdx}-${turn}`}
            player={playerOf(round.writers[turn])}
            creature={round.creature}
            showNames={game.settings.showNames}
            timer={game.settings.timer}
            onSubmit={(text) => submitCaption(turn, text)}
          />
        </>
      );
    }
    case "votePass":
      return (
        <>
          {header}
          <Pass
            key={`v${game.roundIdx}-${screen.turn}`}
            player={playerOf(round.writers[screen.turn])}
            mode="vote"
            turn={screen.turn}
            total={total}
            banner={screen.turn > 0 ? "🔒 Vote locked in. No peeking!" : "📬 All captions are in! Time to vote."}
            onReady={() => go({ name: "vote", turn: screen.turn })}
          />
        </>
      );
    case "vote": {
      const turn = screen.turn;
      return (
        <>
          {header}
          <Vote
            key={`v${game.roundIdx}-${turn}`}
            voter={playerOf(round.writers[turn])}
            round={round}
            showNames={game.settings.showNames}
            onVote={(authorId) => submitVote(turn, authorId)}
          />
        </>
      );
    }
    case "applause":
      return (
        <>
          {header}
          <Applause key={game.roundIdx} game={game} onReact={react} onCrown={crown} onNext={nextRound} />
        </>
      );
    case "reveal":
      return (
        <>
          {header}
          <Reveal key={game.roundIdx} game={game} onNext={nextRound} />
        </>
      );
    case "final":
      return (
        <Final
          game={game}
          onAgain={() => {
            setGame(newGame(game.players, game.settings, custom));
            go({ name: "intro" });
          }}
          onSetup={() => {
            setGame(null);
            go({ name: "setup" });
          }}
          onHome={quit}
        />
      );
    default:
      return null;
  }
}
