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
  } catch (error) {
    console.error("listApprovedWishes failed", error);
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
  } catch (error) {
    console.error("listWishesByStatus failed", error);
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
  } catch (error) {
    console.error("createWish failed", error);
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
  } catch (error) {
    console.error("reviewWish failed", error);
    throw new Error("DB_UNAVAILABLE");
  }
}

export async function deleteWish(id: string) {
  try {
    await prisma.wish.delete({ where: { id } });
    return { ok: true as const };
  } catch (error) {
    console.error("deleteWish failed", error);
    throw new Error("DB_UNAVAILABLE");
  }
}
