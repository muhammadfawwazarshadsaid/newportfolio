'use client';
import { cn } from '@/lib/utils';
import { motion, useAnimationFrame, useMotionValue, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

export type InfiniteSliderProps = {
  children: React.ReactNode;
  gap?: number;
  /** px per detik */
  speed?: number;
  speedOnHover?: number;
  reverse?: boolean;
  draggable?: boolean;
  className?: string;
};

/**
 * Marquee tanpa putus. Posisi dihitung per frame dan dibungkus (modulo) dengan lebar satu set,
 * jadi perubahan ukuran atau kecepatan tidak pernah mengulang animasi dari awal.
 */
export function InfiniteSlider({
  children,
  gap = 16,
  speed = 100,
  speedOnHover,
  reverse = false,
  draggable = false,
  className,
}: InfiniteSliderProps) {
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const viewport = useRef<HTMLDivElement>(null);
  const firstSet = useRef<HTMLDivElement>(null);
  const size = useRef(0);
  const [copies, setCopies] = useState(2);

  const offset = useRef(0);
  const currentSpeed = useRef(speed);
  const hovering = useRef(false);
  const dragging = useRef(false);
  const flick = useRef(0);
  const lastPointer = useRef({ x: 0, t: 0 });

  // Ukur satu set (termasuk gap penutupnya), lalu pastikan salinannya cukup menutup layar.
  useEffect(() => {
    const set = firstSet.current;
    const view = viewport.current;
    if (!set || !view) return;
    const measure = () => {
      size.current = set.offsetWidth;
      if (size.current > 0) setCopies(Math.max(2, Math.ceil(view.offsetWidth / size.current) + 1));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(set);
    ro.observe(view);
    return () => ro.disconnect();
  }, []);

  useAnimationFrame((_, delta) => {
    const s = size.current;
    if (!s) return;
    const dt = Math.min(delta, 64) / 1000; // tab yang baru aktif lagi tidak melompat
    const target = reduced ? 0 : hovering.current && speedOnHover !== undefined ? speedOnHover : speed;
    currentSpeed.current += (target - currentSpeed.current) * (1 - Math.exp(-dt * 5));
    flick.current *= Math.exp(-dt * 3.5);
    if (!dragging.current) offset.current += ((reverse ? 1 : -1) * currentSpeed.current + flick.current) * dt;
    x.set(((offset.current % s) + s) % s - s);
  });

  const dragProps = draggable
    ? {
        onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
          dragging.current = true;
          flick.current = 0;
          lastPointer.current = { x: e.clientX, t: e.timeStamp };
          e.currentTarget.setPointerCapture(e.pointerId);
        },
        onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => {
          if (!dragging.current) return;
          const dx = e.clientX - lastPointer.current.x;
          const dt = Math.max(e.timeStamp - lastPointer.current.t, 1) / 1000;
          offset.current += dx;
          flick.current = Math.max(-2500, Math.min(2500, dx / dt));
          lastPointer.current = { x: e.clientX, t: e.timeStamp };
        },
        onPointerUp: () => { dragging.current = false; },
        onPointerCancel: () => { dragging.current = false; },
      }
    : {};

  return (
    <div
      ref={viewport}
      className={cn('overflow-hidden', draggable && 'cursor-grab touch-pan-y select-none active:cursor-grabbing', className)}
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') hovering.current = true; }}
      onPointerLeave={() => { hovering.current = false; }}
      {...dragProps}
    >
      <motion.div className="flex w-max will-change-transform" style={{ x }}>
        {Array.from({ length: copies }).map((_, i) => (
          <div
            key={i}
            ref={i === 0 ? firstSet : undefined}
            aria-hidden={i > 0 || undefined}
            className="flex shrink-0"
            style={{ gap: `${gap}px`, paddingRight: `${gap}px` }}
          >
            {children}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
