export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-black">
      <div className="h-[85vh] min-h-[560px] w-full animate-pulse bg-gradient-to-b from-zinc-900 to-black" />
      <div className="flex flex-col gap-10 px-6 py-8 md:px-10">
        {[0, 1, 2].map((row) => (
          <div key={row} className="flex flex-col gap-3">
            <div className="h-5 w-40 animate-pulse rounded bg-white/10" />
            <div className="flex gap-3 overflow-hidden">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[2/3] w-[160px] shrink-0 animate-pulse rounded-lg bg-white/5"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
