import { supabase } from "@/integrations/supabase/client";

export interface ShareItem {
  id: string;
  code: string;
  type: "text" | "file";
  content?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  fileUrl?: string;
  password?: string;
  expiresAt: number;
  oneTimeDownload: boolean;
  downloaded: boolean;
  createdAt: number;
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

async function toShareItem(row: any): Promise<ShareItem> {
  let fileUrl: string | undefined;

  if (row.file_path) {
    // Generate a signed URL so file access does not depend on sender session/window state.
    const expiresAtMs = new Date(row.expires_at).getTime();
    const remainingSeconds = Math.max(1, Math.floor((expiresAtMs - Date.now()) / 1000));
    const signedUrlTtl = Math.min(remainingSeconds, 60 * 60 * 24);

    const { data } = await supabase.storage
      .from("shares")
      .createSignedUrl(row.file_path, signedUrlTtl);

    fileUrl = data?.signedUrl;

    if (!fileUrl) {
      fileUrl = supabase.storage.from("shares").getPublicUrl(row.file_path).data.publicUrl;
    }
  }

  return {
    id: row.id,
    code: row.code,
    type: row.type as "text" | "file",
    content: row.content ?? undefined,
    fileName: row.file_name ?? undefined,
    fileSize: row.file_size ?? undefined,
    fileType: row.file_type ?? undefined,
    fileUrl,
    password: row.password ?? undefined,
    expiresAt: new Date(row.expires_at).getTime(),
    oneTimeDownload: row.one_time_download,
    downloaded: row.downloaded,
    createdAt: new Date(row.created_at).getTime(),
  };
}

export async function createShare(data: {
  type: "text" | "file";
  content?: string;
  file?: File;
  password?: string;
  expiresAt: number;
  oneTimeDownload: boolean;
}): Promise<ShareItem> {
  const code = generateCode();
  let filePath: string | null = null;

  // Upload file to storage if present
  if (data.type === "file" && data.file) {
    filePath = `${code}/${data.file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("shares")
      .upload(filePath, data.file);
    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
  }

  const { data: row, error } = await supabase
    .from("shares")
    .insert({
      code,
      type: data.type,
      content: data.content ?? null,
      file_name: data.file?.name ?? null,
      file_size: data.file?.size ?? null,
      file_type: data.file?.type ?? null,
      file_path: filePath,
      password: data.password || null,
      expires_at: new Date(data.expiresAt).toISOString(),
      one_time_download: data.oneTimeDownload,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create share: ${error.message}`);
  return await toShareItem(row);
}

export async function getShare(code: string): Promise<ShareItem | null> {
  const { data: row, error } = await supabase
    .from("shares")
    .select("*")
    .eq("code", code.toUpperCase())
    .gt("expires_at", new Date().toISOString())
    .single();

  if (error || !row) return null;
  return await toShareItem(row);
}

export async function markDownloaded(code: string): Promise<void> {
  const upperCode = code.toUpperCase();

  // Get the share first
  const { data: row } = await supabase
    .from("shares")
    .select("*")
    .eq("code", upperCode)
    .single();

  if (!row) return;

  if (row.one_time_download) {
    // Delete file from storage
    if (row.file_path) {
      await supabase.storage.from("shares").remove([row.file_path]);
    }
    // Delete the record
    await supabase.from("shares").delete().eq("code", upperCode);
  } else {
    await supabase
      .from("shares")
      .update({ downloaded: true })
      .eq("code", upperCode);
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}
