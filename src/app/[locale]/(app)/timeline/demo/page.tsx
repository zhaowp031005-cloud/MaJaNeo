import { TimelineAceternity } from "@/components/TimelineAceternity";
import type { TimelinePost } from "@/components/Timeline3D";

function buildMockPosts(): TimelinePost[] {
  return [
    {
      id: "demo-1",
      occurredAt: "2024-02-18T09:15:00.000Z",
      author: "Maya",
      content:
        "2024 的第一张小纸条：我们决定用时间轴记录每一个普通但重要的瞬间。",
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
      content:
        "把家里的一个角落空出来，打算未来做成 Neo 的小小阅读区。",
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
      content:
        "2025 的第一条：开始规律散步。每天 10 分钟，像给未来攒一点耐心。",
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
      content:
        "整理照片备份：想把每次旅行、每次笑都留在 Neo 将来能看到的地方。",
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
      content:
        "今天第一次认真整理了 Neo 的小衣柜。每一件都好小，像在给未来写一封慢慢展开的信。",
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
      content:
        "下午去复查，医生说一切都很稳。回家路上买了蓝莓蛋糕，庆祝这个普通但闪光的小日子。",
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
      content:
        "Demo 卡片效果检查：滚动渐动线、轴线穿过圆心、点开后背景虚化 + 3D Card。",
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
  const posts = buildMockPosts();
  return <TimelineAceternity locale={locale} posts={posts} enableDelete={false} />;
}
