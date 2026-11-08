'use client';
import Image from 'next/image';
import { useAnimationFrame, useReducedMotion } from 'motion/react';
import { useRef } from 'react';
import { InfiniteSlider } from './infinite-slider';

// Nama file di public/logo berupa angka; nama ini hanya untuk label saat di-hover.
const LOGO_NAMES: Record<string, string> = {
  '1': 'Next.js', '2': 'Vue', '3': 'Docker', '5': 'Power BI', '6': 'PostgreSQL', '7': 'Django',
  '8': 'Flutter', '9': 'Go', '10': 'GitLab CI/CD', '11': 'Spring', '12': 'Supabase', '13': 'ngrok',
  '14': 'Google Cloud', '15': 'Gemini', '17': 'Figma', '19': 'LINE', '20': 'SharePoint', '21': 'Google Drive',
};

const RADIUS = 190; // jangkauan efek dock, px
const MAX_SCALE = 0.55; // tambahan skala untuk logo tepat di bawah kursor

type Live = { el: HTMLElement; t: number };

export function LogoMarquee({ files }: { files: string[] }) {
  const reduced = useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);
  const pointer = useRef<number | null>(null);
  const live = useRef(new WeakMap<HTMLElement, Live>());
  const settled = useRef(false);

  // Efek dock: logo dekat kursor membesar dan berwarna. Ditulis langsung ke DOM agar tidak me-render ulang tiap frame.
  useAnimationFrame((_, delta) => {
    const root = wrap.current;
    if (!root || reduced) return;
    const px = pointer.current;
    if (px === null && settled.current) return;

    const k = 1 - Math.exp((-Math.min(delta, 64) / 1000) * 14);
    let moving = false;
    let nearest: { d: number; el: HTMLElement } | null = null;
    const box = root.getBoundingClientRect();

    root.querySelectorAll<HTMLElement>('[data-logo]').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.right < box.left - 40 || r.left > box.right + 40) return;
      const cx = r.left + r.width / 2;
      const d = px === null ? Infinity : Math.abs(px - cx);
      const target = d >= RADIUS ? 0 : Math.cos((d / RADIUS) * (Math.PI / 2)) ** 2;
      const state = live.current.get(el) ?? { el, t: 0 };
      const next = state.t + (target - state.t) * k;
      if (Math.abs(next - target) > 0.002) moving = true;
      if (next !== state.t) {
        el.style.transform = `translateY(${(-10 * next).toFixed(2)}px) scale(${(1 + MAX_SCALE * next).toFixed(3)})`;
        el.style.filter = `grayscale(${(1 - next).toFixed(2)})`;
        el.style.opacity = (0.55 + 0.45 * next).toFixed(2);
      }
      state.t = next;
      live.current.set(el, state);
      if (!nearest || d < nearest.d) nearest = { d, el };
    });

    // Label mengikuti logo terdekat.
    const tag = label.current;
    if (tag) {
      const hit = nearest as { d: number; el: HTMLElement } | null;
      const name = hit && hit.d < 60 ? hit.el.dataset.logo : '';
      if (name && hit) {
        const r = hit.el.getBoundingClientRect();
        if (tag.textContent !== name) tag.textContent = name;
        tag.style.transform = `translate(${(r.left + r.width / 2 - box.left).toFixed(1)}px, 0) translateX(-50%)`;
        tag.style.opacity = '1';
      } else {
        tag.style.opacity = '0';
      }
    }
    settled.current = px === null && !moving;
  });

  return (
    <div
      ref={wrap}
      className="relative"
      onPointerMove={(e) => { if (e.pointerType === 'mouse') { pointer.current = e.clientX; settled.current = false; } }}
      onPointerLeave={() => { pointer.current = null; }}
    >
      <div
        ref={label}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 z-10 whitespace-nowrap rounded-full bg-foreground px-2.5 py-0.5 text-xs font-medium text-background opacity-0 transition-opacity duration-150"
      />
      <div className="[mask-image:linear-gradient(to_right,transparent,black_7%,black_93%,transparent)]">
        <InfiniteSlider speed={36} speedOnHover={8} gap={72} draggable className="py-7">
          {files.map((file) => {
            const id = file.split('.')[0];
            const name = LOGO_NAMES[id] ?? '';
            return (
              <div
                key={file}
                data-logo={name}
                className="flex h-11 w-11 shrink-0 items-center justify-center will-change-transform [@media(hover:hover)]:opacity-55 [@media(hover:hover)]:grayscale"
              >
                <Image
                  src={`/logo/${file}`}
                  alt={name}
                  width={44}
                  height={44}
                  unoptimized
                  loading="eager"
                  draggable={false}
                  className="pointer-events-none h-11 w-11 rounded-full object-contain"
                />
              </div>
            );
          })}
        </InfiniteSlider>
      </div>
    </div>
  );
}
