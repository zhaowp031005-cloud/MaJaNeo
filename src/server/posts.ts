import { prisma } from "@/server/db";
import { Author, MediaKind, StatDimension } from "@/generated/prisma/client";
import { deleteStoredObject } from "@/server/storage";

export type CreatePostInput = {
  occurredAt: Date;
  author: Author;
  content: string;
  media: Array<{
    kind: MediaKind;
    mime: string;
    bucket: string;
    objectKey: string;
    width?: number;
    height?: number;
    duration?: number;
  }>;
  statEvents: Array<{
    dimension: StatDimension;
    delta: number;
    reason: string;
  }>;
};

export async function listPosts() {
  try {
    return await prisma.post.findMany({
      orderBy: { occurredAt: "desc" },
      include: {
        media: { orderBy: { createdAt: "asc" } },
        statEvents: { orderBy: { createdAt: "asc" } },
      },
    });
  } catch {
    return [];
  }
}

export async function createPost(input: CreatePostInput) {
  try {
    return await prisma.post.create({
      data: {
        occurredAt: input.occurredAt,
        author: input.author,
        content: input.content,
        media: {
          create: input.media.map((m) => ({
            kind: m.kind,
            mime: m.mime,
            bucket: m.bucket,
            objectKey: m.objectKey,
            width: m.width,
            height: m.height,
            duration: m.duration,
          })),
        },
        statEvents: {
          create: input.statEvents.map((e) => ({
            dimension: e.dimension,
            delta: e.delta,
            reason: e.reason,
          })),
        },
      },
      include: {
        media: true,
        statEvents: true,
      },
    });
  } catch {
    throw new Error("DB_UNAVAILABLE");
  }
}

export async function deletePost(id: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: { media: true },
    });
    if (!post) return { ok: false as const, reason: "NOT_FOUND" as const };

    await prisma.post.delete({ where: { id } });

    await Promise.all(
      post.media.map((m) =>
        deleteStoredObject({ bucket: m.bucket, objectKey: m.objectKey })
      )
    );

    return { ok: true as const };
  } catch {
    throw new Error("DB_UNAVAILABLE");
  }
}
