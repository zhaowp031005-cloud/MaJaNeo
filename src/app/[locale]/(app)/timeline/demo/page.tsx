import { getTranslations } from "next-intl/server";
import { TimelineAceternity } from "@/components/TimelineAceternity";
import type { TimelinePost } from "@/components/Timeline3D";

function buildMockPosts(t: Awaited<ReturnType<typeof getTranslations<"timelineDemo">>>): TimelinePost[] {
  return [
    {
      id: "demo-1",
      occurredAt: "2024-02-18T09:15:00.000Z",
      author: "Maya",
      title: t("title1"),
      content: t("item1"),
      media: [
        {
          id: "demo-m-1",
          kind: "IMAGE",
          url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
          mime: "image/jpeg",
        },
      ],
    },
    {
      id: "demo-2",
      occurredAt: "2024-09-03T18:40:00.000Z",
      author: "Jason",
      title: t("title2"),
      content: t("item2"),
      media: [
        {
          id: "demo-m-2",
          kind: "IMAGE",
          url: "https://images.unsplash.com/photo-1505253210343-d4f5f145e3a2?auto=format&fit=crop&w=1200&q=80",
          mime: "image/jpeg",
        },
      ],
    },
    {
      id: "demo-3",
      occurredAt: "2025-01-27T07:55:00.000Z",
      author: "Maya",
      title: t("title3"),
      content: t("item3"),
      media: [
        {
          id: "demo-m-3",
          kind: "IMAGE",
          url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
          mime: "image/jpeg",
        },
      ],
    },
    {
      id: "demo-4",
      occurredAt: "2025-07-06T20:10:00.000Z",
      author: "Jason",
      title: t("title4"),
      content: t("item4"),
      media: [
        {
          id: "demo-m-4",
          kind: "IMAGE",
          url: "https://images.unsplash.com/photo-1433838552652-f9a46b332c40?auto=format&fit=crop&w=1200&q=80",
          mime: "image/jpeg",
        },
      ],
    },
    {
      id: "demo-5",
      occurredAt: "2026-02-12T10:20:00.000Z",
      author: "Maya",
      title: t("title5"),
      content: t("item5"),
      media: [
        {
          id: "demo-m-5",
          kind: "IMAGE",
          url: "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1200&q=80",
          mime: "image/jpeg",
        },
      ],
    },
    {
      id: "demo-6",
      occurredAt: "2026-03-29T11:05:00.000Z",
      author: "Jason",
      title: t("title6"),
      content: t("item6"),
      media: [
        {
          id: "demo-m-6",
          kind: "IMAGE",
          url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80",
          mime: "image/jpeg",
        },
      ],
    },
    {
      id: "demo-7",
      occurredAt: "2026-04-21T13:10:00.000Z",
      author: "MaJaNeo",
      title: t("title7"),
      content: t("item7"),
      media: [
        {
          id: "demo-m-7",
          kind: "IMAGE",
          url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
          mime: "image/jpeg",
        },
      ],
    },
  ];
}

export default async function TimelineDemoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "timelineDemo" });
  const posts = buildMockPosts(t);
  return <TimelineAceternity locale={locale} posts={posts} enableDelete={false} />;
}
