// components/ui/display-cards.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DisplayCardProps } from '@/lib/portfolio-types';

function DisplayCard({
  className,
  icon,
  title = 'Kategori',
  description = 'Lihat Proyek',
  date,
  iconClassName = 'text-sky-500 bg-sky-700',
  titleClassName = 'text-sky-500',
  onClick,
}: DisplayCardProps) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `Lihat proyek ${title}` : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
      className={cn(
        "group/card relative flex h-44 w-[26rem] -skew-y-[8deg] select-none flex-col justify-between rounded-xl border-2 border-transparent bg-muted/70 backdrop-blur-sm px-6 py-4 outline-none transition-all duration-500 ease-out after:absolute after:-right-1 after:top-[-5%] after:h-[110%] after:w-[20rem] after:bg-gradient-to-l after:from-background after:to-transparent after:content-[''] hover:border-white/20 hover:bg-muted focus-visible:border-white/40 [&>*]:flex [&>*]:items-center [&>*]:gap-2 dark:border dark:border-white/5",
        onClick && 'cursor-pointer',
        className
      )}
    >
      <div>
        <span className={cn('relative inline-block rounded-full p-1.5', iconClassName)}>
          {icon || <Sparkles className="size-4" />}
        </span>
        <p className={cn('text-lg font-medium', titleClassName)}>{title}</p>
      </div>
      <p className="whitespace-nowrap text-lg">
        {description}
        {onClick && (
          <ArrowUpRight className="relative z-10 size-5 -translate-x-2 opacity-0 transition-all duration-300 group-hover/card:translate-x-0 group-hover/card:opacity-100 group-focus-visible/card:translate-x-0 group-focus-visible/card:opacity-100" />
        )}
      </p>
      {date && <p className="text-muted-foreground">{date}</p>}
    </div>
  );
}

// Tiap lapisan bergeser berbeda mengikuti kursor, kartu terdepan paling jauh.
function Layer({ index, total, spread, mx, my, children }: { index: number; total: number; spread: boolean; mx: MotionValue<number>; my: MotionValue<number>; children: React.ReactNode }) {
  const depth = 10 + index * 12;
  const px = useTransform(mx, (v) => v * depth);
  const py = useTransform(my, (v) => v * depth);
  const fan = index - (total - 1) / 2;
  return (
    <motion.div className="[grid-area:stack]" style={{ x: px, y: py }}>
      <motion.div
        initial={{ opacity: 0, y: 90, x: 40, rotateZ: 3 }}
        animate={{ opacity: 1, y: spread ? fan * 26 : 0, x: spread ? fan * 22 : 0, rotateZ: 0 }}
        transition={{ type: 'spring', stiffness: 130, damping: 17, delay: spread ? 0 : 0.45 + index * 0.14 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

interface DisplayCardsProps {
  cards?: DisplayCardProps[];
}

export default function DisplayCards({ cards }: DisplayCardsProps) {
  const reduced = useReducedMotion();
  const [spread, setSpread] = useState(false);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, { stiffness: 70, damping: 18 });
  const my = useSpring(rawY, { stiffness: 70, damping: 18 });
  const rotateY = useTransform(mx, (v) => v * 7);
  const rotateX = useTransform(my, (v) => v * -5);

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      rawX.set((e.clientX / window.innerWidth - 0.5) * 2);
      rawY.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [rawX, rawY, reduced]);

  if (!cards || cards.length === 0) {
    return <div className="h-44 w-[26rem] flex items-center justify-center text-muted-foreground">Memuat kategori...</div>;
  }

  return (
    <motion.div
      className="grid [grid-template-areas:'stack'] place-items-center -ml-12"
      style={{ rotateX, rotateY, transformPerspective: 1100 }}
      onHoverStart={() => setSpread(true)}
      onHoverEnd={() => setSpread(false)}
    >
      {cards.map((cardProps, index) => (
        <Layer key={index} index={index} total={cards.length} spread={spread} mx={mx} my={my}>
          <DisplayCard {...cardProps} />
        </Layer>
      ))}
    </motion.div>
  );
}
