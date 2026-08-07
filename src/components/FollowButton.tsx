"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, UserCheck } from "lucide-react";
import { toggleFollowAction } from "@/lib/actions";

export default function FollowButton({
  contributorId,
  initialFollowing,
  isLoggedIn,
}: {
  contributorId: string;
  initialFollowing: boolean;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [isPending, startTransition] = useTransition();

  if (!isLoggedIn) return null;

  return (
    <button
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const result = await toggleFollowAction(contributorId);
          setFollowing(result.following);
          router.refresh();
        })
      }
      className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-colors disabled:opacity-50 ${
        following
          ? "border border-white/20 bg-white/10 text-white hover:bg-white/15"
          : "bg-accent text-white hover:bg-accent-hover"
      }`}
    >
      {following ? <UserCheck size={13} /> : <UserPlus size={13} />}
      {following ? "Siguiendo" : "Seguir"}
    </button>
  );
}
