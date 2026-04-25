import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Author, MediaKind, StatDimension } from "@/generated/prisma/client";
import { authCookieName, isAuthed } from "@/server/auth";
import { createPost, deletePost, listPosts } from "@/server/posts";
import { suggestStatEvents } from "@/server/analyze";
import { saveUpload } from "@/server/storage";

function toAuthor(value: string | null) {
  if (value === "MANTING" || value === "JANO" || value === "FAMILY")
    return value as Author;
  return "FAMILY" as Author;
}

function toMediaKind(mime: string): MediaKind {
  if (mime.startsWith("image/")) return "IMAGE";
  if (mime.startsWith("video/")) return "VIDEO";
  if (mime.startsWith("audio/")) return "AUDIO";
  return "IMAGE";
}

async function requireAuthed() {
  const cookieStore = await cookies();
  const value = cookieStore.get(authCookieName)?.value;
  return isAuthed(value);
}

export async function GET() {
  if (!(await requireAuthed()))
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const posts = await listPosts();
  return NextResponse.json({ posts });
}

export async function POST(req: Request) {
  if (!(await requireAuthed()))
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const form = await req.formData();

  const occurredAtRaw = form.get("occurredAt");
  const occurredAt = occurredAtRaw
    ? new Date(String(occurredAtRaw))
    : new Date();

  const author = toAuthor(form.get("author")?.toString() ?? null);
  const title = (form.get("title")?.toString() ?? "").trim();
  const content = (form.get("content")?.toString() ?? "").trim();

  const rawEvents = form.get("statEventsJson")?.toString();
  const events =
    rawEvents && rawEvents.length > 0
      ? (JSON.parse(rawEvents) as Array<{
          dimension: StatDimension;
          delta: number;
          reason: string;
        }>)
      : suggestStatEvents(content);

  const files = form.getAll("media").filter((v): v is File => v instanceof File);
  const media = [];

  for (const file of files) {
    const saved = await saveUpload(file);
    media.push({
      kind: toMediaKind(saved.mime),
      mime: saved.mime,
      bucket: saved.bucket,
      objectKey: saved.objectKey,
    });
  }

  try {
    const post = await createPost({
      occurredAt,
      author,
        title,
      content,
      media,
      statEvents: events,
    });

    return NextResponse.json({ post });
  } catch (e) {
    if (e instanceof Error && e.message === "DB_UNAVAILABLE") {
      return NextResponse.json(
        { error: "db_unavailable" },
        { status: 503 }
      );
    }
    throw e;
  }
}

export async function DELETE(req: Request) {
  if (!(await requireAuthed()))
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });

  try {
    const result = await deletePost(id);
    if (!result.ok)
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Error && e.message === "DB_UNAVAILABLE") {
      return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    }
    throw e;
  }
}
