import Image from "next/image";

export const metadata = { title: "About Us | Samya By Samishtha" };

export default function AboutPage() {
  return (
    <div className="container-px mx-auto section-y max-w-3xl">
      <div className="text-center mb-10">
        <Image
          src="/images/logo.png"
          alt="Samya By Samishtha"
          width={160}
          height={64}
          className="h-16 w-auto object-contain mx-auto mb-6"
        />
        <span className="eyebrow">Our Story</span>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-brand-teal">
          About Samya By Samishtha
        </h1>
      </div>
      <div className="prose prose-teal max-w-none text-brand-teal/80 leading-relaxed space-y-4">
        <p>
          Samya By Samishtha is a premium artificial &amp; fashion jewellery
          brand, crafted for those who believe that elegance is in the
          details. From intricately designed earrings and necklaces to
          statement bangles and pendants, every piece is created to bring
          timeless charm to your everyday and festive wardrobe.
        </p>
        <p>
          We believe beautiful jewellery shouldn&apos;t come with a hefty
          price tag. Our collections are thoughtfully designed, skin-friendly,
          and made to last — perfect for weddings, festivals, gifting or
          simply treating yourself.
        </p>
        <p>
          Thank you for being a part of our journey. We can&apos;t wait for
          you to discover a piece you&apos;ll love forever.
        </p>
      </div>
    </div>
  );
}
