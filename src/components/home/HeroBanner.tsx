"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
    motion,
    AnimatePresence,
    useMotionValue,
    useTransform,
    useSpring,
    easeOut,
} from "framer-motion";
import { gsap } from "gsap";

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE DATA
// Replace `image` values with your actual PNG paths inside /public/
// e.g. "/slides/medicines.png"  →  place file at  public/slides/medicines.png
// ─────────────────────────────────────────────────────────────────────────────
const slides = [
    {
        id: 0,
        badge: "New Arrivals",
        heading: ["Your Health,", "Our Priority"],
        subheading: "Trusted Medicines & Supplements Delivered to Your Door",
        cta: "Shop Now",
        ctaSecondary: "Learn More",
        accentFrom: "#34d399",
        accentTo: "#14b8a6",
        bgLight: "from-emerald-50 via-teal-50 to-cyan-50",
        bgDark: "dark:from-emerald-950/60 dark:via-teal-900/40 dark:to-cyan-950/30",
        orbColor: "bg-emerald-400/20",
        orb2Color: "bg-teal-300/15",
        accentClass: "from-emerald-400 to-teal-500",
        tag: "Up to 30% off",
        tagColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300",
        // ── YOUR PNG HERE ──
        image: "https://i.ibb.co.com/397nzsW2/photo-2026-04-10-08-59-38.jpg",
        imageAlt: "Premium medicines and health products",
        particles: ["💊", "🧪", "🩺", "⚕️", "🏥"],
        floatingChips: [
            { icon: "✅", label: "FDA Approved", side: "left" },
            { icon: "🚚", label: "Free Delivery", side: "right" },
        ],
    },
    {
        id: 1,
        badge: "Vitamins & Supplements",
        heading: ["Boost Your", "Immunity Daily"],
        subheading: "Premium Vitamins, Minerals & Herbal Supplements for Every Lifestyle",
        cta: "Explore Range",
        ctaSecondary: "View Offers",
        accentFrom: "#60a5fa",
        accentTo: "#818cf8",
        bgLight: "from-blue-50 via-indigo-50 to-violet-50",
        bgDark: "dark:from-blue-950/60 dark:via-indigo-900/40 dark:to-violet-950/30",
        orbColor: "bg-blue-400/20",
        orb2Color: "bg-indigo-300/15",
        accentClass: "from-blue-400 to-indigo-500",
        tag: "Best Sellers",
        tagColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300",
        // ── YOUR PNG HERE ──
             image: "https://i.ibb.co.com/397nzsW2/photo-2026-04-10-08-59-38.jpg",
        imageAlt: "Vitamins and supplements collection",
        particles: ["🌿", "🍋", "🫐", "🌱", "✨"],
        floatingChips: [
            { icon: "⭐", label: "Top Rated", side: "left" },
            { icon: "🌿", label: "100% Natural", side: "right" },
        ],
    },
    {
        id: 2,
        badge: "Personal Care",
        heading: ["Look & Feel", "Your Best"],
        subheading: "Premium Skincare, Beauty & Personal Wellness Products",
        cta: "Shop Beauty",
        ctaSecondary: "See All",
        accentFrom: "#fb7185",
        accentTo: "#f472b6",
        bgLight: "from-rose-50 via-pink-50 to-fuchsia-50",
        bgDark: "dark:from-rose-950/60 dark:via-pink-900/40 dark:to-fuchsia-950/30",
        orbColor: "bg-rose-400/20",
        orb2Color: "bg-pink-300/15",
        accentClass: "from-rose-400 to-pink-500",
        tag: "Flash Sale 40% off",
        tagColor: "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300",
        // ── YOUR PNG HERE ──
           image: "https://i.ibb.co.com/397nzsW2/photo-2026-04-10-08-59-38.jpg",
        imageAlt: "Beauty and personal care products",
        particles: ["✨", "💄", "🌸", "💆", "🪷"],
        floatingChips: [
            { icon: "💎", label: "Premium", side: "left" },
            { icon: "🔥", label: "40% Off Today", side: "right" },
        ],
    },
    {
        id: 3,
        badge: "Medical Devices",
        heading: ["Monitor Your", "Health Easily"],
        subheading: "Accurate and Reliable Devices for Everyday Health Tracking",
        cta: "Shop Devices",
        ctaSecondary: "View Details",
        accentFrom: "#22c55e",
        accentTo: "#06b6d4",
        bgLight: "from-green-50 via-teal-50 to-cyan-50",
        bgDark: "dark:from-green-950/60 dark:via-teal-900/40 dark:to-cyan-950/30",
        orbColor: "bg-green-400/20",
        orb2Color: "bg-cyan-300/15",
        accentClass: "from-green-400 to-cyan-500",
        tag: "Top Rated Devices",
        tagColor: "bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-300",

             image: "https://i.ibb.co.com/397nzsW2/photo-2026-04-10-08-59-38.jpg",
        imageAlt: "Digital medical devices like thermometer and blood pressure monitor",

        particles: ["🩺", "📟", "💓", "⚕️"],
        floatingChips: [
            { icon: "📊", label: "Accurate Results", side: "left" },
            { icon: "🏥", label: "Clinic Grade", side: "right" },
        ],
    },
    {
        id: 4,
        badge: "Baby Care",
        heading: ["Gentle Care for", "Little Ones"],
        subheading: "Safe, Mild & Pediatrician-Recommended Baby Products",
        cta: "Shop Baby Care",
        ctaSecondary: "Explore",
        accentFrom: "#fbbf24",
        accentTo: "#fb7185",
        bgLight: "from-yellow-50 via-orange-50 to-rose-50",
        bgDark: "dark:from-yellow-900/40 dark:via-orange-900/30 dark:to-rose-900/40",
        orbColor: "bg-yellow-300/20",
        orb2Color: "bg-rose-300/15",
        accentClass: "from-yellow-400 to-rose-400",
        tag: "Safe & Mild",
        tagColor: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/60 dark:text-yellow-300",
      image: "https://i.ibb.co.com/397nzsW2/photo-2026-04-10-08-59-38.jpg",
        imageAlt: "Baby care products like lotion, powder, and oil",

        particles: ["🍼", "👶", "🌼", "💛"],
        floatingChips: [
            { icon: "🛡️", label: "Safe Formula", side: "left" },
            { icon: "🌿", label: "No Harsh Chemicals", side: "right" },
        ],
    },
    {
        id: 5,
        badge: "Pain Relief",
        heading: ["Fast Relief,", "Anytime"],
        subheading: "Effective Pain Relief Medicines for Quick Recovery",
        cta: "Shop Now",
        ctaSecondary: "Learn More",
        accentFrom: "#f97316",
        accentTo: "#ef4444",
        bgLight: "from-orange-50 via-red-50 to-rose-50",
        bgDark: "dark:from-orange-950/60 dark:via-red-900/40 dark:to-rose-950/30",
        orbColor: "bg-orange-400/20",
        orb2Color: "bg-red-300/15",
        accentClass: "from-orange-400 to-red-500",
        tag: "Hot Deals",
        tagColor: "bg-orange-100 text-orange-700 dark:bg-orange-900/60 dark:text-orange-300",

         image: "https://i.ibb.co.com/397nzsW2/photo-2026-04-10-08-59-38.jpg",
        imageAlt: "Pain relief tablets and gel products",

        particles: ["💊", "🔥", "⚡", "🩹"],
        floatingChips: [
            { icon: "⚡", label: "Fast Acting", side: "left" },
            { icon: "💯", label: "Trusted Brands", side: "right" },
        ],
    }


];

type Slide = typeof slides[0];

// ─────────────────────────────────────────────────────────────────────────────
// FLOATING EMOJI PARTICLE
// ─────────────────────────────────────────────────────────────────────────────
function FloatingParticle({ emoji, delay, x, y }: { emoji: string; delay: number; x: number; y: number }) {
    return (
        <motion.div
            className="absolute pointer-events-none select-none text-xl"
            style={{ left: `${x}%`, top: `${y}%` }}
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{
                opacity: [0, 0.65, 0.45, 0.65, 0],
                scale: [0, 1.1, 1, 1.1, 0],
                y: [20, -8, 0, -12, -28],
                rotate: [0, 10, -5, 8, 0],
            }}
            transition={{ duration: 6, delay, repeat: Infinity, repeatDelay: Math.random() * 3 + 2, ease: "easeInOut" }}
        >
            {emoji}
        </motion.div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// PARALLAX BACKGROUND ORBS
// ─────────────────────────────────────────────────────────────────────────────
function ParallaxOrbs({ orbColor, orb2Color, mouseX, mouseY }: { orbColor: string; orb2Color: string; mouseX: any; mouseY: any }) {
    const sx1 = useSpring(useTransform(mouseX, [0, 1], [-30, 30]), { stiffness: 60, damping: 20 });
    const sy1 = useSpring(useTransform(mouseY, [0, 1], [-20, 20]), { stiffness: 60, damping: 20 });
    const sx2 = useSpring(useTransform(mouseX, [0, 1], [20, -20]), { stiffness: 40, damping: 25 });
    const sy2 = useSpring(useTransform(mouseY, [0, 1], [15, -15]), { stiffness: 40, damping: 25 });
    const sx3 = useSpring(useTransform(mouseX, [0, 1], [-15, 15]), { stiffness: 80, damping: 15 });
    const sy3 = useSpring(useTransform(mouseY, [0, 1], [20, -20]), { stiffness: 80, damping: 15 });
    return (
        <>
            <motion.div className={`absolute w-[520px] h-[520px] rounded-full blur-3xl ${orbColor} -top-40 -left-40`} style={{ x: sx1, y: sy1 }} />
            <motion.div className={`absolute w-[420px] h-[420px] rounded-full blur-3xl ${orb2Color} -bottom-28 -right-28`} style={{ x: sx2, y: sy2 }} />
            <motion.div className={`absolute w-[260px] h-[260px] rounded-full blur-2xl ${orbColor} top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`} style={{ x: sx3, y: sy3 }} />
        </>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// FLOATING INFO CHIP (sits beside the image card)
// ─────────────────────────────────────────────────────────────────────────────
function FloatingChip({ icon, label, delay, accentFrom, accentTo }: { icon: string; label: string; delay: number; accentFrom: string; accentTo: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.55, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.55, y: 10, transition: { duration: 0.18 } }}
            transition={{ type: "spring", stiffness: 280, damping: 22, delay }}
        >
            <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.5 + delay, repeat: Infinity, ease: "easeInOut" }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl shadow-lg shadow-black/10 border border-white/30 dark:border-white/12 whitespace-nowrap"
                style={{
                    background: `linear-gradient(135deg, ${accentFrom}28, ${accentTo}14)`,
                    backdropFilter: "blur(14px)",
                    WebkitBackdropFilter: "blur(14px)",
                }}
            >
                <span className="text-sm leading-none">{icon}</span>
                <span className="text-xs font-bold text-foreground">{label}</span>
            </motion.div>
        </motion.div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// ORBITING DOTS RING (spins continuously around the image card)
// ─────────────────────────────────────────────────────────────────────────────
function OrbitRing({ accentFrom, accentTo, radius = 200 }: { accentFrom: string; accentTo: string; radius?: number }) {
    return (
        <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ margin: -32 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        >
            {[
                { deg: 0, color: accentFrom },
                { deg: 90, color: accentTo },
                { deg: 180, color: accentFrom },
                { deg: 270, color: accentTo },
            ].map(({ deg, color }, i) => (
                <motion.div
                    key={deg}
                    className="absolute w-3 h-3 rounded-full"
                    style={{
                        background: color,
                        boxShadow: `0 0 10px 2px ${color}88`,
                        top: "50%",
                        left: "50%",
                        transform: `rotate(${deg}deg) translateX(${radius}px) translateY(-50%)`,
                    }}
                    animate={{ scale: [1, 1.6, 1], opacity: [0.55, 1, 0.55] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                />
            ))}
        </motion.div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHIMMER SWEEP — one-shot glint across the image on enter
// ─────────────────────────────────────────────────────────────────────────────
function ShimmerSweep({ id }: { id: number }) {
    return (
        <motion.div
            key={id}
            className="absolute inset-0 rounded-[36px] pointer-events-none z-20 overflow-hidden"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.05, delay: 0.85 }}
        >
            <motion.div
                className="absolute inset-0"
                style={{
                    background: "linear-gradient(105deg, transparent 25%, rgba(255,255,255,0.38) 50%, transparent 75%)",
                    backgroundSize: "220% 100%",
                }}
                initial={{ backgroundPosition: "-110% 0" }}
                animate={{ backgroundPosition: "210% 0" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
            />
        </motion.div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCAN LINE — colour bar that sweeps bottom-to-top over the image
// ─────────────────────────────────────────────────────────────────────────────
function ScanLine({ accentFrom, accentTo, id }: { accentFrom: string; accentTo: string; id: number }) {
    return (
        <motion.div
            key={`scan-${id}`}
            className="absolute left-0 right-0 h-[3px] rounded-full pointer-events-none z-30"
            style={{ background: `linear-gradient(90deg, transparent, ${accentFrom}, ${accentTo}, transparent)` }}
            initial={{ top: "100%", opacity: 0 }}
            animate={{ top: "0%", opacity: [0, 0.9, 0] }}
            transition={{ duration: 1.1, ease: "easeInOut", delay: 0.3 }}
        />
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// GRID LINES OVERLAY
// ─────────────────────────────────────────────────────────────────────────────
function GridLines() {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03] dark:opacity-[0.06]">
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
                    backgroundSize: "64px 64px",
                }}
            />
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// PNG IMAGE PANEL  ← the heart of this component
// ─────────────────────────────────────────────────────────────────────────────
function SlideImagePanel({
    slide,
    tiltX,
    tiltY,
    mouseX,
    mouseY,
}: {
    slide: Slide;
    tiltX: any;
    tiltY: any;
    mouseX: any;
    mouseY: any;
}) {
    const wrapRef = useRef<HTMLDivElement>(null);   // GSAP float target
    const glowRef = useRef<HTMLDivElement>(null);   // GSAP pulse glow
    const imgRef = useRef<HTMLDivElement>(null);   // image inner wrapper

    // Deep parallax: image moves more than the BG orbs
    const pX = useSpring(useTransform(mouseX, [0, 1], [-20, 20]), { stiffness: 100, damping: 22 });
    const pY = useSpring(useTransform(mouseY, [0, 1], [-14, 14]), { stiffness: 100, damping: 22 });

    // Dynamic drop-shadow that follows the mouse cursor
    const shX = useTransform(mouseX, [0, 1], [-22, 22]);
    const shY = useTransform(mouseY, [0, 1], [-16, 16]);
    const dropShadow = useTransform(
        [shX, shY] as any,
        ([x, y]: number[]) =>
            `drop-shadow(${x}px ${y}px 36px ${slide.accentFrom}66) drop-shadow(0 28px 52px rgba(0,0,0,0.13))`
    );

    // ── GSAP: entrance + idle float ──────────────────────────────────────────
    useEffect(() => {
        if (!wrapRef.current) return;
        const ctx = gsap.context(() => {

            // 1. Hard-reset before animating (prevents flash)
            gsap.set(wrapRef.current, { y: 70, opacity: 0, scale: 0.86, rotationY: -8 });

            // 2. Entrance spring
            gsap.to(wrapRef.current, {
                y: 0,
                opacity: 1,
                scale: 1,
                rotationY: 0,
                duration: 1,
                ease: "expo.out",
                delay: 0.15,
            });

            // 3. Idle float (starts after entrance)
            gsap.to(wrapRef.current, {
                y: -16,
                duration: 3.4,
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1,
                delay: 1.1,
            });

            // 4. Very subtle idle rotation wobble
            gsap.to(wrapRef.current, {
                rotationZ: 1.2,
                duration: 5,
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1,
                delay: 1.1,
            });

        }, wrapRef);

        return () => ctx.revert();
    }, [slide.id]);   // re-run on every slide change

    // ── GSAP: glow pulse ─────────────────────────────────────────────────────
    useEffect(() => {
        if (!glowRef.current) return;
        const ctx = gsap.context(() => {
            gsap.to(glowRef.current, {
                scale: 1.22,
                opacity: 0.75,
                duration: 2.4,
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1,
            });
        }, glowRef);
        return () => ctx.revert();
    }, [slide.id]);

    return (
        <div className="relative flex items-center justify-center select-none" style={{ perspective: 1200 }}>

            {/* ── Ground shadow / glow ── */}
            <div
                ref={glowRef}
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[70%] h-12 rounded-full blur-3xl opacity-50"
                style={{ background: `radial-gradient(ellipse, ${slide.accentFrom}77 0%, transparent 75%)` }}
            />

            {/* ── Pulsing halo behind card ── */}
            <motion.div
                className="absolute inset-[-20px] rounded-[56px] pointer-events-none"
                style={{ background: `radial-gradient(circle at 50% 50%, ${slide.accentFrom}35, transparent 68%)` }}
                animate={{ scale: [1, 1.07, 1], opacity: [0.35, 0.65, 0.35] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* ── Spinning orbit ring ── */}
            <OrbitRing accentFrom={slide.accentFrom} accentTo={slide.accentTo} />

            {/* ── 3-D tilt + depth parallax wrapper ── */}
            <motion.div style={{ rotateX: tiltX, rotateY: tiltY, x: pX, y: pY }}>

                {/* ── GSAP float wrapper ── */}
                <div ref={wrapRef} className="relative">

                    {/* ── Glass card ── */}
                    <motion.div
                        className="relative w-64 h-72 md:w-[360px] md:h-[440px] rounded-[36px] overflow-hidden"
                        whileHover={{ scale: 1.028 }}
                        transition={{ type: "spring", stiffness: 220, damping: 24 }}
                    >
                        {/* Glass surface */}
                        <div className="absolute inset-0 rounded-[36px] bg-white/14 dark:bg-white/5 backdrop-blur-sm border border-white/28 dark:border-white/10 shadow-2xl z-0" />

                        {/* Corner accent dots */}
                        {["top-3 left-3", "top-3 right-3", "bottom-3 left-3", "bottom-3 right-3"].map((pos, i) => (
                            <motion.div
                                key={pos}
                                className={`absolute ${pos} w-2 h-2 rounded-full z-10`}
                                style={{ background: i % 2 === 0 ? slide.accentFrom : slide.accentTo }}
                                animate={{ opacity: [0.35, 1, 0.35], scale: [1, 1.4, 1] }}
                                transition={{ duration: 2, repeat: Infinity, delay: i * 0.45 }}
                            />
                        ))}

                        {/* ── PNG Image ── */}
                        <div
                            ref={imgRef}
                            className="relative z-10 w-full h-full"
                        >
                            <motion.div
                                className="w-full h-full relative"
                                style={{ filter: dropShadow }}
                            >
                                <Image
                                    src={slide.image}
                                    alt={slide.imageAlt}
                                    fill
                                    priority
                                    className="object-contain rounded-[32px] select-none pointer-events-none"
                                    sizes="(max-width: 768px) 256px, 360px"
                                />
                            </motion.div>

                            {/* One-shot shimmer on slide enter */}
                            <ShimmerSweep id={slide.id} />

                            {/* Scan line sweeps bottom → top once */}
                            <ScanLine accentFrom={slide.accentFrom} accentTo={slide.accentTo} id={slide.id} />
                        </div>

                        {/* Bottom accent bar (idle pulse) */}
                        <motion.div
                            className="absolute bottom-0 left-0 right-0 h-[3px] z-20"
                            style={{ background: `linear-gradient(90deg, transparent, ${slide.accentFrom}, ${slide.accentTo}, transparent)` }}
                            animate={{ opacity: [0.4, 1, 0.4], scaleX: [0.65, 1, 0.65] }}
                            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </motion.div>

                    {/* ── Floating info chips (outside card, beside it) ── */}
                    <AnimatePresence>
                        {slide.floatingChips.map((chip, i) => (
                            <div
                                key={chip.label}
                                className={`absolute z-30 ${chip.side === "left"
                                        ? "-left-4 top-10 -translate-x-full"
                                        : "-right-4 bottom-12 translate-x-full"
                                    }`}
                            >
                                <FloatingChip
                                    icon={chip.icon}
                                    label={chip.label}
                                    delay={0.55 + i * 0.18}
                                    accentFrom={slide.accentFrom}
                                    accentTo={slide.accentTo}
                                />
                            </div>
                        ))}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEXT ANIMATION VARIANTS
// ─────────────────────────────────────────────────────────────────────────────
const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
    exit: { transition: { staggerChildren: 0.04 } },
};
const wordVariants = {
    hidden: { y: 64, opacity: 0, rotateX: -40 },
    visible: { y: 0, opacity: 1, rotateX: 0, transition: { type: "spring", stiffness: 200, damping: 22 } },
    exit: { y: -36, opacity: 0, rotateX: 30, transition: { duration: 0.22, ease: easeOut } },
};
const fadeUp = {
    hidden: { y: 22, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] as any } },
    exit: { y: -14, opacity: 0, transition: { duration: 0.22 } },
};
const imageVariants = {
    hidden: { opacity: 0, x: 64, scale: 0.9 },
    visible: { opacity: 1, x: 0, scale: 1, transition: { type: "spring", stiffness: 140, damping: 20, delay: 0.08 } },
    exit: { opacity: 0, x: -44, scale: 0.92, transition: { duration: 0.26 } },
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function HeroBanner() {
    const [current, setCurrent] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const progressTween = useRef<gsap.core.Tween | null>(null);

    // Mouse tracking (normalised 0-1)
    const rawMouseX = useMotionValue(0.5);
    const rawMouseY = useMotionValue(0.5);

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
            rawMouseX.set((e.clientX - left) / width);
            rawMouseY.set((e.clientY - top) / height);
        },
        [rawMouseX, rawMouseY]
    );

    // 3-D tilt for image card
    const tiltX = useSpring(useTransform(rawMouseY, [0, 1], [10, -10]), { stiffness: 80, damping: 22 });
    const tiltY = useSpring(useTransform(rawMouseX, [0, 1], [-10, 10]), { stiffness: 80, damping: 22 });

    // GSAP progress bar → auto-advance
    const startProgress = useCallback(() => {
        progressTween.current?.kill();
        if (!progressBarRef.current) return;
        gsap.set(progressBarRef.current, { scaleX: 0, transformOrigin: "left center" });
        progressTween.current = gsap.to(progressBarRef.current, {
            scaleX: 1,
            duration: 5,
            ease: "none",
            onComplete: () => setCurrent((c) => (c + 1) % slides.length),
        });
    }, []);

    useEffect(() => {
        startProgress();
        return () => { progressTween.current?.kill(); };
    }, [current, startProgress]);

    const goTo = (index: number) => {
        progressTween.current?.kill();
        setCurrent(index);
    };

    const slide = slides[current];

    return (
        <section
            ref={containerRef}
            className={`relative overflow-hidden bg-gradient-to-br ${slide.bgLight} ${slide.bgDark} transition-colors duration-700 min-h-[600px] md:min-h-[660px]`}
            onMouseMove={handleMouseMove}
        >
            <GridLines />

            {/* Background parallax orbs */}
            <ParallaxOrbs
                orbColor={slide.orbColor}
                orb2Color={slide.orb2Color}
                mouseX={rawMouseX}
                mouseY={rawMouseY}
            />

            {/* Floating emoji particles */}
            {slide.particles.map((emoji, i) => (
                <FloatingParticle key={`${current}-${i}`} emoji={emoji} delay={i * 0.55} x={12 + i * 17} y={8 + (i % 3) * 28} />
            ))}

            {/* GSAP progress bar */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-black/5 dark:bg-white/5 z-30">
                <div
                    ref={progressBarRef}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${slide.accentFrom}, ${slide.accentTo})` }}
                />
            </div>

            {/* Slide counter */}
            <div className="absolute top-6 right-6 z-20 flex items-center gap-1">
                <span className="text-2xl font-black text-foreground/80 tabular-nums">{String(current + 1).padStart(2, "0")}</span>
                <span className="text-muted-foreground/40 text-sm mx-1">/</span>
                <span className="text-sm text-muted-foreground/40">{String(slides.length).padStart(2, "0")}</span>
            </div>

            {/* Main grid */}
            <div className="max-w-7xl mx-auto px-6 py-16 md:py-20 relative z-10">
                <div className="grid md:grid-cols-[1fr_500px] gap-12 lg:gap-16 items-center">

                    {/* ── LEFT: Text content ── */}
                    <div className="flex flex-col gap-5">

                        {/* Badge + tag */}
                        <AnimatePresence mode="wait">
                            <motion.div key={`badge-${current}`} variants={fadeUp} initial="hidden" animate="visible" exit="exit">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <motion.div
                                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/30"
                                        whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }}
                                    >
                                        <Sparkles className="w-3 h-3" />
                                        {slide.badge}
                                    </motion.div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border border-current/20 ${slide.tagColor}`}>
                                        {slide.tag}
                                    </span>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Headline — word-by-word spring */}
                        <div style={{ perspective: 900 }}>
                            <AnimatePresence mode="wait">
                                <motion.div key={`h-${current}`} variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-1">
                                    {slide.heading.map((line, li) => (
                                        <div key={li} className="flex flex-wrap gap-x-3 overflow-hidden">
                                            {line.split(" ").map((word, wi) => (
                                                <motion.span
                                                    key={wi}
                                                    variants={wordVariants}
                                                    style={{ display: "inline-block" }}
                                                    className={
                                                        li === 1
                                                            ? `text-5xl md:text-6xl xl:text-7xl font-black leading-none bg-gradient-to-r ${slide.accentClass} bg-clip-text text-transparent`
                                                            : "text-5xl md:text-6xl xl:text-7xl font-black leading-none text-foreground"
                                                    }
                                                >
                                                    {word}
                                                </motion.span>
                                            ))}
                                        </div>
                                    ))}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Subheading */}
                        <AnimatePresence mode="wait">
                            <motion.p key={`sub-${current}`} variants={fadeUp} initial="hidden" animate="visible" exit="exit"
                                className="text-muted-foreground text-base md:text-lg max-w-[440px] leading-relaxed">
                                {slide.subheading}
                            </motion.p>
                        </AnimatePresence>

                        {/* CTAs */}
                        <AnimatePresence mode="wait">
                            <motion.div key={`cta-${current}`} variants={fadeUp} initial="hidden" animate="visible" exit="exit"
                                className="flex items-center gap-3 pt-1">
                                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                                    <Button
                                        className="relative overflow-hidden text-white px-7 py-6 text-sm font-bold rounded-2xl shadow-xl"
                                        style={{
                                            background: `linear-gradient(135deg, ${slide.accentFrom}, ${slide.accentTo})`,
                                            boxShadow: `0 8px 32px ${slide.accentFrom}55`,
                                        }}
                                    >
                                        <motion.span
                                            className="absolute inset-0 rounded-2xl"
                                            style={{ background: `linear-gradient(135deg, ${slide.accentTo}, ${slide.accentFrom})` }}
                                            initial={{ opacity: 0 }}
                                            whileHover={{ opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                        />
                                        <span className="relative flex items-center gap-2">
                                            {slide.cta}
                                            <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
                                                <ArrowRight className="w-4 h-4" />
                                            </motion.span>
                                        </span>
                                    </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                                    <Button variant="outline" className="px-7 py-6 text-sm font-bold rounded-2xl border-2 bg-background/60 backdrop-blur-sm">
                                        {slide.ctaSecondary}
                                    </Button>
                                </motion.div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Trust stats */}
                        <AnimatePresence mode="wait">
                            <motion.div key={`stats-${current}`} variants={fadeUp} initial="hidden" animate="visible" exit="exit"
                                className="flex items-center gap-6 pt-3">
                                {[
                                    { val: "50K+", label: "Products" },
                                    { val: "4.8★", label: "Rating" },
                                    { val: "2M+", label: "Customers" },
                                ].map((stat, i) => (
                                    <motion.div key={stat.label} className="text-center"
                                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 + i * 0.1 }} whileHover={{ y: -2 }}>
                                        <div className="text-xl font-black bg-clip-text text-transparent"
                                            style={{ backgroundImage: `linear-gradient(135deg, ${slide.accentFrom}, ${slide.accentTo})` }}>
                                            {stat.val}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                                    </motion.div>
                                ))}
                                <div className="w-px h-8 bg-border mx-1" />
                                <motion.div className="text-xs text-muted-foreground max-w-[130px] leading-tight"
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
                                    Trusted by millions worldwide 🌍
                                </motion.div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* ── RIGHT: PNG Image Panel ── */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`img-${current}`}
                            variants={imageVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="relative flex items-center justify-center"
                        >
                            <SlideImagePanel
                                slide={slide}
                                tiltX={tiltX}
                                tiltY={tiltY}
                                mouseX={rawMouseX}
                                mouseY={rawMouseY}
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* ── Slide controls ── */}
                <div className="flex items-center justify-center gap-4 mt-12">
                    <motion.button
                        whileHover={{ scale: 1.12, x: -2 }} whileTap={{ scale: 0.92 }}
                        onClick={() => goTo((current - 1 + slides.length) % slides.length)}
                        className="w-10 h-10 rounded-full bg-background/70 backdrop-blur border border-border shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-current transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </motion.button>

                    {/* Pill-shaped dot indicators */}
                    <div className="flex items-center gap-2">
                        {slides.map((_, i) => (
                            <motion.button
                                key={i}
                                onClick={() => goTo(i)}
                                className="rounded-full cursor-pointer"
                                animate={{ width: i === current ? 36 : 10, height: 10 }}
                                transition={{ type: "spring", stiffness: 300, damping: 26 }}
                                style={{
                                    background: i === current
                                        ? `linear-gradient(90deg, ${slide.accentFrom}, ${slide.accentTo})`
                                        : "hsl(var(--muted-foreground) / 0.25)",
                                }}
                            />
                        ))}
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.12, x: 2 }} whileTap={{ scale: 0.92 }}
                        onClick={() => goTo((current + 1) % slides.length)}
                        className="w-10 h-10 rounded-full bg-background/70 backdrop-blur border border-border shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-current transition-colors"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </motion.button>
                </div>
            </div>
        </section>
    );
}