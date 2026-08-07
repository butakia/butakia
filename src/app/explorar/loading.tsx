export default function ExplorarLoading() {
  return (
    <div className="min-h-screen px-6 pb-16 pt-28 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 h-10 w-64 animate-pulse rounded bg-white/10" />
        <div className="mb-8 h-12 w-full animate-pulse rounded-lg bg-white/5" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] animate-pulse rounded-lg bg-white/5" />
          ))}
        </div>
      </div>
    </div>
  );
}
