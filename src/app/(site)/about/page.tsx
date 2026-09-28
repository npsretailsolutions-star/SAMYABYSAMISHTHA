export const metadata = { title: "About Us | Samya By Samishtha" };

export default function AboutPage() {
  return (
    <div className="bg-teal-gradient">
      <div className="container-px mx-auto section-y max-w-2xl">
        <div className="text-center mb-10">
          <span className="eyebrow">Our Story</span>
          <h1 className="mt-2 font-serif text-4xl sm:text-5xl font-semibold text-brand-cream">
            Samya By Samishtha
          </h1>
          <div className="mt-4 flex items-center justify-center gap-3 text-brand-gold-light">
            <span className="h-px w-10 bg-brand-gold-light/50" />
            <span className="text-xs tracking-[0.3em] uppercase">Elegance in Every Detail</span>
            <span className="h-px w-10 bg-brand-gold-light/50" />
          </div>
        </div>

        <div className="space-y-6 text-brand-cream/90 leading-relaxed text-center sm:text-left">
          <p>
            Samya By Samishtha wasn&apos;t created in a boardroom. It began with
            a simple feeling between a husband and wife during one of the most
            special moments of their lives — their wedding.
          </p>

          <p>
            While preparing for our wedding, Nishtha spent countless hours
            searching for jewellery that felt truly special. She wanted
            something elegant, premium-looking, graceful, and beautiful — yet
            still affordable enough to wear without hesitation. But everywhere
            we looked, something always felt missing.
          </p>

          <p>
            Some pieces looked beautiful but lacked quality. Some felt premium
            but were heavily overpriced. And some simply didn&apos;t carry the
            emotion she was searching for.
          </p>

          <p>
            As I watched her struggle to find jewellery she genuinely loved,
            one thought stayed with me — if Nishtha was facing this problem,
            maybe thousands of other women were too.
          </p>

          <p>
            That small thought slowly became the beginning of{" "}
            <span className="font-semibold text-brand-gold-light">
              Samya By Samishtha
            </span>
            .
          </p>

          <p>
            Built by Samarth, inspired by Nishtha, and named from a part of
            both our identities, Samya was never meant to be just another
            jewellery brand. We created it with a simple dream — to make every
            woman feel elegant, confident, and special without compromising
            on quality, affordability, or style.
          </p>

          <p>
            Every piece we design carries a little part of that emotion. A
            little love. A little celebration. And a reminder that jewellery
            is not just about how it looks — it&apos;s about how it makes you
            feel.
          </p>

          <p className="font-medium text-brand-gold-light">
            Because for us, jewellery is never just an accessory. It becomes
            part of your memories, your celebrations, your confidence, and
            your story.
          </p>

          <p>And we feel truly honoured to become a small part of it.</p>
        </div>
      </div>
    </div>
  );
}
