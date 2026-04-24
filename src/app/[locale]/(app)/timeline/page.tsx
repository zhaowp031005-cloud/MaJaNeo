import { listPosts } from "@/server/posts";
import { getMediaUrl } from "@/server/media";
import { TimelineAceternity } from "@/components/TimelineAceternity";
import type { TimelinePost } from "@/components/Timeline3D";

export default async function TimelinePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const posts = await listPosts();
  const mediaUrls = new Map<string, string>();
  await Promise.all(
    posts.flatMap((p) =>
      p.media.map(async (m) => {
        const url = await getMediaUrl({ bucket: m.bucket, objectKey: m.objectKey });
        if (url) mediaUrls.set(m.id, url);
      })
    )
  );

  const items: TimelinePost[] = posts.map((p) => ({
    id: p.id,
    occurredAt: p.occurredAt.toISOString(),
    author: p.author,
    content: p.content,
    media: p.media.map((m) => ({
      id: m.id,
      kind: m.kind,
      url: mediaUrls.get(m.id) ?? null,
      mime: m.mime,
    })),
  }));

  return <TimelineAceternity locale={locale} posts={items} />;
}
