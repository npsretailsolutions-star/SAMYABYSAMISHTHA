export default function FounderFlipCard() {
  return (
    <div className="mx-auto mb-10 flex flex-col items-center">
      <div className="group relative h-56 w-56 sm:h-64 sm:w-64 [perspective:1200px]">
        <div className="relative h-full w-full rounded-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
          {/* Front: founder photo placeholder */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 overflow-hidden rounded-full border-4 border-brand-gold/40 bg-brand-cream/10 px-6 text-center [backface-visibility:hidden]">
            <span className="text-xs text-brand-cream/50">Founder Photo</span>
            <span className="text-[10px] text-brand-cream/35">(coming soon)</span>
          </div>

          {/* Back: role description */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 overflow-hidden rounded-full border-4 border-brand-gold/40 bg-brand-teal-dark px-7 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-gold-light">
              What I Do
            </span>
            <p className="text-xs leading-relaxed text-brand-cream/90">
              Sourcing &amp; designing every piece of jewellery, and running
              logistics &amp; day-to-day operations behind Samya.
            </p>
          </div>
        </div>
      </div>
      <p className="mt-4 font-serif text-sm font-semibold text-brand-cream">Samarth</p>
      <p className="text-[11px] text-brand-cream/50">Founder, Samya By Samishtha</p>
    </div>
  );
}
