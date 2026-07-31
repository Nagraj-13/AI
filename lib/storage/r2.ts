import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { env } from "@/lib/env";
import fs from "fs";
import path from "path";

// Initialize S3 Client for Cloudflare R2 if credentials exist
const s3Client =
  env.R2_ACCOUNT_ID && env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY
    ? new S3Client({
        region: "auto",
        endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: env.R2_ACCESS_KEY_ID,
          secretAccessKey: env.R2_SECRET_ACCESS_KEY,
        },
      })
    : null;

export async function uploadFile(
  fileKey: string,
  buffer: Buffer,
  contentType: string
): Promise<{ key: string; url: string }> {
  if (s3Client) {
    try {
      const command = new PutObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: fileKey,
        Body: buffer,
        ContentType: contentType,
      });
      await s3Client.send(command);
      return {
        key: fileKey,
        url: `https://${env.R2_BUCKET_NAME}.r2.dev/${fileKey}`,
      };
    } catch (err) {
      console.warn("R2 Upload failed, falling back to local file storage:", err);
    }
  }

  // Local fallback storage for development/offline
  const storageDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  const safeFilename = fileKey.replace(/[^a-zA-Z0-9_.-]/g, "_");
  const filePath = path.join(storageDir, safeFilename);
  fs.writeFileSync(filePath, buffer);

  return {
    key: safeFilename,
    url: `/uploads/${safeFilename}`,
  };
}
