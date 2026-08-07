import Link from "next/link";

export default function PromoBanner({ imageUrl, link }: { imageUrl: string; link?: string }) {
  const image = (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={imageUrl} alt="" className="h-full w-full object-cover" />
  );

  return (
    <div className="px-6 pt-6 md:px-10">
      <div className="mx-auto aspect-[21/6] max-w-6xl overflow-hidden rounded-xl border border-white/10 shadow-lg">
        {link ? (
          <Link href={link} className="block h-full w-full transition-transform duration-300 hover:scale-[1.01]">
            {image}
          </Link>
        ) : (
          image
        )}
      </div>
    </div>
  );
}
