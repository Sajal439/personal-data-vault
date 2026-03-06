import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Readable } from "node:stream";

import { config } from "@repo/config";

const S3_ENDPOINT = config.minio.endpoint;
const S3_ACCESS_KEY = config.minio.accessKey;
const S3_SECRET_KEY = config.minio.secretKey;
const S3_BUCKET = config.minio.bucketName;
const S3_REGION = "us-east-1";

const s3 = new S3Client({
  endpoint: S3_ENDPOINT,
  region: S3_REGION,
  credentials: {
    accessKeyId: S3_ACCESS_KEY,
    secretAccessKey: S3_SECRET_KEY,
  },
  forcePathStyle: true, // Required for MinIO compatibility
});

/**
 * Ensures the storage bucket exists. Called once on server startup.
 */
export async function ensureBucket(): Promise<void> {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: S3_BUCKET }));
  } catch {
    await s3.send(new CreateBucketCommand({ Bucket: S3_BUCKET }));
    console.log(`Created bucket: ${S3_BUCKET}`);
  }
}

/**
 * Upload a file buffer or stream to S3/MinIO.
 */
export async function uploadFile(
  key: string,
  body: Buffer | Readable,
  contentType: string,
  size?: number,
): Promise<void> {
  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      ...(size ? { ContentLength: size } : {}),
    }),
  );
}

/**
 * Get a file as a readable stream from S3/MinIO.
 */
export async function getFileStream(key: string): Promise<Readable> {
  const response = await s3.send(
    new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    }),
  );

  return response.Body as Readable;
}

/**
 * Delete a file from S3/MinIO.
 */
export async function deleteFile(key: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    }),
  );
}

/**
 * Generate a pre-signed URL for downloading a file.
 */
export async function getSignedDownloadUrl(
  key: string,
  expiresInSeconds = 3600,
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
  });

  return getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
}
