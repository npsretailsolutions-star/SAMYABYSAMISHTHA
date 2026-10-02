import { Droplet, SprayCan, Sparkles } from "lucide-react";

export default function CareInstructionsBox() {
  return (
    <div className="mt-4 rounded-xl bg-brand-gold/10 p-4">
      <p className="mb-3 font-serif text-sm font-semibold text-brand-gold-dark">
        Care Instructions
      </p>
      <ul className="space-y-2 text-sm text-brand-teal/80">
        <li className="flex items-center gap-2">
          <Droplet size={15} className="shrink-0 text-brand-gold-dark" /> Keep Away From Water
        </li>
        <li className="flex items-center gap-2">
          <SprayCan size={15} className="shrink-0 text-brand-gold-dark" /> Avoid Perfumes And Spray
        </li>
        <li className="flex items-center gap-2">
          <Sparkles size={15} className="shrink-0 text-brand-gold-dark" /> Clean With A Dry And Soft Cloth
        </li>
      </ul>
    </div>
  );
}
