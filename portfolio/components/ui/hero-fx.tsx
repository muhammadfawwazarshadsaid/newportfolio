'use client';
import {
  animate,
  motion,
  useAnimationFrame,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/** Cahaya halus dan titik-titik yang hanya terlihat di sekitar kursor. */
export function CursorSpotlight() {
  const reduced = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 120, damping: 24, mass: 0.6 });
  const y = useSpring(my, { stiffness: 120, damping: 24, mass: 0.6 });
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      if (!seen) { x.jump(e.clientX); y.jump(e.clientY); setSeen(true); }
      mx.set(e.clientX);
      my.set(e.clientY);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [mx, my, x, y, seen, reduced]);

  const glow = useMotionTemplate`radial-gradient(620px circle at ${x}px ${y}px, rgba(255,255,255,0.075), transparent 70%)`;
  const dots = useMotionTemplate`radial-gradient(300px circle at ${x}px ${y}px, black, transparent 75%)`;

  if (reduced) return null;
  return (
    <div aria-hidden className={cn('pointer-events-none fixed inset-0 z-0 transition-opacity duration-700', seen ? 'opacity-100' : 'opacity-0')}>
      <motion.div className="absolute inset-0" style={{ background: glow }} />
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.28) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
          maskImage: dots,
          WebkitMaskImage: dots,
        }}
      />
    </div>
  );
}

/** Elemen tertarik pelan ke arah kursor saat kursor mendekat. */
export function Magnetic({ children, strength = 0.28, className }: { children: React.ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const x = useSpring(0, { stiffness: 220, damping: 16, mass: 0.4 });
  const y = useSpring(0, { stiffness: 220, damping: 16, mass: 0.4 });

  // Listener native: event dari isi dialog (portal) tidak ikut menggerakkan tombolnya.
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const r = el.getBoundingClientRect();
      x.set((e.clientX - (r.left + r.width / 2)) * strength);
      y.set((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const onLeave = () => { x.set(0); y.set(0); };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [x, y, strength, reduced]);

  return <motion.div ref={ref} style={{ x, y }} className={cn('inline-block', className)}>{children}</motion.div>;
}

/** Judul masuk huruf per huruf, lalu tiap huruf terangkat saat kursor lewat. */
export function KineticHeading({ text, delay = 0, className, charClassName }: { text: string; delay?: number; className?: string; charClassName?: string }) {
  const reduced = useReducedMotion();
  const root = useRef<HTMLHeadingElement>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const levels = useRef(new Map<HTMLElement, number>());
  const settled = useRef(true);

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const r = root.current?.getBoundingClientRect();
      if (!r) return;
      const near = e.clientY > r.top - 90 && e.clientY < r.bottom + 90 && e.clientX > r.left - 120 && e.clientX < r.right + 120;
      pointer.current = near ? { x: e.clientX, y: e.clientY } : null;
      if (near) settled.current = false;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduced]);

  useAnimationFrame((_, delta) => {
    const el = root.current;
    if (!el || settled.current) return;
    const k = 1 - Math.exp((-Math.min(delta, 64) / 1000) * 12);
    const p = pointer.current;
    let moving = false;
    el.querySelectorAll<HTMLElement>('[data-char]').forEach((c) => {
      const r = c.getBoundingClientRect();
      const d = p ? Math.hypot(p.x - (r.left + r.width / 2), (p.y - (r.top + r.height / 2)) * 0.7) : Infinity;
      const target = d >= 150 ? 0 : Math.cos((d / 150) * (Math.PI / 2)) ** 2;
      const cur = levels.current.get(c) ?? 0;
      const next = cur + (target - cur) * k;
      if (Math.abs(next - target) > 0.002) moving = true;
      levels.current.set(c, next);
      c.style.transform = `translateY(${(-14 * next).toFixed(2)}px) scale(${(1 + 0.07 * next).toFixed(3)})`;
    });
    if (!p && !moving) settled.current = true;
  });

  let index = 0;
  return (
    <h1 ref={root} aria-label={text} className={cn('[perspective:900px]', className)}>
      {text.split(' ').map((word, w, all) => (
        <span key={w} aria-hidden className="inline-block whitespace-nowrap">
          {word.split('').map((ch, i) => {
            const n = index++;
            return (
              <motion.span
                key={i}
                className="inline-block will-change-transform"
                initial={reduced ? false : { opacity: 0, y: '55%', rotateX: -70, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)' }}
                transition={{ type: 'spring', stiffness: 170, damping: 18, delay: delay + n * 0.032 }}
              >
                <span data-char className={cn('inline-block', charClassName)}>{ch}</span>
              </motion.span>
            );
          })}
          {w < all.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </h1>
  );
}

/** Angka berjalan naik saat pertama kali terlihat. */
export function CountUp({ to, delay = 0 }: { to: number; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduced = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;
    if (reduced) { el.textContent = String(to); return; }
    const controls = animate(0, to, {
      duration: 1.1,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => { el.textContent = String(Math.round(v)); },
    });
    return () => controls.stop();
  }, [inView, to, delay, reduced]);
  return <span ref={ref} className="tabular-nums">0</span>;
}
