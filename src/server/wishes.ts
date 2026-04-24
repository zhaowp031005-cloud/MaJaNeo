import { WishStatus } from "@/generated/prisma/client";
import { prisma } from "@/server/db";

export type CreateWishInput = {
  nickname?: string;
  content: string;
  emoji: string;
};

export async function listApprovedWishes() {
  try {
    return await prisma.wish.findMany({
      where: { status: "APPROVED" },
      orderBy: [{ approvedAt: "desc" }, { createdAt: "desc" }],
      take: 60,
    });
  } catch {
    return [];
  }
}

export async function listWishesByStatus(status: WishStatus) {
  try {
    return await prisma.wish.findMany({
      where: { status },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  } catch {
    return [];
  }
}

export async function createWish(input: CreateWishInput) {
  try {
    return await prisma.wish.create({
      data: {
        nickname: input.nickname?.trim() || null,
        content: input.content.trim(),
        emoji: input.emoji,
        status: "PENDING",
      },
    });
  } catch {
    throw new Error("DB_UNAVAILABLE");
  }
}

export async function reviewWish(id: string, status: "APPROVED" | "REJECTED") {
  try {
    return await prisma.wish.update({
      where: { id },
      data: {
        status,
        reviewedAt: new Date(),
        approvedAt: status === "APPROVED" ? new Date() : null,
        rejectedAt: status === "REJECTED" ? new Date() : null,
      },
    });
  } catch {
    throw new Error("DB_UNAVAILABLE");
  }
}

export async function deleteWish(id: string) {
  try {
    await prisma.wish.delete({ where: { id } });
    return { ok: true as const };
  } catch {
    throw new Error("DB_UNAVAILABLE");
  }
}
