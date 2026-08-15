import { supabaseAdmin } from '../../config/supabase';
import { v4 as uuidv4 } from 'uuid';

const BUCKET_NAME = 'resumes';

export interface UploadedFile {
  path: string;
  publicUrl: string;
}

export async function uploadResumeFile(
  userId: string,
  buffer: Buffer,
  originalFileName: string,
  mimeType: string
): Promise<UploadedFile> {
  const ext = originalFileName.slice(originalFileName.lastIndexOf('.'));
  const uniqueName = `${uuidv4()}${ext}`;
  const filePath = `${userId}/${uniqueName}`;

  const { error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(filePath, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  // Get signed URL (private bucket) — valid for 1 hour on demand
  return {
    path: filePath,
    publicUrl: '', // We'll generate signed URLs on-demand
  };
}

export async function getSignedResumeUrl(
  filePath: string,
  expiresInSeconds = 3600
): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .createSignedUrl(filePath, expiresInSeconds);

  if (error || !data) {
    throw new Error(`Failed to create signed URL: ${error?.message ?? 'unknown'}`);
  }

  return data.signedUrl;
}

export async function deleteResumeFile(filePath: string): Promise<void> {
  const { error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

export async function downloadResumeFile(filePath: string): Promise<Buffer> {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .download(filePath);

  if (error || !data) {
    throw new Error(`Failed to download file: ${error?.message ?? 'unknown'}`);
  }

  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}