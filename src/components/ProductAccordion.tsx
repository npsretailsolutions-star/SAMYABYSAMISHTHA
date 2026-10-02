"use client";

import { useState, type ReactNode } from "react";
import { Plus, Minus } from "lucide-react";

type Section = { title: string; content: ReactNode };

export default function ProductAccordion({ sections }: { sections: Section[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mt-6 border-t border-brand-teal/10">
      {sections.map((s, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={s.title} className="border-b border-brand-teal/10">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex w-full items-center justify-between py-4 text-left"
            >
              <span className="font-serif text-sm sm:text-base font-semibold text-brand-teal">
                {s.title}
              </span>
              {isOpen ? (
                <Minus size={18} className="shrink-0 text-brand-teal/60" />
              ) : (
                <Plus size={18} className="shrink-0 text-brand-teal/60" />
              )}
            </button>
            {isOpen && (
              <div className="pb-4 text-sm leading-relaxed text-brand-teal/70">{s.content}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
