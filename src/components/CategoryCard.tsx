import Image from "next/image";
import Link from "next/link";

export default function CategoryCard({
  name,
  slug,
  image,
}: {
  name: string;
  slug: string;
  image: string;
}) {
  return (
    <Link
      href={`/shop/${slug}`}
      className="group relative flex flex-col items-center gap-3 sm:gap-4"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-full bg-brand-teal/5 ring-1 ring-brand-gold/30 transition-shadow group-hover:shadow-gold">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 40vw, 20vw"
        />
      </div>
      <span className="font-serif text-sm sm:text-base font-medium text-brand-teal group-hover:text-brand-gold-dark">
        {name}
      </span>
    </Link>
  );
}
