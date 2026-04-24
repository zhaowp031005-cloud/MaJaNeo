import { getSupabaseServerClient } from "@/server/supabase";

export async function getMediaUrl(input: { bucket: string; objectKey: string }) {
  if (input.bucket === "local") return input.objectKey;

  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  const { data } = await supabase.storage
    .from(input.bucket)
    .createSignedUrl(input.objectKey, 60 * 60);

  return data?.signedUrl ?? null;
}
