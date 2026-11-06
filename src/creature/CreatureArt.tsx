import { useId, useMemo, type ReactNode } from "react";
import { makeRng } from "./rng";
import {
  BACKGROUNDS,
  PALETTES,
  type BodyShape,
  type CreatureSpec,
  type Hat,
  type Legs,
} from "./spec";

const INK = "#2B2140";
const SW = 5;
const GROUND = 345;
const CX = 200;
const K = 0.5523;
const MOUTH_DARK = "#5A1D2E";
const PINK = "#FF7A93";

const ST = {
  stroke: INK,
  strokeWidth: SW,
  strokeLinejoin: "round" as const,
  strokeLinecap: "round" as const,
};

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

const BODY_DIMS: Record<BodyShape, { rx: number; ry: number; tw: number; bw: number }> = {
  round: { rx: 82, ry: 80, tw: 1, bw: 1 },
  egg: { rx: 68, ry: 92, tw: 0.75, bw: 1.05 },
  bean: { rx: 98, ry: 64, tw: 1, bw: 1.2 },
  pear: { rx: 82, ry: 84, tw: 0.55, bw: 1.2 },
  blob: { rx: 90, ry: 74, tw: 0.9, bw: 1.15 },
  tall: { rx: 56, ry: 104, tw: 1, bw: 1.1 },
};
const LEG_LEN: Record<Legs, number> = { two: 52, four: 42, tentacles: 55, stilts: 130, six: 38, none: 0 };
const HAT_H: Record<Hat, number> = {
  none: 0,
  top: 64,
  party: 92,
  crown: 50,
  propeller: 62,
  chef: 66,
  wizard: 104,
  cowboy: 48,
  beanie: 62,
  flower: 26,
};
const HEADS = {
  round: { w: 56, h: 54 },
  wide: { w: 68, h: 50 },
  square: { w: 58, h: 50 },
};

function squircle(cx: number, cy: number, rx: number, ry: number, tw: number, bw: number) {
  return (
    `M ${cx} ${cy - ry} ` +
    `C ${cx + rx * K * tw} ${cy - ry} ${cx + rx} ${cy - ry * K} ${cx + rx} ${cy} ` +
    `C ${cx + rx} ${cy + ry * K} ${cx + rx * K * bw} ${cy + ry} ${cx} ${cy + ry} ` +
    `C ${cx - rx * K * bw} ${cy + ry} ${cx - rx} ${cy + ry * K} ${cx - rx} ${cy} ` +
    `C ${cx - rx} ${cy - ry * K} ${cx - rx * K * tw} ${cy - ry} ${cx} ${cy - ry} Z`
  );
}

function starPoints(cx: number, cy: number, R: number, r: number) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? R : r;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(" ");
}

function spiralPath(x: number, y: number, R: number, turns = 2.6) {
  let d = "";
  const steps = 44;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = t * turns * Math.PI * 2;
    const rr = R * t;
    d += `${i ? "L" : "M"}${(x + rr * Math.cos(a)).toFixed(1)} ${(y + rr * Math.sin(a)).toFixed(1)} `;
  }
  return d;
}

function Outlined({ d, w, color }: { d: string; w: number; color: string }) {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={INK} strokeWidth={w + SW * 2} />
      <path d={d} stroke={color} strokeWidth={w} />
    </g>
  );
}

// draws several shapes as one merged silhouette with a single outline
function Union({ fill, children }: { fill: string; children: ReactNode }) {
  return (
    <g>
      <g fill={INK} stroke={INK} strokeWidth={SW * 2} strokeLinejoin="round">
        {children}
      </g>
      <g fill={fill} stroke="none">
        {children}
      </g>
    </g>
  );
}

type Look = { dx: number; dy: number };

function Eye({
  kind,
  x,
  y,
  r,
  look,
  lid = "#ccc",
}: {
  kind: string;
  x: number;
  y: number;
  r: number;
  look: Look;
  lid?: string;
}) {
  switch (kind) {
    case "lidded":
      return (
        <g>
          <circle cx={x} cy={y} r={r + 3} fill="#fff" {...ST} />
          <circle cx={x + look.dx * r * 0.6} cy={y + r * 0.25} r={r * 0.5} fill={INK} />
          <path d={`M ${x - r - 3} ${y} A ${r + 3} ${r + 3} 0 0 1 ${x + r + 3} ${y} Z`} fill={lid} {...ST} />
        </g>
      );
    case "dot":
      return (
        <g>
          <circle cx={x} cy={y} r={r * 0.62} fill={INK} />
          <circle cx={x - r * 0.2} cy={y - r * 0.22} r={r * 0.2} fill="#fff" />
        </g>
      );
    case "sleepy":
      return (
        <path
          d={`M ${x - r} ${y - r * 0.2} Q ${x} ${y + r * 1.1} ${x + r} ${y - r * 0.2}`}
          fill="none"
          {...ST}
        />
      );
    case "wide":
      return (
        <g>
          <circle cx={x} cy={y} r={r + 5} fill="#fff" {...ST} />
          <circle cx={x} cy={y} r={3.8} fill={INK} />
        </g>
      );
    case "spiral":
      return (
        <g>
          <circle cx={x} cy={y} r={r + 4} fill="#fff" {...ST} />
          <path d={spiralPath(x, y, r + 0.5)} fill="none" stroke={INK} strokeWidth={2.6} strokeLinecap="round" />
        </g>
      );
    case "wink":
      return (
        <path
          d={`M ${x - r} ${y - r * 0.7} L ${x + r * 0.6} ${y} L ${x - r} ${y + r * 0.7}`}
          fill="none"
          {...ST}
        />
      );
    default:
      return (
        <g>
          <circle cx={x} cy={y} r={r + 3} fill="#fff" {...ST} />
          <circle cx={x + look.dx * r} cy={y + look.dy * r} r={r * 0.55} fill={INK} />
          <circle cx={x + look.dx * r - r * 0.15} cy={y + look.dy * r - r * 0.18} r={r * 0.15} fill="#fff" />
        </g>
      );
  }
}

function HatShape({ kind }: { kind: Hat }) {
  switch (kind) {
    case "top":
      return (
        <g {...ST}>
          <ellipse cx={0} cy={0} rx={44} ry={9} fill="#3B2C5A" />
          <rect x={-27} y={-60} width={54} height={60} rx={6} fill="#3B2C5A" />
          <rect x={-24.5} y={-24} width={49} height={13} fill="#E24F4F" stroke="none" />
        </g>
      );
    case "party":
      return (
        <g {...ST}>
          <path d="M -30 2 L 0 -86 L 30 2 Z" fill="#FF8FB1" />
          <circle cx={-6} cy={-22} r={4.5} fill="#fff" stroke="none" />
          <circle cx={9} cy={-40} r={4.5} fill="#FFE066" stroke="none" />
          <circle cx={-3} cy={-58} r={4} fill="#fff" stroke="none" />
          <circle cx={0} cy={-88} r={9} fill="#FFC933" />
        </g>
      );
    case "crown":
      return (
        <g {...ST}>
          <path d="M -32 2 L -38 -38 L -18 -20 L 0 -46 L 18 -20 L 38 -38 L 32 2 Z" fill="#FFC933" />
          <circle cx={0} cy={-14} r={5} fill="#FF5D5D" strokeWidth={3} />
          <circle cx={-19} cy={-10} r={4} fill="#4CC9F0" strokeWidth={3} />
          <circle cx={19} cy={-10} r={4} fill="#4CC9F0" strokeWidth={3} />
        </g>
      );
    case "propeller":
      return (
        <g {...ST}>
          <path d="M 0 -44 L 0 -56" fill="none" />
          <ellipse cx={-19} cy={-58} rx={22} ry={5.5} fill="#FFC933" transform="rotate(-8 -19 -58)" />
          <ellipse cx={19} cy={-58} rx={22} ry={5.5} fill="#FFC933" transform="rotate(8 19 -58)" />
          <path d="M -36 2 Q -38 -44 0 -44 Q 38 -44 36 2 Z" fill="#4CC9F0" />
          <path d="M -12 -42 Q -18 -20 -14 2" fill="none" stroke="#fff" strokeWidth={3} opacity={0.6} />
        </g>
      );
    case "chef":
      return (
        <g>
          <Union fill="#fff">
            <circle cx={-21} cy={-34} r={18} />
            <circle cx={0} cy={-44} r={22} />
            <circle cx={21} cy={-34} r={18} />
            <rect x={-30} y={-26} width={60} height={28} rx={4} />
          </Union>
          <path d="M -30 -12 L 30 -12" stroke={INK} strokeWidth={3} opacity={0.35} />
        </g>
      );
    case "wizard":
      return (
        <g {...ST}>
          <ellipse cx={0} cy={0} rx={48} ry={9} fill="#5636C9" />
          <path d="M -34 0 L -6 -84 Q 6 -112 28 -98 Q 8 -92 10 -70 L 34 0 Z" fill="#6D4CE0" />
          <polygon points={starPoints(-4, -26, 8, 3.6)} fill="#FFC933" strokeWidth={2.5} />
          <polygon points={starPoints(8, -52, 6, 2.8)} fill="#FFC933" strokeWidth={2.5} />
        </g>
      );
    case "cowboy":
      return (
        <g {...ST}>
          <ellipse cx={0} cy={2} rx={56} ry={10} fill="#B07A3F" />
          <path d="M -26 2 Q -30 -40 -16 -46 Q 0 -34 16 -46 Q 30 -40 26 2 Z" fill="#C48A4A" />
          <rect x={-26} y={-14} width={52} height={10} fill="#7A4E24" stroke="none" />
        </g>
      );
    case "beanie":
      return (
        <g {...ST}>
          <path d="M -34 4 Q -38 -46 0 -46 Q 38 -46 34 4 Z" fill="#FF6B6B" />
          <rect x={-37} y={-12} width={74} height={18} rx={6} fill="#E24F4F" />
          <circle cx={0} cy={-50} r={10} fill="#FFC933" />
        </g>
      );
    case "flower":
      return (
        <g transform="translate(18 -4)">
          <Union fill="#FF8FB1">
            {[0, 1, 2, 3, 4].map((i) => {
              const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
              return <circle key={i} cx={Math.cos(a) * 11} cy={-12 + Math.sin(a) * 11} r={8} />;
            })}
          </Union>
          <circle cx={0} cy={-12} r={7} fill="#FFD84D" {...ST} strokeWidth={3} />
        </g>
      );
    default:
      return null;
  }
}

const SCARF_COLORS = ["#FF6B6B", "#4CC9F0", "#FFC933", "#8B5CF6", "#3DDC97"];

interface Props {
  spec: CreatureSpec;
  className?: string;
  label?: string;
}

export default function CreatureArt({ spec, className, label }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const pal = PALETTES[spec.palette % PALETTES.length];
  const bg = BACKGROUNDS[spec.bg % BACKGROUNDS.length];

  const art = useMemo(() => {
    const rng = makeRng(spec.seed ^ 0x9e3779b9);
    const spots = Array.from({ length: 7 }, () => ({
      x: rng.range(-0.85, 0.85),
      y: rng.range(-0.75, 0.85),
      r: rng.range(7, 15),
    }));
    const look = { dx: rng.range(-0.4, 0.4), dy: rng.range(-0.25, 0.3) };
    const tilt = spec.merged ? rng.range(-3, 3) : rng.range(-7, 7);
    const headShift = spec.merged ? 0 : rng.range(-12, 12);
    const hatShift = rng.range(-0.15, 0.15);
    const hatRot = rng.range(-12, 12) + (spec.hatTiny ? 14 * (rng.chance(0.5) ? 1 : -1) : 0);
    const scarf = rng.pick(SCARF_COLORS);
    const sun = rng.chance(0.5);
    const clouds = Array.from({ length: 2 }, () => ({ x: rng.range(30, 360), y: rng.range(30, 120), s: rng.range(0.7, 1.2) }));
    const sparkles = Array.from({ length: 5 }, () => ({ x: rng.range(20, 380), y: rng.range(25, 300), r: rng.range(5, 10) }));
    const dots = Array.from({ length: 4 }, () => ({ x: rng.range(20, 380), y: rng.range(40, 300), r: rng.range(10, 26) }));
    return { spots, look, tilt, headShift, hatShift, hatRot, scarf, sun, clouds, sparkles, dots };
  }, [spec]);

  // ---------- layout ----------
  const dims = BODY_DIMS[spec.body];
  const bs = spec.legs === "stilts" ? 0.8 : 1;
  const rx = dims.rx * bs;
  const ry = dims.ry * bs;
  const float = spec.legs === "none";
  const bodyBottom = float ? GROUND - 40 : GROUND - LEG_LEN[spec.legs] + 8;
  const bodyCy = bodyBottom - ry;
  const bodyTop = bodyCy - ry;
  const bodyD = squircle(CX, bodyCy, rx, ry, dims.tw, dims.bw);

  let hrx: number, hry: number, hcy: number, hx: number;
  if (spec.merged) {
    hrx = rx * 0.82;
    hry = ry * 0.78;
    hcy = bodyCy - ry * 0.22;
    hx = CX;
  } else {
    const h = HEADS[spec.headShape];
    hrx = h.w * spec.headScale;
    hry = h.h * spec.headScale;
    hcy = bodyTop - spec.neck - hry * 0.4;
    hx = CX + art.headShift;
  }
  // face box
  const fw = Math.min(hrx, 70);
  const fh = Math.min(hry, 62);
  const fy = -hry + fh;
  const er = clamp(Math.min(fw, fh) * 0.22, 11, 17);
  const ex = fw * 0.36;
  const ey = fy - fh * 0.12;
  const my = fy + fh * 0.42;

  const hatScale = clamp(hrx / 58, 0.78, 1.2) * (spec.hatTiny ? 0.55 : 1);
  const hatY = -hry * 0.88;

  // overall height -> scale to fit
  let topY = hcy - hry;
  if (spec.hat !== "none") topY = Math.min(topY, hcy + hatY - HAT_H[spec.hat] * hatScale);
  if (spec.ears === "long") topY = Math.min(topY, hcy - hry - 78);
  if (spec.eyes === "stalks") topY = Math.min(topY, hcy - hry - 26);
  if (spec.topper === "horns") topY = Math.min(topY, hcy - hry - 40);
  if (spec.topper === "antlers") topY = Math.min(topY, hcy - hry - 50);
  if (spec.topper === "unihorn") topY = Math.min(topY, hcy - hry - 66);
  if (spec.topper === "antennae") topY = Math.min(topY, hcy - hry - 48);
  const fit = Math.min(1, (GROUND - 26) / (GROUND - topY));

  const legColor = spec.mouth === "beak" ? "#FFB020" : pal.accent;
  const side = spec.tailSide;
  const clipId = `body-${uid}`;
  const neckBottom = bodyTop + 8;
  const neckY = spec.merged ? Math.max(hcy + hry * 0.8, hcy + my + 32) : hcy + hry * 0.8;
  const neckW = Math.min(hrx, 60) * 0.52;

  // ---------- pieces ----------
  const legsEl = (() => {
    const by = bodyBottom - 14;
    switch (spec.legs) {
      case "two":
        return [-1, 1].map((s) => {
          const x = CX + s * rx * 0.42;
          return (
            <g key={s}>
              <Outlined d={`M ${x} ${by} L ${x} ${GROUND - 12}`} w={14} color={legColor} />
              <ellipse cx={x + s * 8} cy={GROUND - 8} rx={21} ry={9} fill={legColor} {...ST} />
            </g>
          );
        });
      case "four":
        return [-0.62, -0.24, 0.24, 0.62].map((o) => {
          const x = CX + o * rx;
          return (
            <g key={o}>
              <Outlined d={`M ${x} ${by - 6} L ${x} ${GROUND - 12}`} w={18} color={legColor} />
              <ellipse cx={x + Math.sign(o) * 3} cy={GROUND - 7} rx={15} ry={8} fill={legColor} {...ST} />
            </g>
          );
        });
      case "tentacles":
        return [0, 1, 2, 3, 4].map((i) => {
          const x = CX + (i - 2) * rx * 0.38;
          const sw = i % 2 ? 14 : -14;
          const hook = i % 2 ? 22 : -22;
          const d = `M ${x} ${by} C ${x + sw} ${by + 18} ${x - sw} ${by + 34} ${x + sw * 0.3} ${GROUND - 10} Q ${x + hook} ${GROUND + 2} ${x + hook} ${GROUND - 16}`;
          return <Outlined key={i} d={d} w={15} color={spec.palette === 2 ? pal.accent : pal.body} />;
        });
      case "stilts":
        return [-1, 1].map((s) => {
          const x = CX + s * rx * 0.28;
          const mid = (by + GROUND) / 2;
          return (
            <Outlined
              key={s}
              d={`M ${x} ${by} L ${x + s * 9} ${mid} L ${x} ${GROUND - 9} L ${x + s * 26} ${GROUND - 9}`}
              w={7}
              color={legColor}
            />
          );
        });
      case "six":
        return [-1, 1].flatMap((s) =>
          [0.25, 0.8, 1.25].map((a, i) => {
            const px = CX + s * rx * Math.cos(a);
            const py = bodyCy + ry * Math.sin(a) * 0.92;
            return (
              <path
                key={`${s}-${i}`}
                d={`M ${px} ${py} L ${px + s * 30} ${py + 8 + i * 3} L ${px + s * (38 + i * 4)} ${GROUND - 6}`}
                fill="none"
                stroke={INK}
                strokeWidth={6}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          }),
        );
      default:
        return null;
    }
  })();

  const ax = CX + side * rx * 0.82;
  const ay = bodyCy + ry * 0.35;
  const tailEl = (() => {
    const s = side;
    switch (spec.tail) {
      case "curl":
        return (
          <Outlined
            d={`M ${ax} ${ay} C ${ax + s * 40} ${ay + 10} ${ax + s * 56} ${ay - 30} ${ax + s * 30} ${ay - 46} C ${ax + s * 14} ${ay - 54} ${ax + s * 10} ${ay - 34} ${ax + s * 24} ${ay - 32}`}
            w={12}
            color={pal.body}
          />
        );
      case "fluffy":
        return (
          <Union fill={pal.belly}>
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const a = (i / 6) * Math.PI * 2;
              return <circle key={i} cx={ax + s * 30 + Math.cos(a) * 15} cy={ay - 8 + Math.sin(a) * 15} r={13} />;
            })}
            <circle cx={ax + s * 30} cy={ay - 8} r={16} />
          </Union>
        );
      case "spike":
        return (
          <g {...ST}>
            <path
              d={`M ${ax} ${ay - 14} Q ${ax + s * 50} ${ay - 8} ${ax + s * 76} ${ay - 52} Q ${ax + s * 66} ${ay + 12} ${ax} ${ay + 14} Z`}
              fill={pal.body}
            />
            <path
              d={`M ${ax + s * 56} ${ay - 36} L ${ax + s * 70} ${ay - 56} L ${ax + s * 76} ${ay - 34} Z`}
              fill={pal.accent}
            />
          </g>
        );
      case "fish":
        return (
          <path
            d={`M ${ax} ${ay} Q ${ax + s * 30} ${ay - 10} ${ax + s * 48} ${ay - 48} Q ${ax + s * 60} ${ay - 6} ${ax + s * 48} ${ay + 34} Q ${ax + s * 28} ${ay + 16} ${ax} ${ay} Z`}
            fill={pal.accent}
            {...ST}
          />
        );
      case "lightning": {
        const pts = [
          [0, 0],
          [28, -14],
          [20, -20],
          [54, -56],
          [36, -28],
          [46, -32],
          [14, 8],
        ]
          .map(([px, py]) => `${ax + s * px},${ay + py}`)
          .join(" ");
        return <polygon points={pts} fill="#FFD84D" {...ST} />;
      }
      default:
        return null;
    }
  })();

  const armsBack = (() => {
    const y0 = bodyCy + ry * 0.1;
    switch (spec.arms) {
      case "stubby":
        return [-1, 1].map((s) => (
          <ellipse
            key={s}
            cx={CX + s * (rx - 2)}
            cy={y0}
            rx={19}
            ry={12}
            fill={pal.body}
            transform={`rotate(${s * 35} ${CX + s * (rx - 2)} ${y0})`}
            {...ST}
          />
        ));
      case "noodle":
        return [-1, 1].map((s) => {
          const x0 = CX + s * (rx - 8);
          const ex2 = CX + s * (rx + 34);
          const ey2 = bodyCy - ry * 0.65;
          return (
            <g key={s}>
              <Outlined
                d={`M ${x0} ${y0} C ${CX + s * (rx + 30)} ${y0 + ry * 0.2} ${CX + s * (rx + 46)} ${bodyCy - ry * 0.2} ${ex2} ${ey2}`}
                w={11}
                color={pal.body}
              />
              <circle cx={ex2} cy={ey2} r={12} fill={pal.body} {...ST} />
            </g>
          );
        });
      case "wings":
        return [-1, 1].map((s) => (
          <g key={s} transform={`translate(${CX + s * (rx + 20)} ${bodyCy - ry * 0.2}) rotate(${s * -32})`}>
            <ellipse cx={0} cy={0} rx={46} ry={21} fill={spec.palette === 9 ? "#fff" : pal.accent} {...ST} />
            <path d="M -22 -3 Q 0 -8 24 -3" fill="none" stroke="#fff" strokeWidth={3.5} opacity={0.55} strokeLinecap="round" />
          </g>
        ));
      default:
        return null;
    }
  })();

  const armsFront =
    spec.arms === "tiny"
      ? [-1, 1].map((s) => {
          const x0 = CX + s * rx * 0.42;
          const y0 = bodyCy - ry * 0.05;
          return (
            <g key={s}>
              <Outlined d={`M ${x0} ${y0} L ${x0 + s * 15} ${y0 + 7} L ${x0 + s * 9} ${y0 + 22}`} w={8} color={pal.body} />
              <circle cx={x0 + s * 9} cy={y0 + 24} r={6} fill={pal.body} {...ST} strokeWidth={4} />
            </g>
          );
        })
      : null;

  const spikesEl = spec.spikes
    ? [-62, -34, 0, 34, 62].map((deg) => {
        const a = (deg * Math.PI) / 180;
        const px = CX + rx * Math.sin(a);
        const py = bodyCy - ry * Math.cos(a);
        let nx = Math.sin(a) / rx;
        let ny = -Math.cos(a) / ry;
        const nl = Math.hypot(nx, ny);
        nx /= nl;
        ny /= nl;
        const tx = -ny;
        const ty = nx;
        const bw2 = 13;
        const h = 30;
        const d = `M ${px - tx * bw2 - nx * 6} ${py - ty * bw2 - ny * 6} L ${px + nx * h} ${py + ny * h} L ${px + tx * bw2 - nx * 6} ${py + ty * bw2 - ny * 6} Z`;
        return <path key={deg} d={d} fill={pal.accent} {...ST} />;
      })
    : null;

  const shellEl = spec.shell
    ? (() => {
        const sx = CX + side * rx * 0.4;
        const sy = bodyCy - ry * 0.8;
        const sr = ry * 0.85;
        return (
          <g>
            <circle cx={sx} cy={sy} r={sr} fill="#F2A65A" {...ST} />
            <path d={spiralPath(sx, sy, sr * 0.82, 2.4)} fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );
      })()
    : null;

  const patternEl = (() => {
    switch (spec.pattern) {
      case "spots":
        return art.spots.map((s, i) => (
          <circle key={i} cx={CX + s.x * rx} cy={bodyCy + s.y * ry} r={s.r} fill={pal.spot} opacity={0.75} />
        ));
      case "stripes":
        return (
          <g transform={`rotate(-12 ${CX} ${bodyCy})`}>
            {[0, 1, 2, 3, 4].map((i) => (
              <rect
                key={i}
                x={CX - rx - 10 + i * ((rx * 2 + 20) / 5) + 12}
                y={bodyCy - ry - 20}
                width={(rx * 2 + 20) / 10}
                height={ry * 2 + 40}
                fill={pal.spot}
                opacity={0.75}
              />
            ))}
          </g>
        );
      case "zigzag": {
        let d = `M ${CX - rx - 6} ${bodyCy + ry * 0.2}`;
        const n = 8;
        for (let i = 1; i <= n; i++) {
          d += ` L ${CX - rx - 6 + (i * (rx * 2 + 12)) / n} ${bodyCy + ry * 0.2 + (i % 2 ? -16 : 16)}`;
        }
        return <path d={d} fill="none" stroke={pal.spot} strokeWidth={11} strokeLinejoin="round" opacity={0.8} />;
      }
      case "dots":
        return [0, 1, 2].flatMap((row) =>
          [0, 1, 2, 3, 4].map((col) => (
            <circle
              key={`${row}-${col}`}
              cx={CX - rx * 0.8 + col * rx * 0.4 + (row % 2) * rx * 0.2}
              cy={bodyCy - ry * 0.2 + row * ry * 0.4}
              r={5}
              fill={pal.accent}
              opacity={0.55}
            />
          )),
        );
      default:
        return null;
    }
  })();

  const earColor = spec.ears === "floppy" ? pal.accent : pal.body;
  const earsEl = (() => {
    switch (spec.ears) {
      case "pointy":
        return [-1, 1].map((s) => (
          <g key={s} transform={`scale(${s} 1)`}>
            <path
              d={`M ${hrx * 0.18} ${-hry * 0.97} L ${hrx * 0.92} ${-hry * 1.5} L ${hrx * 0.98} ${-hry * 0.3} Z`}
              fill={pal.body}
              {...ST}
            />
            <path
              d={`M ${hrx * 0.42} ${-hry * 1.0} L ${hrx * 0.86} ${-hry * 1.28} L ${hrx * 0.9} ${-hry * 0.55} Z`}
              fill="#FFB3C6"
              stroke="none"
            />
          </g>
        ));
      case "round":
        return [-1, 1].map((s) => (
          <g key={s}>
            <circle cx={s * hrx * 0.7} cy={-hry * 0.78} r={hrx * 0.3} fill={pal.body} {...ST} />
            <circle cx={s * hrx * 0.7} cy={-hry * 0.78} r={hrx * 0.16} fill="#FFB3C6" />
          </g>
        ));
      case "long":
        return [-1, 1].map((s) => (
          <g key={s} transform={`translate(${s * hrx * 0.45} ${-hry - 30}) rotate(${s * 10})`}>
            <ellipse cx={0} cy={0} rx={15} ry={46} fill={pal.body} {...ST} />
            <ellipse cx={0} cy={2} rx={6.5} ry={32} fill="#FFB3C6" />
          </g>
        ));
      case "floppy":
        return [-1, 1].map((s) => (
          <ellipse
            key={s}
            cx={s * hrx * 0.94}
            cy={-hry * 0.05}
            rx={17}
            ry={36}
            fill={earColor}
            transform={`rotate(${s * 18} ${s * hrx * 0.94} ${-hry * 0.05})`}
            {...ST}
          />
        ));
      default:
        return null;
    }
  })();

  const topperEl = (() => {
    switch (spec.topper) {
      case "horns":
        return [-1, 1].map((s) => (
          <g key={s} transform={`scale(${s} 1)`}>
            <path
              d={`M ${hrx * 0.24} ${-hry * 0.95} Q ${hrx * 0.4} ${-hry * 1.35} ${hrx * 0.8} ${-hry * 1.62} Q ${hrx * 0.78} ${-hry * 1.2} ${hrx * 0.66} ${-hry * 0.76} Z`}
              fill="#FFF1C9"
              {...ST}
            />
          </g>
        ));
      case "antlers":
        return [-1, 1].map((s) => (
          <g key={s} transform={`scale(${s} 1)`}>
            <Outlined
              d={`M ${hrx * 0.34} ${-hry * 0.9} L ${hrx * 0.62} ${-hry * 1.55} M ${hrx * 0.48} ${-hry * 1.2} L ${hrx * 0.2} ${-hry * 1.52} M ${hrx * 0.57} ${-hry * 1.42} L ${hrx * 0.95} ${-hry * 1.5}`}
              w={7}
              color="#C99A6B"
            />
          </g>
        ));
      case "unihorn":
        return (
          <g {...ST}>
            <path d={`M -13 ${-hry * 0.88} L 2 ${-hry - 62} L 13 ${-hry * 0.88} Z`} fill="#FFE066" />
            <path d={`M -9 ${-hry - 8} L 9 ${-hry - 14} M -6 ${-hry - 24} L 7 ${-hry - 30}`} fill="none" strokeWidth={3} />
          </g>
        );
      case "antennae":
        return [-1, 1].map((s) => (
          <g key={s} transform={`scale(${s} 1)`}>
            <path
              d={`M ${hrx * 0.3} ${-hry * 0.92} Q ${hrx * 0.38} ${-hry * 1.5} ${hrx * 0.78} ${-hry * 1.5}`}
              fill="none"
              stroke={INK}
              strokeWidth={4}
              strokeLinecap="round"
            />
            <circle cx={hrx * 0.78} cy={-hry * 1.5} r={7} fill={pal.accent} {...ST} strokeWidth={3.5} />
          </g>
        ));
      default:
        return null;
    }
  })();

  const stalkEyes =
    spec.eyes === "stalks"
      ? [-1, 1].map((s) => (
          <Eye key={s} kind="googly" x={s * fw * 0.42} y={-hry * 1.0} r={er + 5} look={art.look} />
        ))
      : null;

  const headShapeEl = spec.merged ? null : (
    <g>
      {spec.headShape === "square" ? (
        <path d={squircle(0, 0, hrx, hry, 1.4, 1.4)} fill={pal.body} {...ST} />
      ) : (
        <ellipse cx={0} cy={0} rx={hrx} ry={hry} fill={pal.body} {...ST} />
      )}
      <path
        d={`M ${-hrx * 0.72} ${-hry * 0.1} Q ${-hrx * 0.74} ${-hry * 0.5} ${-hrx * 0.45} ${-hry * 0.72}`}
        fill="none"
        stroke="#fff"
        strokeWidth={6}
        strokeLinecap="round"
        opacity={0.4}
      />
    </g>
  );

  const eyesEl = (() => {
    const kind = spec.eyes;
    if (kind === "stalks") return null;
    if (kind === "cyclops") return <Eye kind="googly" x={0} y={ey} r={er * 1.8} look={art.look} />;
    if (kind === "three")
      return (
        <g>
          <Eye kind="googly" x={-ex * 0.95} y={ey + fh * 0.06} r={er * 0.9} look={art.look} />
          <Eye kind="googly" x={ex * 0.95} y={ey + fh * 0.06} r={er * 0.9} look={art.look} />
          <Eye kind="googly" x={0} y={ey - fh * 0.36} r={er * 0.72} look={art.look} />
        </g>
      );
    if (kind === "wink")
      return (
        <g>
          <Eye kind="dot" x={-ex} y={ey} r={er} look={art.look} />
          <Eye kind="wink" x={ex} y={ey} r={er} look={art.look} />
        </g>
      );
    return (
      <g>
        <Eye kind={kind} x={-ex} y={ey} r={er} look={art.look} lid={pal.body} />
        <Eye kind={kind} x={ex} y={ey} r={er} look={art.look} lid={pal.body} />
      </g>
    );
  })();

  const browsEl = (() => {
    if (spec.brows === "none" || ["cyclops", "three", "stalks"].includes(spec.eyes)) return null;
    const y = ey - er * 1.9;
    const o = spec.brows === "angry" ? [-7, 5] : spec.brows === "worried" ? [5, -7] : [0, 0];
    return (
      <g fill="none" {...ST} strokeWidth={5}>
        <path d={`M ${-ex - er} ${y + o[0]} L ${-ex + er} ${y + o[1]}`} />
        <path d={`M ${ex + er} ${y + o[0]} L ${ex - er} ${y + o[1]}`} />
      </g>
    );
  })();

  const mouthEl = (() => {
    switch (spec.mouth) {
      case "smile":
        return <path d={`M -15 ${my} Q 0 ${my + 15} 15 ${my}`} fill="none" {...ST} />;
      case "grin":
        return (
          <g transform={`translate(0 ${my - 4})`}>
            <path d="M -23 -2 Q 0 28 23 -2 Z" fill={MOUTH_DARK} {...ST} />
            <ellipse cx={0} cy={8} rx={9} ry={4.5} fill={PINK} />
            <path d="M -13 -0.5 L 13 -0.5 L 11 4 L -11 4 Z" fill="#fff" />
          </g>
        );
      case "beak": {
        const by = fy + fh * 0.36;
        return (
          <g transform={`translate(0 ${by})`}>
            <path d="M -22 -6 Q 0 -26 22 -6 Q 0 24 -22 -6 Z" fill="#FFB020" {...ST} />
            <path d="M -19 -4 Q 0 6 19 -4" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
          </g>
        );
      }
      case "o":
        return <ellipse cx={0} cy={my + 4} rx={9} ry={12} fill={MOUTH_DARK} {...ST} />;
      case "buck":
        return (
          <g>
            <ellipse cx={0} cy={fy + fh * 0.18} rx={7.5} ry={5} fill={PINK} {...ST} strokeWidth={3.5} />
            <g transform={`translate(0 ${my - 2})`}>
              <rect x={-8.5} y={3} width={8.5} height={14} rx={2} fill="#fff" {...ST} strokeWidth={3} />
              <rect x={0} y={3} width={8.5} height={14} rx={2} fill="#fff" {...ST} strokeWidth={3} />
              <path d="M -16 0 Q 0 14 16 0" fill="none" {...ST} />
            </g>
          </g>
        );
      case "tongue":
        return (
          <g transform={`translate(0 ${my - 2})`}>
            <rect x={-8} y={4} width={16} height={19} rx={8} fill={PINK} {...ST} strokeWidth={3.5} />
            <path d="M 0 9 L 0 17" stroke="#D9556E" strokeWidth={2.5} strokeLinecap="round" />
            <path d="M -17 0 Q 0 14 17 0" fill="none" {...ST} />
          </g>
        );
      case "fangs":
        return (
          <g transform={`translate(0 ${my})`}>
            <path d="M -12 3 L -8 15 L -4 2 Z" fill="#fff" {...ST} strokeWidth={3} />
            <path d="M 12 3 L 8 15 L 4 2 Z" fill="#fff" {...ST} strokeWidth={3} />
            <path d="M -17 6 Q 0 -5 17 6" fill="none" {...ST} />
          </g>
        );
      case "mustache":
        return (
          <g transform={`translate(0 ${my - 4})`}>
            <path d="M -8 20 Q 0 27 8 20" fill="none" {...ST} strokeWidth={4} />
            <path
              d="M 0 -4 C -10 -16 -30 -12 -36 2 C -26 -2 -20 8 -10 9 C -6 9 -2 5 0 5 C 2 5 6 9 10 9 C 20 8 26 -2 36 2 C 30 -12 10 -16 0 -4 Z"
              fill={INK}
              stroke={INK}
              strokeWidth={2}
              strokeLinejoin="round"
            />
          </g>
        );
      case "snout":
      case "tusks": {
        const sy = fy + fh * 0.4;
        const sx = fw * 0.38;
        return (
          <g>
            {spec.mouth === "tusks" && (
              <g>
                <path d={`M ${-sx * 0.55} ${sy + 8} L ${-sx * 0.42} ${sy + 38} L ${-sx * 0.12} ${sy + 10} Z`} fill="#fff" {...ST} strokeWidth={3.5} />
                <path d={`M ${sx * 0.55} ${sy + 8} L ${sx * 0.42} ${sy + 38} L ${sx * 0.12} ${sy + 10} Z`} fill="#fff" {...ST} strokeWidth={3.5} />
              </g>
            )}
            <ellipse cx={0} cy={sy} rx={sx} ry={fh * 0.3} fill={pal.belly} {...ST} strokeWidth={4} />
            <ellipse cx={-sx * 0.32} cy={sy - 5} rx={3.2} ry={4.5} fill={INK} />
            <ellipse cx={sx * 0.32} cy={sy - 5} rx={3.2} ry={4.5} fill={INK} />
            <path d={`M -9 ${sy + 8} Q 0 ${sy + 15} 9 ${sy + 8}`} fill="none" stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
          </g>
        );
      }
      default:
        return <path d={`M -14 ${my + 4} L 14 ${my + 4}`} fill="none" {...ST} />;
    }
  })();

  const whiskersEl = spec.whiskers
    ? [-1, 1].map((s) => (
        <g key={s} stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none">
          <path d={`M ${s * fw * 0.4} ${my - 4} L ${s * (fw + 24)} ${my - 14}`} />
          <path d={`M ${s * fw * 0.4} ${my + 2} L ${s * (fw + 28)} ${my + 2}`} />
          <path d={`M ${s * fw * 0.4} ${my + 8} L ${s * (fw + 24)} ${my + 18}`} />
        </g>
      ))
    : null;

  const blushEl = spec.blush
    ? [-1, 1].map((s) => (
        <ellipse key={s} cx={s * fw * 0.7} cy={fy + fh * 0.24} rx={11} ry={7} fill="#FF6F9C" opacity={0.45} />
      ))
    : null;

  const specsEl = (() => {
    if (spec.specs === "none" || spec.eyes === "stalks") return null;
    const g = Math.min(er + 6, ex - 2);
    const glass = "rgba(255,255,255,0.3)";
    const single = spec.eyes === "cyclops";
    if (spec.specs === "monocle") {
      const mx = single ? 0 : ex;
      const mr = single ? er * 1.8 + 6 : g + 2;
      return (
        <g>
          <circle cx={mx} cy={ey} r={mr} fill={glass} stroke="#E5A800" strokeWidth={4} />
          <path
            d={`M ${mx + mr * 0.7} ${ey + mr * 0.7} Q ${mx + mr + 12} ${ey + 40} ${mx + mr - 6} ${ey + 70}`}
            fill="none"
            stroke="#E5A800"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        </g>
      );
    }
    if (single) {
      const rr = er * 1.8 + 6;
      return spec.specs === "sun" ? (
        <g>
          <rect x={-rr - 4} y={ey - rr * 0.7} width={rr * 2 + 8} height={rr * 1.4} rx={rr * 0.6} fill={INK} />
          <path d={`M ${-rr * 0.6} ${ey - rr * 0.35} l ${rr * 0.5} ${-rr * 0.12}`} stroke="#fff" strokeWidth={3} strokeLinecap="round" opacity={0.7} />
        </g>
      ) : (
        <circle cx={0} cy={ey} r={rr} fill={glass} {...ST} strokeWidth={4} />
      );
    }
    if (spec.specs === "sun") {
      return (
        <g>
          {[-1, 1].map((s) => (
            <rect key={s} x={s * ex - g - 1} y={ey - g * 0.75} width={g * 2 + 2} height={g * 1.55} rx={g * 0.55} fill={INK} />
          ))}
          <path d={`M ${-ex + g} ${ey - g * 0.3} L ${ex - g} ${ey - g * 0.3}`} stroke={INK} strokeWidth={4} />
          {[-1, 1].map((s) => (
            <path key={s} d={`M ${s * ex - g * 0.4} ${ey - g * 0.3} l ${g * 0.5} ${-g * 0.1}`} stroke="#fff" strokeWidth={2.5} strokeLinecap="round" opacity={0.7} />
          ))}
        </g>
      );
    }
    return (
      <g>
        {[-1, 1].map((s) => (
          <circle key={s} cx={s * ex} cy={ey} r={g} fill={glass} {...ST} strokeWidth={4} />
        ))}
        <path d={`M ${-ex + g} ${ey} L ${ex - g} ${ey}`} stroke={INK} strokeWidth={4} />
      </g>
    );
  })();

  const hatEl =
    spec.hat !== "none" ? (
      <g transform={`translate(${art.hatShift * hrx + (spec.hatTiny ? hrx * 0.3 : 0)} ${hatY}) rotate(${art.hatRot}) scale(${hatScale})`}>
        <HatShape kind={spec.hat} />
      </g>
    ) : null;

  const neckwearEl = (() => {
    if (spec.neckwear === "bowtie") {
      return (
        <g transform={`translate(${hx} ${neckY + 10})`} {...ST} strokeWidth={4}>
          <path d="M 0 0 L -26 -15 L -26 15 Z" fill="#E24F4F" />
          <path d="M 0 0 L 26 -15 L 26 15 Z" fill="#E24F4F" />
          <circle cx={0} cy={0} r={6.5} fill="#C93A3A" />
        </g>
      );
    }
    if (spec.neckwear === "scarf") {
      const w = Math.min(hrx, 60) * 0.85;
      return (
        <g>
          <Outlined d={`M ${hx + 22} ${neckY + 10} L ${hx + 32} ${neckY + 56}`} w={15} color={art.scarf} />
          <Outlined d={`M ${hx - w} ${neckY - 2} Q ${hx} ${neckY + 22} ${hx + w} ${neckY - 2}`} w={16} color={art.scarf} />
        </g>
      );
    }
    return null;
  })();

  const decorEl = (
    <g>
      {art.dots.map((d, i) => (
        <circle key={`d${i}`} cx={d.x} cy={d.y} r={d.r} fill="#fff" opacity={0.28} />
      ))}
      {art.sun && <circle cx={338} cy={62} r={28} fill="#FFE066" opacity={0.95} />}
      {art.clouds.map((c, i) => (
        <g key={`c${i}`} transform={`translate(${c.x} ${c.y}) scale(${c.s})`} fill="#fff" opacity={0.85}>
          <ellipse cx={0} cy={0} rx={30} ry={13} />
          <ellipse cx={-12} cy={-9} rx={16} ry={13} />
          <ellipse cx={10} cy={-12} rx={18} ry={15} />
        </g>
      ))}
      {art.sparkles.map((s, i) => (
        <polygon key={`s${i}`} points={starPoints(s.x, s.y, s.r, s.r * 0.38)} fill="#fff" opacity={0.9} />
      ))}
    </g>
  );

  const shadowRx = float ? rx * 0.6 : Math.max(rx * 0.95, 70);

  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      role="img"
      aria-label={label ?? "A strange creature"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width={400} height={400} fill={bg} />
      {decorEl}
      <ellipse cx={200} cy={GROUND + 52} rx={320} ry={80} fill="#fff" opacity={0.5} />
      <ellipse
        cx={CX}
        cy={float ? GROUND + 8 : GROUND + 2}
        rx={shadowRx}
        ry={float ? 7 : 11}
        fill={INK}
        opacity={float ? 0.13 : 0.18}
      />

      <g transform={`translate(${CX} ${GROUND}) scale(${fit}) translate(${-CX} ${-GROUND})`}>
        {legsEl}
        {tailEl}
        {armsBack}
        {spikesEl}
        {shellEl}

        {/* body */}
        <defs>
          <clipPath id={clipId}>
            <path d={bodyD} />
          </clipPath>
        </defs>
        <path d={bodyD} fill={pal.body} />
        <g clipPath={`url(#${clipId})`}>
          {spec.belly && (
            <ellipse cx={CX} cy={bodyCy + ry * 0.28} rx={rx * 0.62} ry={ry * 0.62} fill={pal.belly} />
          )}
          {patternEl}
        </g>
        <path
          d={`M ${CX - rx * 0.74} ${bodyCy + ry * 0.12} Q ${CX - rx * 0.8} ${bodyCy - ry * 0.3} ${CX - rx * 0.62} ${bodyCy - ry * 0.55}`}
          fill="none"
          stroke="#fff"
          strokeWidth={7}
          strokeLinecap="round"
          opacity={0.4}
        />
        <path d={bodyD} fill="none" {...ST} />
        {spec.neck > 0 && !spec.merged && (
          <g>
            <rect x={CX - neckW} y={hcy} width={neckW * 2} height={neckBottom - hcy} fill={pal.body} />
            <path d={`M ${CX - neckW} ${hcy} L ${CX - neckW} ${neckBottom}`} stroke={INK} strokeWidth={SW} />
            <path d={`M ${CX + neckW} ${hcy} L ${CX + neckW} ${neckBottom}`} stroke={INK} strokeWidth={SW} />
          </g>
        )}
        {armsFront}

        {/* head */}
        <g transform={`translate(${hx} ${hcy}) rotate(${art.tilt})`}>
          {earsEl}
          {topperEl}
          {stalkEyes}
          {headShapeEl}
          {blushEl}
          {eyesEl}
          {browsEl}
          {mouthEl}
          {whiskersEl}
          {specsEl}
          {hatEl}
        </g>
        {neckwearEl}
      </g>
    </svg>
  );
}
