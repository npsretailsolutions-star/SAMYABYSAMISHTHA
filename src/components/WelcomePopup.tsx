"use client";

import { useEffect, useRef, useState } from "react";
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
  const [revealed, setRevealed] = useState(false);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scratchingRef = useRef(false);

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

  useEffect(() => {
    if (!visible || revealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#0b3d3a");
    gradient.addColorStop(1, "#146b64");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // iOS renders the scissors emoji much wider than other platforms, so measure
    // and shrink the font until each line actually fits the card — otherwise
    // the text silently overflows the rounded box on iPhone.
    const fitFontSize = (text: string, maxWidth: number, weight: number, startSize: number) => {
      let size = startSize;
      while (size > 8) {
        ctx.font = `${weight} ${size}px sans-serif`;
        if (ctx.measureText(text).width <= maxWidth) break;
        size -= 1;
      }
      return size;
    };

    const maxTextWidth = width - 24;
    ctx.fillStyle = "#f4e4c1";
    ctx.textAlign = "center";

    const line1 = "✂️ CUT HERE TO REVEAL";
    const size1 = fitFontSize(line1, maxTextWidth, 600, 13);
    ctx.font = `600 ${size1}px sans-serif`;
    ctx.fillText(line1, width / 2, height / 2 - 4);

    const line2 = "drag your finger across the card";
    const size2 = fitFontSize(line2, maxTextWidth, 400, 10);
    ctx.font = `400 ${size2}px sans-serif`;
    ctx.fillText(line2, width / 2, height / 2 + 14);

    ctx.globalCompositeOperation = "destination-out";

    const scratch = (x: number, y: number) => {
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fill();
    };

    const getPos = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const checkRevealPercent = () => {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let cleared = 0;
      let total = 0;
      const step = 160;
      for (let i = 3; i < imgData.length; i += 4 * step) {
        total++;
        if (imgData[i] < 50) cleared++;
      }
      return total > 0 ? cleared / total : 0;
    };

    const onDown = (e: PointerEvent) => {
      scratchingRef.current = true;
      const { x, y } = getPos(e);
      scratch(x, y);
    };
    const onMove = (e: PointerEvent) => {
      if (!scratchingRef.current) return;
      const { x, y } = getPos(e);
      scratch(x, y);
      if (checkRevealPercent() > 0.45) {
        setRevealed(true);
      }
    };
    const onUp = () => {
      scratchingRef.current = false;
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    return () => {
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [visible, revealed]);

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
          {revealed ? "🎉 Your Welcome Offer" : "A Little Something For You"}
        </h2>

        <div className="relative mx-auto mb-5 h-32 w-full overflow-hidden rounded-2xl border-2 border-dashed border-brand-gold/50">
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white">
            <span className="text-3xl font-serif font-bold text-brand-gold-dark">10% OFF</span>
            <span className="text-xs text-brand-teal/60 mt-1">
              on your first order, all products
            </span>
          </div>
          {!revealed && (
            <canvas
              ref={canvasRef}
              className="absolute inset-0 h-full w-full cursor-pointer touch-none"
            />
          )}
        </div>

        <p className="text-xs text-brand-teal/60 mb-4">
          {revealed
            ? "Already applied automatically at checkout — no code needed!"
            : "Scratch & cut the card above to reveal your welcome discount."}
        </p>

        <button onClick={close} className="btn-gold w-full">
          {revealed ? "Start Shopping" : "Maybe Later"}
        </button>
      </div>
    </div>
  );
}
