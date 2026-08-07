"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Check } from "lucide-react";
import { markNotificationsReadAction } from "@/lib/actions";
import { Notification } from "@/lib/types";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "justo ahora";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}

export default function NotificationBell({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const load = () => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        setNotifications(data.notifications ?? []);
        setUnreadCount(data.unreadCount ?? 0);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleOpen = () => {
    setOpen((v) => !v);
    if (!open && unreadCount > 0) {
      markNotificationsReadAction();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={handleOpen}
        aria-label="Notificaciones"
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/10"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-80 overflow-hidden rounded-xl border border-white/10 bg-black/85 shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <p className="text-sm font-bold text-white">Notificaciones</p>
            {unreadCount === 0 && notifications.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-white/40">
                <Check size={12} /> Al día
              </span>
            )}
          </div>
          <div className="max-h-96 divide-y divide-white/5 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="p-6 text-center text-sm text-white/40">
                No tienes notificaciones todavía.
              </p>
            )}
            {notifications.map((n) => {
              const content = (
                <div className={`px-4 py-3 text-sm ${n.read ? "text-white/50" : "text-white"}`}>
                  <p className="leading-snug">{n.message}</p>
                  <p className="mt-1 text-xs text-white/30">{timeAgo(n.createdAt)}</p>
                </div>
              );
              return n.link ? (
                <Link key={n.id} href={n.link} className="block hover:bg-white/5">
                  {content}
                </Link>
              ) : (
                <div key={n.id}>{content}</div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
