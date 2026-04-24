import { NextResponse } from "next/server";
import { suggestStatEvents } from "@/server/analyze";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as null | { content?: string };
  const content = (body?.content ?? "").toString();
  const suggestions = suggestStatEvents(content);
  return NextResponse.json({ suggestions });
}
