import { NextResponse } from "next/server";
import { suggestStatEvents, suggestStatEventsWithDeepSeek } from "@/server/analyze";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as null | {
    content?: string;
    locale?: string;
  };
  const content = (body?.content ?? "").toString();
  const locale = (body?.locale ?? "zh").toString();
  try {
    const result = await suggestStatEventsWithDeepSeek(content, locale);
    return NextResponse.json(result);
  } catch (error) {
    console.error("analyze route fallback to rules", error);
    const suggestions = suggestStatEvents(content, locale);
    return NextResponse.json({ suggestions, source: "rules" });
  }
}
