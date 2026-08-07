import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/dal";
import { getNotifications, getUnreadNotificationCount } from "@/lib/data";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ notifications: [], unreadCount: 0 });

  const [notifications, unreadCount] = await Promise.all([
    getNotifications(user.id),
    getUnreadNotificationCount(user.id),
  ]);

  return NextResponse.json({ notifications, unreadCount });
}
