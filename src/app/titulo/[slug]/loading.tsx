export default function TitleLoading() {
  return (
    <div className="min-h-screen bg-black">
      <div className="h-[50vh] min-h-[360px] w-full animate-pulse bg-gradient-to-b from-zinc-900 to-black md:h-[60vh]" />
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 md:px-10">
        <div className="h-8 w-2/3 animate-pulse rounded bg-white/10" />
        <div className="h-4 w-full animate-pulse rounded bg-white/5" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-white/5" />
      </div>
    </div>
  );
}
