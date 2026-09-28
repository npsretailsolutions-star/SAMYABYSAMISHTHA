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
      <div className="text-center mb-10">
        <span className="eyebrow">Samya By Samishtha</span>
        <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-semibold text-brand-teal">
          {title}
        </h1>
        {intro && (
          <p className="mt-4 text-sm text-brand-teal/70 leading-relaxed">{intro}</p>
        )}
      </div>
      <div className="space-y-8 text-brand-teal/80 leading-relaxed">{children}</div>
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
    <section>
      <h2 className="font-serif text-lg sm:text-xl font-semibold text-brand-teal mb-3">
        {number ? `${number}. ` : ""}
        {title}
      </h2>
      <div className="space-y-3 text-sm sm:text-base">{children}</div>
    </section>
  );
}

export function PolicyList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-5 space-y-1.5 marker:text-brand-gold">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
