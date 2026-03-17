import { useState, useEffect, useRef } from "react";

const SLIDES = [
  {
    id: "grow",
    title: "Grow",
    subtitle: "Life is a numbers game.\nMake yours compound.",
    accent: "#4ADE80",
    accentDark: "#16a34a",
    tag: "WEALTH",
    // Cinematic tree / nature scene via SVG + CSS
    bg: "grow",
    hint: "SIP · Goal Planner · Returns",
  },
  {
    id: "buy",
    title: "Buy",
    subtitle: "Big decisions start\nwith small calculations.",
    accent: "#38BDF8",
    accentDark: "#0369a1",
    tag: "LIFESTYLE",
    bg: "buy",
    hint: "Home · Car · Down Payment",
  },
  {
    id: "borrow",
    title: "Borrow",
    subtitle: "Borrow smart.\nNot more.",
    accent: "#C084FC",
    accentDark: "#7e22ce",
    tag: "DEBT",
    bg: "borrow",
    hint: "EMI · Loan Affordability",
  },
];

// ─── CINEMATIC SVG BACKGROUNDS ───────────────────────────────────────────────

function GrowBg() {
  return (
    <svg viewBox="0 0 800 900" xmlns="http://www.w3.org/2000/svg"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}>
      <defs>
        <radialGradient id="sky" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#0a2a0a" />
          <stop offset="60%" stopColor="#061a06" />
          <stop offset="100%" stopColor="#020c02" />
        </radialGradient>
        <radialGradient id="glow1" cx="50%" cy="45%" r="40%">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="moonGlow" cx="72%" cy="18%" r="12%">
          <stop offset="0%" stopColor="#d4ffd4" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#86efac" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </radialGradient>
        <filter id="blur1"><feGaussianBlur stdDeviation="2" /></filter>
        <filter id="blur2"><feGaussianBlur stdDeviation="8" /></filter>
        <filter id="softglow"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>

      {/* Sky */}
      <rect width="800" height="900" fill="url(#sky)" />
      <rect width="800" height="900" fill="url(#glow1)" />

      {/* Moon */}
      <circle cx="576" cy="130" r="52" fill="url(#moonGlow)" />
      <circle cx="576" cy="130" r="30" fill="#d4ffd4" opacity="0.85" filter="url(#blur1)" />
      <circle cx="576" cy="130" r="24" fill="#f0fff0" opacity="0.95" />

      {/* Stars */}
      {[[80,60],[150,35],[250,80],[380,45],[450,90],[620,55],[700,80],[730,30],[60,120],[320,110],[680,110]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r={i%3===0?1.5:1} fill="white" opacity={0.4+Math.random()*0.4} />
      ))}

      {/* Background misty hills */}
      <ellipse cx="400" cy="680" rx="550" ry="220" fill="#0d2010" opacity="0.7" />
      <ellipse cx="200" cy="700" rx="320" ry="180" fill="#0a1a0c" opacity="0.6" />
      <ellipse cx="650" cy="710" rx="300" ry="160" fill="#0a1a0c" opacity="0.5" />

      {/* Main Tree trunk */}
      <path d="M380 900 L380 580 Q382 540 390 500 Q400 460 405 420 Q408 390 400 360" stroke="#1a3a1a" strokeWidth="28" fill="none" strokeLinecap="round" />
      <path d="M380 900 L378 580 Q376 540 370 500 Q362 460 358 420 Q354 390 360 360" stroke="#142e14" strokeWidth="22" fill="none" strokeLinecap="round" />

      {/* Thick branches */}
      <path d="M385 520 Q320 460 260 430 Q220 415 190 410" stroke="#163016" strokeWidth="14" fill="none" strokeLinecap="round" />
      <path d="M388 490 Q450 440 510 400 Q550 375 580 365" stroke="#163016" strokeWidth="12" fill="none" strokeLinecap="round" />
      <path d="M392 460 Q350 400 300 370 Q270 352 240 345" stroke="#163016" strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d="M395 440 Q440 390 490 355 Q520 335 545 325" stroke="#163016" strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M398 560 Q340 530 290 520 Q260 515 235 516" stroke="#163016" strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M390 560 Q440 530 500 525 Q530 523 560 525" stroke="#163016" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M400 380 Q390 330 388 290 Q388 265 392 240" stroke="#163016" strokeWidth="10" fill="none" strokeLinecap="round" />

      {/* Dense foliage clusters — dark green base */}
      {[
        [390,290,90],[310,320,75],[470,310,70],[260,360,80],[530,350,72],
        [220,390,65],[570,375,62],[350,260,68],[430,255,72],[390,225,60],
        [280,415,58],[510,400,55],[240,340,60],[560,330,58],[320,290,55],
        [460,285,52],[190,415,60],[605,365,52],[350,380,62],[440,370,58],
        [270,450,55],[520,440,52],[230,510,58],[560,505,52],
      ].map(([cx,cy,r],i) => (
        <ellipse key={`f${i}`} cx={cx} cy={cy} rx={r} ry={r*0.75} fill={`hsl(${130+i%15},${55+i%20}%,${10+i%8}%)`} opacity={0.9} />
      ))}

      {/* Bright green highlight leaves */}
      {[
        [350,270,40],[430,260,38],[390,240,35],[280,350,36],[510,335,34],
        [240,380,32],[555,360,30],[320,300,34],[460,295,32],[270,430,30],
        [530,420,28],[220,345,30],[580,340,26],
      ].map(([cx,cy,r],i) => (
        <ellipse key={`h${i}`} cx={cx} cy={cy} rx={r} ry={r*0.7} fill={`hsl(${128+i%10},${70+i%15}%,${22+i%12}%)`} opacity={0.85} />
      ))}

      {/* Gold/amber fruits */}
      {[
        [310,340],[480,320],[265,390],[555,375],[340,280],[445,270],
        [220,410],[600,358],[370,395],[430,385],[285,450],[535,438],
      ].map(([cx,cy],i) => (
        <g key={`fr${i}`}>
          <circle cx={cx} cy={cy} r={7} fill="#f59e0b" opacity={0.9} />
          <circle cx={cx-2} cy={cy-2} r={3} fill="#fde68a" opacity={0.7} />
        </g>
      ))}

      {/* Root spread */}
      <path d="M370 880 Q310 860 260 870 Q230 875 210 890" stroke="#0f1f0f" strokeWidth="10" fill="none" strokeLinecap="round" opacity="0.8" />
      <path d="M390 885 Q450 865 500 872 Q530 878 555 890" stroke="#0f1f0f" strokeWidth="9" fill="none" strokeLinecap="round" opacity="0.8" />
      <path d="M375 892 Q340 880 305 888" stroke="#0f1f0f" strokeWidth="7" fill="none" strokeLinecap="round" opacity="0.6" />

      {/* Ground */}
      <rect x="0" y="860" width="800" height="40" fill="#070e07" />
    </svg>
  );
}

function BuyBg() {
  return (
    <svg viewBox="0 0 800 900" xmlns="http://www.w3.org/2000/svg"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}>
      <defs>
        <linearGradient id="buySky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a1628" />
          <stop offset="50%" stopColor="#0d1f3e" />
          <stop offset="100%" stopColor="#060f1e" />
        </linearGradient>
        <radialGradient id="cityGlow" cx="50%" cy="60%" r="50%">
          <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sunriseGlow" cx="50%" cy="55%" r="40%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </radialGradient>
        <filter id="winblur"><feGaussianBlur stdDeviation="1" /></filter>
      </defs>

      <rect width="800" height="900" fill="url(#buySky)" />
      <rect width="800" height="900" fill="url(#cityGlow)" />
      <rect width="800" height="900" fill="url(#sunriseGlow)" />

      {/* Stars */}
      {[[60,40],[130,70],[200,30],[300,60],[420,40],[520,70],[640,35],[720,65],[80,100],[350,90],[600,80],[740,100]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r={1} fill="white" opacity={0.5} />
      ))}

      {/* Distant city skyline */}
      {[
        [0,600,60,260],[60,590,40,270],[100,580,55,280],[155,570,45,285],
        [200,565,70,290],[270,575,35,275],[305,560,50,290],[355,570,40,280],
        [395,555,65,300],[460,568,38,282],[498,560,55,295],[553,572,40,278],
        [593,558,60,297],[653,570,42,280],[695,565,50,285],[745,575,55,275],
      ].map(([x,y,w,h],i) => (
        <rect key={`b${i}`} x={x} y={y} width={w} height={h} fill={`hsl(220,${30+i%15}%,${8+i%6}%)`} />
      ))}

      {/* Windows in distant buildings - tiny lights */}
      {Array.from({length:40}).map((_,i) => (
        <rect key={`w${i}`} x={20+i*19} y={575+(i%4)*20} width={3} height={4}
          fill="#93c5fd" opacity={0.3+Math.random()*0.4} />
      ))}

      {/* Main modern house */}
      {/* Main body */}
      <rect x="160" y="480" width="480" height="340" fill="#0d1f38" rx="4" />
      {/* Roof / flat top with overhang */}
      <rect x="140" y="460" width="520" height="30" fill="#0a1830" rx="3" />
      {/* Second floor */}
      <rect x="180" y="400" width="360" height="90" fill="#0e2240" rx="3" />
      <rect x="170" y="388" width="380" height="20" fill="#0a1830" rx="2" />

      {/* Large floor-to-ceiling windows — lit warm */}
      <rect x="185" y="500" width="100" height="140" fill="#1e3a5f" rx="2" />
      <rect x="188" y="503" width="94" height="134" fill="#1a3358" rx="1" opacity="0.8" />
      {/* window light glow */}
      <rect x="195" y="510" width="80" height="118" fill="#fbbf24" opacity="0.08" rx="1" />
      <line x1="237" y1="503" x2="237" y2="637" stroke="#0d1f38" strokeWidth="3" />
      <line x1="185" y1="573" x2="285" y2="573" stroke="#0d1f38" strokeWidth="2" />

      {/* Middle window group */}
      <rect x="310" y="490" width="180" height="160" fill="#1e3a5f" rx="2" />
      <rect x="313" y="493" width="174" height="154" fill="#1a3358" rx="1" />
      <rect x="320" y="500" width="160" height="140" fill="#fbbf24" opacity="0.07" rx="1" />
      <line x1="400" y1="493" x2="400" y2="647" stroke="#0d1f38" strokeWidth="3" />
      <line x1="310" y1="570" x2="490" y2="570" stroke="#0d1f38" strokeWidth="2" />

      {/* Right windows */}
      <rect x="515" y="500" width="100" height="140" fill="#1e3a5f" rx="2" />
      <rect x="518" y="503" width="94" height="134" fill="#1a3358" rx="1" />
      <rect x="525" y="510" width="80" height="118" fill="#fbbf24" opacity="0.06" rx="1" />
      <line x1="568" y1="503" x2="568" y2="637" stroke="#0d1f38" strokeWidth="3" />
      <line x1="515" y1="573" x2="615" y2="573" stroke="#0d1f38" strokeWidth="2" />

      {/* Second floor windows */}
      <rect x="200" y="408" width="70" height="60" fill="#1a3358" rx="2" />
      <rect x="203" y="411" width="64" height="54" fill="#fbbf24" opacity="0.1" rx="1" />
      <rect x="345" y="408" width="110" height="60" fill="#1a3358" rx="2" />
      <rect x="348" y="411" width="104" height="54" fill="#fbbf24" opacity="0.08" rx="1" />
      <rect x="480" y="408" width="70" height="60" fill="#1a3358" rx="2" />

      {/* Front door */}
      <rect x="365" y="680" width="70" height="140" fill="#0a1830" rx="3" />
      <rect x="368" y="683" width="64" height="134" fill="#0d2040" rx="2" />
      <circle cx="425" cy="752" r="4" fill="#fbbf24" opacity="0.8" />

      {/* Pathway */}
      <path d="M365 820 L250 900 M435 820 L550 900" stroke="#1a3050" strokeWidth="3" opacity="0.6" />
      <rect x="365" y="820" width="70" height="80" fill="#0f1e30" opacity="0.5" />

      {/* Landscape / bushes */}
      <ellipse cx="185" cy="825" rx="60" ry="25" fill="#0a2010" />
      <ellipse cx="185" cy="815" rx="45" ry="22" fill="#0d2814" />
      <ellipse cx="615" cy="825" rx="60" ry="25" fill="#0a2010" />
      <ellipse cx="615" cy="815" rx="45" ry="22" fill="#0d2814" />

      {/* Ground / lawn */}
      <rect x="0" y="840" width="800" height="60" fill="#070e18" />
      <rect x="0" y="855" width="800" height="45" fill="#060c15" />

      {/* Reflection pool / driveway */}
      <ellipse cx="400" cy="875" rx="120" ry="18" fill="#0d1f38" opacity="0.6" />
    </svg>
  );
}

function BorrowBg() {
  return (
    <svg viewBox="0 0 800 900" xmlns="http://www.w3.org/2000/svg"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}>
      <defs>
        <linearGradient id="borrowSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a0a2e" />
          <stop offset="45%" stopColor="#2d1050" />
          <stop offset="100%" stopColor="#0d0618" />
        </linearGradient>
        <radialGradient id="purpleOrb" cx="35%" cy="35%" r="45%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </radialGradient>
        <filter id="glow3"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>

      <rect width="800" height="900" fill="url(#borrowSky)" />
      <rect width="800" height="900" fill="url(#purpleOrb)" />

      {/* Stars */}
      {[[50,50],[120,30],[200,70],[310,40],[430,60],[540,35],[660,55],[740,75],[90,110],[270,95],[480,100],[700,90],[160,140],[380,130],[600,120]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r={i%4===0?1.8:1} fill="white" opacity={0.3+i%3*0.15} />
      ))}

      {/* Abstract balance scale — center */}
      {/* Fulcrum base */}
      <rect x="370" y="620" width="60" height="180" fill="#2d1060" rx="4" />
      <rect x="340" y="790" width="120" height="20" fill="#3b1580" rx="4" />
      <ellipse cx="400" cy="620" rx="20" ry="10" fill="#4c1d95" />

      {/* Scale beam */}
      <rect x="160" y="490" width="480" height="12" fill="#6d28d9" rx="6" />

      {/* Left pan — heavier (debt) */}
      <line x1="200" y1="502" x2="230" y2="590" stroke="#7c3aed" strokeWidth="3" />
      <line x1="240" y1="502" x2="230" y2="590" stroke="#7c3aed" strokeWidth="3" />
      <path d="M190 590 Q230 600 270 590" stroke="#7c3aed" strokeWidth="3" fill="none" />
      {/* debt coins */}
      <ellipse cx="230" cy="585" rx="50" ry="12" fill="#4c1d95" opacity="0.9" />
      <ellipse cx="230" cy="575" rx="42" ry="10" fill="#5b21b6" />
      <ellipse cx="230" cy="567" rx="35" ry="9" fill="#6d28d9" />
      <ellipse cx="230" cy="560" rx="28" ry="7" fill="#7c3aed" />
      {/* X marks - danger */}
      <text x="220" y="548" fontSize="14" fill="#c084fc" fontFamily="monospace" opacity="0.7">✕</text>

      {/* Right pan — smart borrow */}
      <line x1="560" y1="502" x2="570" y2="560" stroke="#7c3aed" strokeWidth="3" />
      <line x1="600" y1="502" x2="570" y2="560" stroke="#7c3aed" strokeWidth="3" />
      <path d="M530 560 Q570 568 610 560" stroke="#7c3aed" strokeWidth="3" fill="none" />
      {/* smart coins - fewer */}
      <ellipse cx="570" cy="555" rx="40" ry="10" fill="#3b1580" opacity="0.9" />
      <ellipse cx="570" cy="547" rx="32" ry="8" fill="#4c1d95" />
      <ellipse cx="570" cy="541" rx="22" ry="6" fill="#6d28d9" />
      {/* Check mark */}
      <text x="558" y="535" fontSize="14" fill="#c084fc" fontFamily="monospace" opacity="0.8">✓</text>

      {/* Floating coin particles */}
      {[[280,360],[320,300],[350,380],[440,290],[470,360],[510,310],[380,250],[420,340]].map(([x,y],i) => (
        <g key={`c${i}`}>
          <ellipse cx={x} cy={y} rx={14+i%5*2} ry={5+i%3} fill={`hsl(270,${60+i*5}%,${30+i%15}%)`} opacity={0.5+i%3*0.15} />
          <ellipse cx={x} cy={y-2} rx={10+i%4*2} ry={4+i%2} fill={`hsl(270,${50+i*5}%,${40+i%12}%)`} opacity={0.4} />
        </g>
      ))}

      {/* Abstract graph line suggesting growth through smart borrowing */}
      <polyline points="100,750 160,720 220,700 300,680 360,650 420,640 500,620 580,580 660,555 740,530"
        stroke="#8b5cf6" strokeWidth="2" fill="none" opacity="0.4" />

      {/* Glowing orbs */}
      <circle cx="200" cy="350" r="30" fill="#7c3aed" opacity="0.08" filter="url(#glow3)" />
      <circle cx="600" cy="300" r="25" fill="#a78bfa" opacity="0.1" filter="url(#glow3)" />

      {/* Ground */}
      <rect x="0" y="830" width="800" height="70" fill="#0d0618" />
    </svg>
  );
}

const BG_MAP = { grow: GrowBg, buy: BuyBg, borrow: BorrowBg };

// ─── SLIDE ───────────────────────────────────────────────────────────────────
function Slide({ slide, active }) {
  const BgComp = BG_MAP[slide.bg];
  return (
    <div style={{
      position: "absolute", inset: 0,
      opacity: active ? 1 : 0,
      transition: "opacity 1s cubic-bezier(0.4,0,0.2,1)",
      zIndex: active ? 2 : 1,
    }}>
      {/* Background scene */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <BgComp />
      </div>

      {/* Gradient overlay — transparent top, dark bottom */}
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(
          to bottom,
          rgba(0,0,0,0) 0%,
          rgba(0,0,0,0.05) 20%,
          rgba(0,0,0,0.4) 40%,
          rgba(0,0,0,0.8) 60%,
          rgba(0,0,0,0.95) 80%,
          rgba(0,0,0,1) 100%
        )`,
      }} />

      {/* Side vignette */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)",
      }} />

      {/* Content — bottom anchored */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: "0 32px 220px",
        paddingLeft: "clamp(32px, 10vw, 120px)",
        maxWidth: "min(800px, 50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        transform: active ? "translateY(0)" : "translateY(16px)",
        opacity: active ? 1 : 0,
        transition: "all 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s",
      }}>
        {/* Category tag */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16,
          padding: "5px 14px", borderRadius: 99,
          background: `${slide.accent}18`,
          border: `1px solid ${slide.accent}44`,
        }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: slide.accent, boxShadow: `0 0 8px ${slide.accent}` }} />
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", color: slide.accent }}>
            {slide.tag}
          </span>
        </div>

        {/* Title */}
        <div style={{
          fontSize: "clamp(56px, 14vw, 96px)",
          fontWeight: 900,
          color: "#fff",
          letterSpacing: "-0.04em",
          lineHeight: 0.95,
          fontFamily: "'Playfair Display', Georgia, serif",
          marginBottom: 18,
          textShadow: "0 4px 40px rgba(0,0,0,0.8)",
        }}>
          {slide.title}
        </div>

        {/* Subtitle */}
        <div style={{
          fontSize: "clamp(15px, 4vw, 20px)",
          color: "rgba(255,255,255,0.72)",
          lineHeight: 1.5,
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 400,
          maxWidth: 340,
          letterSpacing: "0.01em",
          whiteSpace: "pre-line",
        }}>
          {slide.subtitle}
        </div>

        {/* Hint chips */}
        <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {slide.hint.split(" · ").map(h => (
            <span key={h} style={{
              fontSize: 11, color: "rgba(255,255,255,0.38)",
              padding: "4px 10px", borderRadius: 99,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.09)",
            }}>{h}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── DOTS ────────────────────────────────────────────────────────────────────
function Dots({ count, active, slides, onSelect }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {Array.from({ length: count }).map((_, i) => (
        <button key={i} onClick={() => onSelect(i)} style={{
          padding: 0, border: "none", background: "none", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <div style={{
            height: 3, borderRadius: 99,
            width: active === i ? 28 : 8,
            background: active === i ? slides[i].accent : "rgba(255,255,255,0.25)",
            boxShadow: active === i ? `0 0 8px ${slides[i].accent}` : "none",
            transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
          }} />
        </button>
      ))}
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function LandingPage({ onStart }) {
  const [current, setCurrent] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const timerRef = useRef(null);

  const slide = SLIDES[current];

  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  // Auto-advance
  useEffect(() => {
    timerRef.current = setTimeout(() => setCurrent(c => (c + 1) % SLIDES.length), 5000);
    return () => clearTimeout(timerRef.current);
  }, [current]);

  const goTo = (i) => { clearTimeout(timerRef.current); setCurrent(i); };
  const goNext = () => goTo((current + 1) % SLIDES.length);
  const goPrev = () => goTo((current - 1 + SLIDES.length) % SLIDES.length);

  // Swipe
  const onTouchStart = (e) => { setDragging(true); setDragStart(e.touches[0].clientX); };
  const onTouchEnd = (e) => {
    if (!dragging) return; setDragging(false);
    const diff = dragStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? goNext() : goPrev();
  };
  const onMouseDown = (e) => { setDragging(true); setDragStart(e.clientX); };
  const onMouseUp = (e) => {
    if (!dragging) return; setDragging(false);
    const diff = dragStart - e.clientX;
    if (Math.abs(diff) > 60) diff > 0 ? goNext() : goPrev();
  };

  return (
    <div
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown} onMouseUp={onMouseUp}
      style={{
        width: "100%", height: "100vh", position: "relative",
        background: "#000", overflow: "hidden",
        userSelect: "none", cursor: dragging ? "grabbing" : "grab",
        opacity: mounted ? 1 : 0, transition: "opacity 0.6s ease",
      }}>

      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,600;9..40,700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        * { box-sizing: border-box; }
        .nav-arrow { display: none !important; }
        
        @media (min-width: 1024px) {
          .nav-arrow { display: flex !important; }
        }
      `}</style>

      {/* Slides */}
      {SLIDES.map((s, i) => (
        <Slide key={s.id} slide={s} active={i === current} />
      ))}

      {/* Top bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 50,
        padding: "24px 32px 0",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        animation: "fadeUp 0.8s ease 0.3s both",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ 
            fontSize: 18, 
            fontWeight: 800, 
            letterSpacing: "-0.02em", 
            color: "#fff",
            fontFamily: "Inter, sans-serif"
          }}>
            WhatIff
          </div>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "5px 12px", borderRadius: 99,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(10px)",
        }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ade80", animation: "pulse 2s infinite", boxShadow: "0 0 6px #4ade80" }} />
          <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: "0.06em" }}>OFFLINE CAPABLE</span>
        </div>
      </div>

      {/* Navigation arrows */}
      {[{ dir: -1, label: "Previous" }, { dir: 1, label: "Next" }].map(({ dir, label }) => (
        <button 
          key={dir} 
          onClick={dir === 1 ? goNext : goPrev}
          aria-label={label}
          className="nav-arrow"
          style={{
            position: "absolute", 
            top: "50%",
            transform: "translateY(-50%)",
            [dir === 1 ? "right" : "left"]: "32px",
            zIndex: 20,
            width: 44, 
            height: 44, 
            borderRadius: "50%", 
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.07)", 
            backdropFilter: "blur(8px)",
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            cursor: "pointer", 
            color: "rgba(255,255,255,0.6)", 
            fontSize: 20,
            transition: "all 0.2s ease",
          }}>
          {dir === -1 ? "‹" : "›"}
        </button>
      ))}

      {/* Bottom UI */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10,
        padding: "0 32px 44px",
        display: "flex", flexDirection: "column", gap: 36,
        animation: "fadeUp 0.8s ease 0.5s both",
      }}>
        {/* Dots + slide count */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Dots count={SLIDES.length} active={current} slides={SLIDES} onSelect={goTo} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", fontFamily: "'DM Sans', sans-serif" }}>
            {String(current + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
          </span>
        </div>

        {/* CTA Button */}
        <button onClick={onStart} style={{
          width: "100%", padding: "18px 28px",
          borderRadius: 16, border: `1px solid ${slide.accent}55`,
          background: `linear-gradient(135deg, ${slide.accent}22, ${slide.accent}0a)`,
          backdropFilter: "blur(20px)",
          cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
          boxShadow: `0 0 40px ${slide.accent}18, inset 0 1px 0 rgba(255,255,255,0.08)`,
        }}>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>
              No login · No data stored
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
              Run Scenarios →
            </div>
          </div>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: slide.accent,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, flexShrink: 0,
            boxShadow: `0 4px 20px ${slide.accent}66`,
            transition: "all 0.3s ease",
          }}>
            {current === 0 ? "🌱" : current === 1 ? "🏠" : "💳"}
          </div>
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "rgba(255,255,255,0.07)", zIndex: 11 }}>
        <div key={current} style={{
          height: "100%", background: slide.accent,
          boxShadow: `0 0 8px ${slide.accent}`,
          animation: "growBar 5s linear forwards",
        }} />
      </div>
      <style>{`@keyframes growBar { from{width:0%} to{width:100%} }`}</style>
    </div>
  );
}
