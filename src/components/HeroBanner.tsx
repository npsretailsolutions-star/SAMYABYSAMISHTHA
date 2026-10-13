"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export type HeroSlide = {
  id: string;
  imageUrl: string;
  width: number;
  height: number;
  alt: string;
  linkUrl: string | null;
};

export default function HeroBanner({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  const slide = slides[index % slides.length];
  const img = (
    <Image
      key={slide.id}
      src={slide.imageUrl}
      alt={slide.alt || "Samya By Samishtha"}
      width={slide.width}
      height={slide.height}
      priority
      sizes="100vw"
      className="h-auto w-full"
    />
  );

  return (
    <section className="relative overflow-hidden bg-brand-cream">
      {slide.linkUrl ? <Link href={slide.linkUrl}>{img}</Link> : img}
      {slides.length > 1 && (
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Show banner ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 w-1.5 rounded-full ${i === index ? "bg-brand-teal" : "bg-brand-teal/30"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
