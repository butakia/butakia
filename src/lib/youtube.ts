export function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    let videoId: string | null = null;

    if (u.hostname.includes("youtu.be")) {
      videoId = u.pathname.slice(1);
    } else if (u.hostname.includes("youtube.com")) {
      if (u.pathname === "/watch") videoId = u.searchParams.get("v");
      else if (u.pathname.startsWith("/embed/")) videoId = u.pathname.split("/embed/")[1];
      else if (u.pathname.startsWith("/shorts/")) videoId = u.pathname.split("/shorts/")[1];
    }

    if (!videoId) return null;
    videoId = videoId.split("?")[0].split("&")[0];

    const params = new URLSearchParams({
      autoplay: "1",
      mute: "1",
      controls: "0",
      loop: "1",
      playlist: videoId,
      modestbranding: "1",
      rel: "0",
    });
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  } catch {
    return null;
  }
}
