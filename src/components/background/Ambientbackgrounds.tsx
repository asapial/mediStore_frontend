"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

// ─────────────────────────────────────────────────────────────────────────────
// PHARMORA — Ambient Background System
// 5 variants, each with unique particle type + mouse reactivity
// Fully aware of shadcn light / dark theme via `next-themes`
//
// Color palette (light mode):
//   Primary   Deep Navy   #1B3A5C
//   Accent    Warm Amber  #C2703A
//   BG        Cream       #F5EDE3
//   Surface   White       #FFFFFF
//   Info      Sky Blue    #3A6EA5
//   Success   Sage        #2E7D32
//   Error     Alert Red   #C62828
//   Text      Espresso    #5C4033
//   Muted     Warm Taupe  #8A6650
//
// Dark mode mapped equivalents are computed per-component.
// ─────────────────────────────────────────────────────────────────────────────

// ── Shared CSS keyframes injected once ───────────────────────────────────────
const KEYFRAMES = `
  @keyframes ph-drift1 {
    0%,100% { transform:translate(0,0) scale(1); }
    33%      { transform:translate(28px,-22px) scale(1.07); }
    66%      { transform:translate(-22px,26px) scale(0.94); }
  }
  @keyframes ph-drift2 {
    0%,100% { transform:translate(0,0) scale(1); }
    40%      { transform:translate(-32px,18px) scale(1.09); }
    70%      { transform:translate(24px,-28px) scale(0.91); }
  }
  @keyframes ph-drift3 {
    0%,100% { transform:translate(0,0) scale(1); }
    50%      { transform:translate(18px,28px) scale(1.05); }
  }
  @keyframes ph-pulse {
    0%,100% { opacity:1; }
    50%      { opacity:0.45; }
  }
  @keyframes ph-breathe {
    0%,100% { transform:translate(-50%,-50%) scale(1);   opacity:0.85; }
    50%      { transform:translate(-50%,-50%) scale(1.14); opacity:0.5; }
  }
  @keyframes ph-float {
    0%,100% { transform:translateY(0px); }
    50%      { transform:translateY(-16px); }
  }
  @keyframes ph-scanline {
    0%   { background-position:0 0; }
    100% { background-position:0 40px; }
  }
  @keyframes ph-rotate {
    from { transform:rotate(0deg); }
    to   { transform:rotate(360deg); }
  }
  @keyframes ph-grid-pan {
    0%   { background-position:0 0; }
    100% { background-position:32px 32px; }
  }
  @keyframes ph-hex-drift {
    0%,100% { background-position:0 0; }
    50%      { background-position:20px 10px; }
  }
`;

function GlobalKeyframes() {
  return <style suppressHydrationWarning>{KEYFRAMES}</style>;
}

// ── Dark-mode colour resolver ─────────────────────────────────────────────────
function usePharmoraColors() {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  return {
    dark,
    navy:   dark ? "#4A7AB5" : "#1B3A5C",
    amber:  dark ? "#E08A4A" : "#C2703A",
    sky:    dark ? "#5A9FD5" : "#3A6EA5",
    sage:   dark ? "#4CAF50" : "#2E7D32",
    cream:  dark ? "#1A1410" : "#F5EDE3",
    taupe:  dark ? "#C4A882" : "#8A6650",
    espresso: dark ? "#D4B89A" : "#5C4033",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED: Canvas-based particle engine — each variant supplies its own
//         `drawFrame` function so particle SHAPES are fully customisable.
// ─────────────────────────────────────────────────────────────────────────────
interface Vec2 { x: number; y: number; }

interface BaseParticle {
  x: number; y: number;
  vx: number; vy: number;
  life: number;        // 0-1 normalised phase for animation
  lifeSpeed: number;   // how fast life oscillates
  size: number;
  opacity: number;
  // extra per-variant fields below:
  rotation?: number;
  rotationSpeed?: number;
  color?: string;
  trail?: Vec2[];
  trailMax?: number;
  sides?: number;      // polygon sides
  charge?: number;     // +1 / -1 for field-line variant
}

interface CanvasConfig {
  density?: number;        // px² per particle
  speed?: number;
  mouseRadius?: number;
  mouseForce?: number;
  mouseRepel?: boolean;    // true = repel, false = attract
  maxSpeed?: number;
  /** Called once after resize to build the particle array */
  init: (w: number, h: number) => BaseParticle[];
  /** Called every frame for each particle — draw it */
  draw: (ctx: CanvasRenderingContext2D, p: BaseParticle, frame: number, dark: boolean) => void;
  /** Called every frame for each pair (i < j) — draw connection if desired */
  connect?: (ctx: CanvasRenderingContext2D, a: BaseParticle, b: BaseParticle, dist: number, maxDist: number, dark: boolean) => void;
  connectDist?: number;
  /** Overall canvas opacity */
  opacity?: number;
}

function useParticleCanvas(config: CanvasConfig, dark: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<BaseParticle[]>([]);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef<Vec2>({ x: -9999, y: -9999 });
  const frameRef = useRef(0);
  const darkRef = useRef(dark);
  darkRef.current = dark;
  const configRef = useRef(config);
  configRef.current = config;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      particlesRef.current = configRef.current.init(canvas.width, canvas.height);
    };

    const tick = () => {
      const cfg = configRef.current;
      const isDark = darkRef.current;
      const W = canvas.width, H = canvas.height;
      frameRef.current++;
      const f = frameRef.current;

      ctx.clearRect(0, 0, W, H);

      const ps = particlesRef.current;
      const mr = cfg.mouseRadius ?? 140;
      const mf = cfg.mouseForce  ?? 0.012;
      const ms = cfg.maxSpeed    ?? 1.8;
      const repel = cfg.mouseRepel ?? false;
      const cd = cfg.connectDist ?? 0;

      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];

        // Advance life phase
        p.life = (p.life + p.lifeSpeed) % (Math.PI * 2);

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Bounce walls
        if (p.x < 0)  { p.x = 0;  p.vx *= -1; }
        if (p.x > W)  { p.x = W;  p.vx *= -1; }
        if (p.y < 0)  { p.y = 0;  p.vy *= -1; }
        if (p.y > H)  { p.y = H;  p.vy *= -1; }

        // Rotate
        if (p.rotation !== undefined && p.rotationSpeed !== undefined) {
          p.rotation += p.rotationSpeed;
        }

        // Trail
        if (p.trail && p.trailMax) {
          p.trail.push({ x: p.x, y: p.y });
          if (p.trail.length > p.trailMax) p.trail.shift();
        }

        // Mouse interaction
        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < mr * mr && d2 > 0.01) {
          const d = Math.sqrt(d2);
          const dir = repel ? -1 : 1;
          p.vx += (dx / d) * mf * dir;
          p.vy += (dy / d) * mf * dir;
        }

        // Clamp speed
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd > ms) { p.vx = (p.vx / spd) * ms; p.vy = (p.vy / spd) * ms; }

        // Draw particle
        cfg.draw(ctx, p, f, isDark);
      }

      // Connections
      if (cfg.connect && cd > 0) {
        for (let i = 0; i < ps.length - 1; i++) {
          for (let j = i + 1; j < ps.length; j++) {
            const dx = ps[i].x - ps[j].x;
            const dy = ps[i].y - ps[j].y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < cd) cfg.connect(ctx, ps[i], ps[j], d, cd, isDark);
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onLeave = () => { mouseRef.current = { x: -9999, y: -9999 }; };

    resize();
    tick();
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", resize);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return canvasRef;
}

// Polygon helper
function drawPolygon(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, sides: number, rotation: number) {
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const angle = rotation + (i / sides) * Math.PI * 2;
    const px = x + r * Math.cos(angle);
    const py = y + r * Math.sin(angle);
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
}

// Cross / plus helper
function drawCross(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  const arm = r * 0.35;
  const thick = r * 0.18;
  ctx.beginPath();
  ctx.rect(x - arm, y - thick, arm * 2, thick * 2);
  ctx.rect(x - thick, y - arm, thick * 2, arm * 2);
}

// ─────────────────────────────────────────────────────────────────────────────
// BG 1 — "Apothecary" — Homepage / Hero
// Particles: floating PILL CAPSULES (rounded rectangles) in navy + amber,
// connected by soft navy mesh lines.  Mouse attracts them.
// ─────────────────────────────────────────────────────────────────────────────
function PillCanvas({ dark }: { dark: boolean }) {
  const config: CanvasConfig = {
    density: 9000,
    speed: 0.7,
    mouseRadius: 150,
    mouseForce: 0.018,
    mouseRepel: false,
    maxSpeed: 2,
    connectDist: 120,

    init(w, h) {
      const count = Math.floor((w * h) / 9000);
      return Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        life: Math.random() * Math.PI * 2,
        lifeSpeed: 0.012 + Math.random() * 0.01,
        size: 8 + Math.random() * 14,     // capsule half-length
        opacity: 0.3 + Math.random() * 0.45,
        rotation: Math.random() * Math.PI,
        rotationSpeed: (Math.random() - 0.5) * 0.012,
        color: Math.random() > 0.65 ? "amber" : "navy",
      }));
    },

    draw(ctx, p, _f, dark) {
      const isAmber = p.color === "amber";
      const base   = isAmber
        ? (dark ? "rgba(224,138,74," : "rgba(194,112,58,")
        : (dark ? "rgba(74,122,181," : "rgba(27,58,92,");
      const alpha  = p.opacity * (0.85 + 0.15 * Math.sin(p.life));
      const len    = p.size;
      const r      = len * 0.38;       // capsule radius
      const rot    = p.rotation ?? 0;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(rot);

      // Capsule body
      ctx.beginPath();
      ctx.roundRect(-len, -r, len * 2, r * 2, r);
      ctx.fillStyle = `${base}${alpha})`;
      ctx.fill();

      // Left cap colour split (different shade)
      ctx.beginPath();
      ctx.roundRect(-len, -r, len, r * 2, [r, 0, 0, r]);
      const capColor = isAmber
        ? (dark ? "rgba(93,147,215," : "rgba(58,110,165,")
        : (dark ? "rgba(224,138,74," : "rgba(194,112,58,");
      ctx.fillStyle = `${capColor}${alpha * 0.9})`;
      ctx.fill();

      // Seam line
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.lineTo(0, r);
      ctx.strokeStyle = dark ? `rgba(255,255,255,${alpha * 0.25})` : `rgba(255,255,255,${alpha * 0.5})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.restore();
    },

    connect(ctx, a, b, d, maxD, dark) {
      const alpha = (1 - d / maxD) * (dark ? 0.12 : 0.09);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = dark
        ? `rgba(74,122,181,${alpha})`
        : `rgba(27,58,92,${alpha})`;
      ctx.lineWidth = 0.7;
      ctx.stroke();
    },
  };

  const ref = useParticleCanvas(config, dark);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-auto" style={{ opacity: 0.85 }} />;
}

export function AmbientBg1_Pharmora() {
  const { dark, navy, amber } = usePharmoraColors();

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden select-none" style={{ zIndex: -1 }}>
      <GlobalKeyframes />

      {/* Cream / dark base */}

      {/* Large drifting blobs */}
      <div className="absolute -top-48 -left-48 w-[640px] h-[640px] rounded-full blur-[140px]"
        style={{ background: `${navy}18`, animation: "ph-drift1 20s ease-in-out infinite" }} />
      <div className="absolute -bottom-32 right-0 w-[500px] h-[500px] rounded-full blur-[120px]"
        style={{ background: `${amber}14`, animation: "ph-drift2 25s ease-in-out infinite" }} />
      <div className="absolute top-1/2 left-1/3 w-[340px] h-[340px] rounded-full blur-[100px]"
        style={{ background: `${navy}0e`, animation: "ph-drift3 18s ease-in-out infinite, ph-pulse 12s ease-in-out infinite" }} />

      {/* Faint dot grid */}
      <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(${navy}88 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
          animation: "ph-grid-pan 14s linear infinite",
        }} />

      {/* Pill particles */}
      <div className="absolute inset-0 pointer-events-auto">
        <PillCanvas dark={dark} />
      </div>

      {/* Soft vignette edges */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F5EDE3]/40 dark:from-[#100D0A]/50 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#F5EDE3]/40 dark:from-[#100D0A]/50 to-transparent pointer-events-none" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BG 2 — "Molecular" — Product Listing / Shop pages
// Particles: HEXAGONS + TRIANGLES (molecular structure feel),
// with amber glow lines connecting them. Mouse repels.
// ─────────────────────────────────────────────────────────────────────────────
function MoleculeCanvas({ dark }: { dark: boolean }) {
  const config: CanvasConfig = {
    density: 10000,
    speed: 0.55,
    mouseRadius: 130,
    mouseForce: 0.022,
    mouseRepel: true,
    maxSpeed: 2.2,
    connectDist: 140,

    init(w, h) {
      const count = Math.floor((w * h) / 10000);
      return Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        life: Math.random() * Math.PI * 2,
        lifeSpeed: 0.008 + Math.random() * 0.012,
        size: 4 + Math.random() * 10,
        opacity: 0.2 + Math.random() * 0.5,
        rotation: Math.random() * Math.PI,
        rotationSpeed: (Math.random() - 0.5) * 0.008,
        sides: Math.random() > 0.5 ? 6 : 3,  // hex or triangle
        color: Math.random() > 0.6 ? "amber" : Math.random() > 0.5 ? "sky" : "navy",
      }));
    },

    draw(ctx, p, _f, dark) {
      const pulse = 0.8 + 0.2 * Math.sin(p.life);
      const r = p.size * pulse;
      const sides = p.sides ?? 6;
      const rot = p.rotation ?? 0;

      let fillColor: string;
      if (p.color === "amber") {
        fillColor = dark ? `rgba(224,138,74,${p.opacity * pulse})` : `rgba(194,112,58,${p.opacity * pulse})`;
      } else if (p.color === "sky") {
        fillColor = dark ? `rgba(90,159,213,${p.opacity * pulse})` : `rgba(58,110,165,${p.opacity * pulse})`;
      } else {
        fillColor = dark ? `rgba(74,122,181,${p.opacity * pulse})` : `rgba(27,58,92,${p.opacity * pulse})`;
      }

      ctx.save();
      drawPolygon(ctx, p.x, p.y, r, sides, rot);
      ctx.fillStyle = fillColor;
      ctx.fill();

      // Outline
      const strokeA = p.opacity * pulse * 0.6;
      ctx.strokeStyle = dark ? `rgba(255,255,255,${strokeA * 0.3})` : `rgba(255,255,255,${strokeA * 0.7})`;
      ctx.lineWidth = 0.6;
      ctx.stroke();
      ctx.restore();

      // Nucleus dot at centre of hexagons
      if (sides === 6) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 0.18, 0, Math.PI * 2);
        ctx.fillStyle = dark ? `rgba(224,138,74,${p.opacity * 0.8})` : `rgba(194,112,58,${p.opacity * 0.8})`;
        ctx.fill();
      }
    },

    connect(ctx, a, b, d, maxD, dark) {
      const alpha = (1 - d / maxD) * (dark ? 0.14 : 0.10);
      const isAmberPair = a.color === "amber" || b.color === "amber";
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = isAmberPair
        ? `rgba(194,112,58,${alpha * 1.3})`
        : dark
          ? `rgba(74,122,181,${alpha})`
          : `rgba(27,58,92,${alpha})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    },
  };

  const ref = useParticleCanvas(config, dark);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-auto" style={{ opacity: 0.8 }} />;
}

export function AmbientBg2_Pharmora() {
  const { dark, navy, amber, sky } = usePharmoraColors();

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden select-none" style={{ zIndex: -1 }}>
      <GlobalKeyframes />

      {/* Cross-hatch grid — molecular graph paper feel */}
      <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.06]"
        style={{
          backgroundImage: `linear-gradient(${navy}60 1px,transparent 1px),linear-gradient(90deg,${navy}60 1px,transparent 1px)`,
          backgroundSize: "44px 44px",
          animation: "ph-grid-pan 18s linear infinite",
        }} />

      <div className="absolute -top-32 left-1/4 w-[600px] h-[350px] rounded-full blur-[130px]"
        style={{ background: `${navy}18`, animation: "ph-pulse 10s ease-in-out infinite" }} />
      <div className="absolute bottom-0 -right-20 w-[480px] h-[480px] rounded-full blur-[110px]"
        style={{ background: `${amber}12`, animation: "ph-drift1 22s ease-in-out infinite" }} />
      <div className="absolute top-1/3 -left-16 w-[320px] h-[420px] rounded-full blur-[100px]"
        style={{ background: `${sky}0e`, animation: "ph-drift2 19s ease-in-out infinite", animationDelay: "-6s" }} />

      <div className="absolute inset-0 pointer-events-auto">
        <MoleculeCanvas dark={dark} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BG 3 — "Pulse" — Product Detail / Dashboard pages
// Particles: MEDICAL CROSS symbols + concentric RIPPLE rings on mouse hover,
// expanding rings emanate from cursor position.  Mouse attracts softly.
// ─────────────────────────────────────────────────────────────────────────────
interface Ripple { x: number; y: number; r: number; maxR: number; alpha: number; color: string; }

function PulseCanvas({ dark }: { dark: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const mouseRef  = useRef<Vec2>({ x: -9999, y: -9999 });
  const frameRef  = useRef(0);

  interface CrossParticle extends BaseParticle { flashTimer: number; }
  const particlesRef = useRef<CrossParticle[]>([]);
  const ripplesRef   = useRef<Ripple[]>([]);
  const lastRippleRef = useRef(0);
  const darkRef = useRef(dark);
  darkRef.current = dark;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const init = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const count = Math.floor((canvas.width * canvas.height) / 10500);
      particlesRef.current = Array.from({ length: count }, (): CrossParticle => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        life: Math.random() * Math.PI * 2,
        lifeSpeed: 0.01 + Math.random() * 0.015,
        size: 5 + Math.random() * 10,
        opacity: 0.15 + Math.random() * 0.4,
        flashTimer: 0,
      }));
    };

    const tick = () => {
      frameRef.current++;
      const f = frameRef.current;
      const W = canvas.width, H = canvas.height;
      const isDark = darkRef.current;
      const navyBase  = isDark ? "rgba(74,122,181," : "rgba(27,58,92,";
      const amberBase = isDark ? "rgba(224,138,74," : "rgba(194,112,58,";
      const sageBase  = isDark ? "rgba(76,175,80,"  : "rgba(46,125,50,";

      ctx.clearRect(0, 0, W, H);

      // Spawn ripple near mouse every ~40 frames
      if (f - lastRippleRef.current > 40 && mouseRef.current.x > 0) {
        const jitter = 30;
        ripplesRef.current.push({
          x: mouseRef.current.x + (Math.random() - 0.5) * jitter,
          y: mouseRef.current.y + (Math.random() - 0.5) * jitter,
          r: 0,
          maxR: 80 + Math.random() * 60,
          alpha: 0.45,
          color: Math.random() > 0.6 ? "amber" : "sage",
        });
        lastRippleRef.current = f;
      }

      // Draw & advance ripples
      ripplesRef.current = ripplesRef.current.filter(rp => rp.alpha > 0.005);
      for (const rp of ripplesRef.current) {
        rp.r     += 1.8;
        rp.alpha *= 0.965;
        const col = rp.color === "amber" ? amberBase : sageBase;
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.strokeStyle = `${col}${rp.alpha})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
        // Second inner ring
        if (rp.r > 12) {
          ctx.beginPath();
          ctx.arc(rp.x, rp.y, rp.r * 0.55, 0, Math.PI * 2);
          ctx.strokeStyle = `${col}${rp.alpha * 0.5})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }

      // Cross particles
      for (const p of particlesRef.current) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        p.life += p.lifeSpeed;
        if (p.flashTimer > 0) p.flashTimer--;

        // Mouse attract
        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 150 * 150 && d2 > 1) {
          const d = Math.sqrt(d2);
          p.vx += (dx / d) * 0.014;
          p.vy += (dy / d) * 0.014;
          // Flash when very close
          if (d < 60) p.flashTimer = 12;
        }

        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd > 2) { p.vx = (p.vx / spd) * 2; p.vy = (p.vy / spd) * 2; }

        const pulse = 0.82 + 0.18 * Math.sin(p.life);
        const r     = p.size * pulse;
        const alpha = p.opacity * pulse * (p.flashTimer > 0 ? 2.2 : 1);
        const col   = p.flashTimer > 0 ? amberBase : navyBase;

        ctx.save();
        drawCross(ctx, p.x, p.y, r);
        ctx.fillStyle = `${col}${Math.min(alpha, 0.85)})`;
        ctx.fill();
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onLeave = () => { mouseRef.current = { x: -9999, y: -9999 }; };

    init();
    tick();
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", init);

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", init);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-auto" style={{ opacity: 0.75 }} />;
}

export function AmbientBg3_Pharmora() {
  const { dark, navy, amber, sage } = usePharmoraColors();

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden select-none" style={{ zIndex: -1 }}>
      <GlobalKeyframes />

      {/* Diagonal scan lines — EKG feel */}
      <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.035]"
        style={{
          backgroundImage: `repeating-linear-gradient(135deg,${navy}ff 0px,${navy}ff 1px,transparent 1px,transparent 36px)`,
          animation: "ph-grid-pan 22s linear infinite",
        }} />

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[380px] rounded-full blur-[140px]"
        style={{ background: `${sage}10`, animation: "ph-breathe 14s ease-in-out infinite" }} />
      <div className="absolute -bottom-40 -left-20 w-[520px] h-[440px] rounded-full blur-[120px]"
        style={{ background: `${navy}14`, animation: "ph-drift1 20s ease-in-out infinite" }} />
      <div className="absolute top-1/4 -right-10 w-[380px] h-[380px] rounded-full blur-[100px]"
        style={{ background: `${amber}10`, animation: "ph-drift2 17s ease-in-out infinite", animationDelay: "-5s" }} />

      <div className="absolute inset-0 pointer-events-auto">
        <PulseCanvas dark={dark} />
      </div>

      {/* EKG top fade */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#F5EDE3]/50 dark:from-[#0F0C0B]/60 to-transparent pointer-events-none" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BG 4 — "DNA" — Auth / Account / Sign-In pages
// Particles: small CIRCLES with COMET TRAILS, flowing top-to-bottom like
// a gentle waterfall / DNA strands.  Mouse deflects their paths sideways.
// ─────────────────────────────────────────────────────────────────────────────
function CometCanvas({ dark }: { dark: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const mouseRef  = useRef<Vec2>({ x: -9999, y: -9999 });
  const darkRef   = useRef(dark);
  darkRef.current = dark;

  interface CometParticle {
    x: number; y: number;
    vx: number; vy: number;
    size: number;
    opacity: number;
    trail: Vec2[];
    trailMax: number;
    color: string;
    life: number;
    lifeSpeed: number;
  }

  const particlesRef = useRef<CometParticle[]>([]);

  const makeParticle = (w: number, h: number, scatter = false): CometParticle => ({
    x: scatter ? Math.random() * w : Math.random() * w,
    y: scatter ? Math.random() * h : -10,
    vx: (Math.random() - 0.5) * 0.4,
    vy: 0.4 + Math.random() * 0.9,
    size: 1.2 + Math.random() * 2.8,
    opacity: 0.3 + Math.random() * 0.55,
    trail: [],
    trailMax: Math.floor(8 + Math.random() * 20),
    color: ["navy", "amber", "sky"][Math.floor(Math.random() * 3)],
    life: Math.random() * Math.PI * 2,
    lifeSpeed: 0.02 + Math.random() * 0.02,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const init = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const count = Math.floor((canvas.width * canvas.height) / 6000);
      particlesRef.current = Array.from({ length: count }, () => makeParticle(canvas.width, canvas.height, true));
    };

    const tick = () => {
      const W = canvas.width, H = canvas.height;
      const isDark = darkRef.current;

      ctx.clearRect(0, 0, W, H);

      const colorMap: Record<string, string> = {
        navy:  isDark ? "74,122,181"  : "27,58,92",
        amber: isDark ? "224,138,74"  : "194,112,58",
        sky:   isDark ? "90,159,213"  : "58,110,165",
      };

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];

        // Mouse deflect (horizontal push)
        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 140 * 140 && d2 > 1) {
          const d = Math.sqrt(d2);
          p.vx += (dx / d) * 0.025;   // push sideways
        }

        p.vx *= 0.98;   // dampen horizontal drift
        p.x  += p.vx;
        p.y  += p.vy;
        p.life += p.lifeSpeed;

        // Record trail
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > p.trailMax) p.trail.shift();

        // Respawn off top when exits bottom
        if (p.y > H + 20) {
          particlesRef.current[i] = makeParticle(W, H, false);
          continue;
        }

        const rgb = colorMap[p.color];
        const pulse = 0.8 + 0.2 * Math.sin(p.life);

        // Draw trail (gradient fade)
        if (p.trail.length > 1) {
          for (let t = 1; t < p.trail.length; t++) {
            const ta = (t / p.trail.length) * p.opacity * pulse * 0.6;
            ctx.beginPath();
            ctx.moveTo(p.trail[t - 1].x, p.trail[t - 1].y);
            ctx.lineTo(p.trail[t].x, p.trail[t].y);
            ctx.strokeStyle = `rgba(${rgb},${ta})`;
            ctx.lineWidth = p.size * (t / p.trail.length) * 0.9;
            ctx.stroke();
          }
        }

        // Head glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},${p.opacity * pulse})`;
        ctx.fill();

        // Inner bright core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.38 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.opacity * 0.55 * pulse})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onLeave = () => { mouseRef.current = { x: -9999, y: -9999 }; };

    init();
    tick();
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", init);

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", init);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-auto" style={{ opacity: 0.8 }} />;
}

export function AmbientBg4_Pharmora() {
  const { dark, navy, amber, sky } = usePharmoraColors();

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden select-none" style={{ zIndex: -1 }}>
      <GlobalKeyframes />

      {/* Vertical stripe guides — DNA ladder feel */}
      <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(90deg,${navy}50 1px,transparent 1px)`,
          backgroundSize: "60px 100%",
        }} />

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[260px] rounded-full blur-[130px]"
        style={{ background: `${navy}12`, animation: "ph-pulse 9s ease-in-out infinite" }} />
      <div className="absolute -bottom-24 left-0 w-[440px] h-[360px] rounded-full blur-[110px]"
        style={{ background: `${amber}0e`, animation: "ph-drift3 16s ease-in-out infinite" }} />
      <div className="absolute top-1/2 -translate-y-1/2 right-0 w-[340px] h-[440px] rounded-full blur-[100px]"
        style={{ background: `${sky}0c`, animation: "ph-drift1 21s ease-in-out infinite", animationDelay: "-7s" }} />

      <div className="absolute inset-0 pointer-events-auto">
        <CometCanvas dark={dark} />
      </div>

      {/* Central card-zone clearance vignette */}
      <div className="absolute inset-0 bg-radial-[ellipse_60%_50%_at_50%_50%] from-transparent to-[#F5EDE3]/30 dark:to-[#09080D]/40 pointer-events-none" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BG 5 — "Constellation" — Cart / Checkout / Order pages
// Particles: STARS (5-pointed) that twinkle + shoot tiny beams toward cursor.
// Mouse creates a gravity well — stars orbit around it slowly.
// ─────────────────────────────────────────────────────────────────────────────
function StarCanvas({ dark }: { dark: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const mouseRef  = useRef<Vec2>({ x: -9999, y: -9999 });
  const darkRef   = useRef(dark);
  darkRef.current = dark;

  interface StarParticle {
    x: number; y: number;
    vx: number; vy: number;
    size: number;
    opacity: number;
    twinklePhase: number;
    twinkleSpeed: number;
    color: string;
    beamAlpha: number;
    angle: number;           // orbit angle around mouse
    orbitRadius: number;     // 0 = not orbiting yet
    orbiting: boolean;
  }

  const particlesRef = useRef<StarParticle[]>([]);

  const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, spikes: number, innerRatio: number, rot: number) => {
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const angle = rot + (i * Math.PI) / spikes;
      const radius = i % 2 === 0 ? r : r * innerRatio;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const init = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const count = Math.floor((canvas.width * canvas.height) / 8000);
      particlesRef.current = Array.from({ length: count }, (): StarParticle => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        size: 3 + Math.random() * 9,
        opacity: 0.2 + Math.random() * 0.55,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.025 + Math.random() * 0.04,
        color: ["navy", "amber", "sky"][Math.floor(Math.random() * 3)],
        beamAlpha: 0,
        angle: Math.random() * Math.PI * 2,
        orbitRadius: 0,
        orbiting: false,
      }));
    };

    const tick = () => {
      const W = canvas.width, H = canvas.height;
      const isDark = darkRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      const colorMap: Record<string, [string, string]> = {
        navy:  [isDark ? "74,122,181"  : "27,58,92",  isDark ? "120,160,220" : "80,120,170"],
        amber: [isDark ? "224,138,74"  : "194,112,58", isDark ? "255,180,100" : "220,140,80"],
        sky:   [isDark ? "90,159,213"  : "58,110,165", isDark ? "130,190,240" : "90,150,210"],
      };

      ctx.clearRect(0, 0, W, H);

      for (const p of particlesRef.current) {
        p.twinklePhase += p.twinkleSpeed;
        const twinkle = 0.6 + 0.4 * Math.sin(p.twinklePhase);

        const dx = mx - p.x;
        const dy = my - p.y;
        const d  = Math.sqrt(dx * dx + dy * dy);

        if (d < 160 && d > 0) {
          // Orbit: nudge toward circular path
          p.angle += 0.018;
          p.orbitRadius = Math.min(p.orbitRadius + 1.5, d * 0.75);
          p.x = mx + Math.cos(p.angle) * (p.orbitRadius || d);
          p.y = my + Math.sin(p.angle) * (p.orbitRadius || d);
          p.orbiting = true;
          // Beam toward cursor
          p.beamAlpha = Math.min(p.beamAlpha + 0.06, 0.45);
        } else {
          p.orbiting = false;
          p.orbitRadius = Math.max(p.orbitRadius - 2, 0);
          p.beamAlpha  = Math.max(p.beamAlpha - 0.04, 0);
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > W) p.vx *= -1;
          if (p.y < 0 || p.y > H) p.vy *= -1;
        }

        const [rgb, rgbBright] = colorMap[p.color];
        const alpha = p.opacity * twinkle;
        const r     = p.size * twinkle;

        // Beam toward cursor
        if (p.beamAlpha > 0.02 && mx > 0) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mx, my);
          ctx.strokeStyle = `rgba(${rgb},${p.beamAlpha * twinkle})`;
          ctx.lineWidth   = 0.5;
          ctx.stroke();
        }

        // Glow aura
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 2.5);
        grd.addColorStop(0, `rgba(${rgbBright},${alpha * 0.4})`);
        grd.addColorStop(1, `rgba(${rgb},0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Star shape
        ctx.save();
        drawStar(ctx, p.x, p.y, r, 5, 0.42, p.twinklePhase * 0.3);
        ctx.fillStyle = `rgba(${rgbBright},${alpha})`;
        ctx.fill();
        ctx.restore();

        // Bright core
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 0.28, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha * 0.7})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onLeave = () => { mouseRef.current = { x: -9999, y: -9999 }; };

    init();
    tick();
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", init);

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", init);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-auto" style={{ opacity: 0.85 }} />;
}

export function AmbientBg5_Pharmora() {
  const { dark, navy, amber, sky } = usePharmoraColors();

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden select-none" style={{ zIndex: -1 }}>
      <GlobalKeyframes />

      {/* Star field dot matrix */}
      <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.07]"
        style={{
          backgroundImage: `radial-gradient(${navy}99 1px,transparent 1px)`,
          backgroundSize: "22px 22px",
        }} />

      <div className="absolute top-1/2 left-1/2 w-[1000px] h-[600px] rounded-full blur-[160px]"
        style={{ background: `${navy}10`, animation: "ph-breathe 16s ease-in-out infinite" }} />
      <div className="absolute -top-20 right-0 w-[460px] h-[380px] rounded-full blur-[110px]"
        style={{ background: `${amber}0d`, animation: "ph-drift1 22s ease-in-out infinite" }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[340px] rounded-full blur-[100px]"
        style={{ background: `${sky}0c`, animation: "ph-drift2 18s ease-in-out infinite", animationDelay: "-4s" }} />

      <div className="absolute inset-0 pointer-events-auto">
        <StarCanvas dark={dark} />
      </div>

      {/* Corner vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 50%, rgba(245,237,227,0.18) 100%)",
        }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTO AMBIENT BG — rotates BG1→BG5 automatically based on current hour
//
//  00:00–04:59  →  BG1 "Apothecary"  (pill capsules, late-night pharmacy)
//  05:00–09:59  →  BG2 "Molecular"   (hexagons, morning energy)
//  10:00–13:59  →  BG3 "Pulse"       (medical cross + ripples, midday)
//  14:00–18:59  →  BG4 "DNA / Comet" (comets, afternoon flow)
//  19:00–23:59  →  BG5 "Starfield"   (orbiting stars, evening/night)
//
// Re-checks every 60 seconds so the switch is live.
// ─────────────────────────────────────────────────────────────────────────────
export function AutoAmbientBg() {
  const getIndex = () => {
    const h = new Date().getHours();
    if (h < 5)  return 0;   // 00-04 → BG1 Pills/Apothecary
    if (h < 10) return 1;   // 05-09 → BG2 Molecular
    if (h < 14) return 2;   // 10-13 → BG3 Pulse
    if (h < 19) return 3;   // 14-18 → BG4 DNA/Comets
    return 4;               // 19-23 → BG5 Starfield
  };

  const [bgIndex, setBgIndex] = useState<number>(getIndex);

  useEffect(() => {
    const iv = setInterval(() => setBgIndex(getIndex()), 60_000);
    return () => clearInterval(iv);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const BG_MAP: Record<number, React.FC> = {
    0: AmbientBg1_Pharmora,
    1: AmbientBg2_Pharmora,
    2: AmbientBg3_Pharmora,
    3: AmbientBg4_Pharmora,
    4: AmbientBg5_Pharmora,
  };

  const ActiveBg = BG_MAP[bgIndex] ?? AmbientBg1_Pharmora;
  return <ActiveBg />;
}

