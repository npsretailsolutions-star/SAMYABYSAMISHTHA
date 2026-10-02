"use client";

import { useEffect, useState } from "react";
import { Gift, Package, ScrollText } from "lucide-react";
import {
  GIFT_BOX_PRICE,
  GIFT_CARD_PRICE,
  GIFT_POUCH_PRICE,
  GIFT_CARD_MESSAGES,
} from "@/lib/constants";
import { formatINR } from "@/lib/format";
import type { GiftWrapSelection } from "@/lib/types";

export default function GiftOptions({
  onChange,
}: {
  onChange: (selection: GiftWrapSelection | null, charge: number) => void;
}) {
  const [enabled, setEnabled] = useState(false);
  const [box, setBox] = useState(false);
  const [card, setCard] = useState(false);
  const [cardMessage, setCardMessage] = useState(GIFT_CARD_MESSAGES[0]);
  const [pouch, setPouch] = useState(false);

  const charge =
    (box ? GIFT_BOX_PRICE : 0) + (card ? GIFT_CARD_PRICE : 0) + (pouch ? GIFT_POUCH_PRICE : 0);

  useEffect(() => {
    if (!enabled || (!box && !card && !pouch)) {
      onChange(null, 0);
      return;
    }
    onChange({ box, card, cardMessage: card ? cardMessage : undefined, pouch }, charge);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, box, card, cardMessage, pouch]);

  return (
    <div className="rounded-xl border border-brand-teal/15 overflow-hidden">
      <label className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer bg-brand-gold/5">
        <span className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="accent-brand-gold"
          />
          <span className="text-sm font-semibold text-brand-teal">Sending this as a gift?</span>
        </span>
        {enabled && charge > 0 && (
          <span className="text-xs font-semibold text-brand-gold-dark whitespace-nowrap">
            +{formatINR(charge)}
          </span>
        )}
      </label>

      {enabled && (
        <div className="p-4 space-y-3 border-t border-brand-teal/10">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-teal/50">
            Make Your Gift Extra Special
          </p>
          <div className="grid grid-cols-3 gap-2">
            <GiftTile
              label="Gift Box"
              price={GIFT_BOX_PRICE}
              selected={box}
              onToggle={() => setBox((v) => !v)}
              icon={<Gift size={18} />}
            />
            <GiftTile
              label="Card"
              price={GIFT_CARD_PRICE}
              selected={card}
              onToggle={() => setCard((v) => !v)}
              icon={<ScrollText size={18} />}
            />
            <GiftTile
              label="Pouch"
              price={GIFT_POUCH_PRICE}
              selected={pouch}
              onToggle={() => setPouch((v) => !v)}
              icon={<Package size={18} />}
            />
          </div>

          {card && (
            <div>
              <label className="block text-xs font-medium text-brand-teal mb-1">
                Select Card Message
              </label>
              <select
                value={cardMessage}
                onChange={(e) => setCardMessage(e.target.value)}
                className="w-full rounded-lg border border-brand-teal/20 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
              >
                {GIFT_CARD_MESSAGES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GiftTile({
  label,
  price,
  selected,
  onToggle,
  icon,
}: {
  label: string;
  price: number;
  selected: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-colors ${
        selected ? "border-brand-gold bg-brand-gold/10" : "border-brand-teal/15"
      }`}
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-full ${
          selected ? "bg-brand-teal text-brand-cream" : "bg-brand-teal/5 text-brand-teal/50"
        }`}
      >
        {icon}
      </span>
      <span className="text-xs font-medium text-brand-teal">{label}</span>
      <span className="text-[11px] text-brand-teal/50">+{formatINR(price)}</span>
    </button>
  );
}
