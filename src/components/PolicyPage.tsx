export function PolicyPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container-px mx-auto section-y max-w-3xl">
      <div className="text-left mb-12 pb-8 border-b border-brand-gold/30">
        <span className="eyebrow">Samya By Samishtha</span>
        <h1 className="mt-3 font-serif text-3xl sm:text-5xl font-semibold text-brand-teal tracking-tight">
          {title}
        </h1>
        {intro && (
          <p className="mt-5 max-w-2xl font-serif italic text-base sm:text-lg text-brand-teal/70 leading-relaxed">
            {intro}
          </p>
        )}
      </div>
      <div className="space-y-10 text-left text-brand-teal/80 leading-relaxed">{children}</div>
    </div>
  );
}

export function PolicySection({
  number,
  title,
  children,
}: {
  number?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="text-left">
      <div className="flex items-baseline gap-3 mb-4">
        {number && (
          <span className="font-serif text-2xl text-brand-gold-dark/70">{number}</span>
        )}
        <h2 className="font-serif text-xl sm:text-2xl font-semibold text-brand-teal">
          {title}
        </h2>
      </div>
      <div className="space-y-3 text-[15px] sm:text-base pl-0">{children}</div>
    </section>
  );
}

export function PolicyList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-5 space-y-1.5 marker:text-brand-gold text-left">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
