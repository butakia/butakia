export default function ForoLoading() {
  return (
    <div className="min-h-screen px-6 pb-16 pt-28 md:px-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 h-10 w-56 animate-pulse rounded bg-white/10" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-white/[0.03]" />
          ))}
        </div>
      </div>
    </div>
  );
}
