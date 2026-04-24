import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { getSupabaseServerClient } from "@/server/supabase";

export async function saveUpload(file: File) {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const bucket = process.env["SUPABASE_STORAGE_BUCKET"] ?? "media";
    const safeName = file.name.replaceAll(/[^a-zA-Z0-9._-]+/g, "_");
    const now = new Date();
    const objectKey = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(
      2,
      "0"
    )}/${crypto.randomUUID()}-${safeName}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const { error } = await supabase.storage
      .from(bucket)
      .upload(objectKey, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
    if (error) throw error;

    return {
      bucket,
      objectKey,
      mime: file.type || "application/octet-stream",
    };
  }

  const uploadsRoot = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsRoot, { recursive: true });

  const safeName = file.name.replaceAll(/[^a-zA-Z0-9._-]+/g, "_");
  const filename = `${crypto.randomUUID()}-${safeName}`;
  const absolutePath = path.join(uploadsRoot, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(absolutePath, buffer);

  return {
    bucket: "local",
    objectKey: `/uploads/${filename}`,
    mime: file.type || "application/octet-stream",
  };
}

export async function deleteStoredObject(input: { bucket: string; objectKey: string }) {
  if (input.bucket === "local") {
    const normalized = input.objectKey.startsWith("/")
      ? input.objectKey.slice(1)
      : input.objectKey;
    const absolutePath = path.join(process.cwd(), "public", normalized);
    await unlink(absolutePath).catch(() => {});
    return;
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) return;
  await supabase.storage.from(input.bucket).remove([input.objectKey]).catch(() => {});
}
