import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await requireAuth();

    const notifications = await prisma.notification.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: session.userId, isRead: false },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch {
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { id } = await request.json();

    if (id === "all") {
      await prisma.notification.updateMany({
        where: { userId: session.userId, isRead: false },
        data: { isRead: true, readAt: new Date() },
      });
    } else {
      await prisma.notification.update({
        where: { id, userId: session.userId },
        data: { isRead: true, readAt: new Date() },
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}
