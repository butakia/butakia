import Link from "next/link";
import { Upload } from "lucide-react";
import { Contributor } from "@/lib/types";
import FollowButton from "./FollowButton";

export default function UploaderInfo({
  uploader,
  uploaderFollowed,
  isLoggedIn,
}: {
  uploader?: Contributor;
  uploaderFollowed?: boolean;
  isLoggedIn?: boolean;
}) {
  if (!uploader) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <Link href={`/colaboradores/${uploader.id}`} className="flex items-center gap-2.5">
        {uploader.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={uploader.avatarUrl}
            alt={uploader.name}
            className="h-9 w-9 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{
              background: `linear-gradient(135deg, hsl(${(uploader.avatarSeed.length * 37) % 360} 60% 35%), hsl(${(uploader.avatarSeed.length * 37 + 40) % 360} 60% 20%))`,
            }}
          >
            {uploader.name.slice(0, 2).toUpperCase()}
          </div>
        )}
        <span className="flex items-center gap-1.5 text-xs text-white/60">
          <Upload size={12} className="text-accent" />
          Subido por <span className="font-semibold text-white hover:underline">{uploader.name}</span>
          {uploader.uploads !== undefined && (
            <span className="text-white/40">· {uploader.uploads} libros subidos</span>
          )}
        </span>
      </Link>

      <div className="ml-auto flex items-center gap-2">
        <span className="hidden text-xs text-white/40 sm:inline">Sigue a {uploader.name}</span>
        <FollowButton
          contributorId={uploader.id}
          initialFollowing={uploaderFollowed ?? false}
          isLoggedIn={isLoggedIn ?? false}
        />
      </div>
    </div>
  );
}
