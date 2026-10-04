"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const SESSION_KEY = "sbs_welcome_popup_shown";

type ConfettiPiece = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  width: number;
  height: number;
};

const COLORS = ["#0b3d3a", "#c9a227", "#e8c468", "#f4e4c1", "#146b64"];

function makeConfetti(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.4,
    duration: 3 + Math.random() * 2.5,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    width: 5 + Math.random() * 5,
    height: 9 + Math.random() * 7,
  }));
}

export default function WelcomePopup() {
  const [visible, setVisible] = useState(false);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch {
      // ignore
    }
    setConfetti(makeConfetti(55));
    const t = setTimeout(() => setVisible(true), 500);
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    setVisible(false);
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // ignore
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        {confetti.map((c) => (
          <span
            key={c.id}
            className="absolute top-[-20px] rounded-sm confetti-fall"
            style={{
              left: `${c.left}%`,
              width: c.width,
              height: c.height,
              backgroundColor: c.color,
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-sm rounded-3xl bg-brand-cream p-6 text-center shadow-xl">
        <button
          onClick={close}
          aria-label="Close"
          className="absolute right-4 top-4 text-brand-teal/50 hover:text-brand-teal"
        >
          <X size={20} />
        </button>

        <p className="eyebrow mb-1">Welcome to Samya By Samishtha</p>
        <h2 className="font-serif text-xl font-semibold text-brand-teal mb-4">
          🎉 Your Welcome Offer
        </h2>

        <div className="relative mx-auto mb-5 h-32 w-full overflow-hidden rounded-2xl border-2 border-dashed border-brand-gold/50 bg-white">
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-serif font-bold text-brand-gold-dark">10% OFF</span>
            <span className="text-xs text-brand-teal/60 mt-1">
              on your first order, all products
            </span>
          </div>
        </div>

        <p className="text-xs text-brand-teal/60 mb-4">
          Already applied automatically at checkout — no code needed!
        </p>

        <button onClick={close} className="btn-gold w-full">
          Start Shopping
        </button>
      </div>
    </div>
  );
}
