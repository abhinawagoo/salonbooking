/**
 * Cloudflare R2 upload (S3-compatible API).
 * Set env: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL
 * R2_PUBLIC_URL = public URL for the bucket (e.g. https://pub-xxx.r2.dev or custom domain).
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

const accountId = process.env.R2_ACCOUNT_ID
const accessKeyId = process.env.R2_ACCESS_KEY_ID
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
const bucketName = process.env.R2_BUCKET_NAME
const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, '')

export const R2_ENABLED =
  Boolean(accountId && accessKeyId && secretAccessKey && bucketName && publicUrl)

export type R2Folder = 'services' | 'service' | 'hero' | 'gallery' | 'subcategory' | 'home_videos' | 'location' | 'signature'

function getClient(): S3Client | null {
  if (!R2_ENABLED || !accountId || !accessKeyId || !secretAccessKey) return null
  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  })
}

/**
 * Upload a file to R2. Key will be {folder}/{uniqueId}.{ext}
 * Returns full public URL or null if R2 not configured / upload failed.
 */
export async function uploadToR2(
  folder: R2Folder,
  buffer: Buffer,
  contentType: string,
  ext: string
): Promise<string | null> {
  if (!R2_ENABLED || !bucketName || !publicUrl) return null
  const client = getClient()
  if (!client) return null

  const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  const key = `${folder}/${uniqueId}${ext}`

  try {
    await client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    )
    return `${publicUrl}/${key}`
  } catch (err) {
    console.error('R2 upload error:', err)
    return null
  }
}

/**
 * Delete an object from R2 by its public URL.
 * Only deletes if the URL belongs to our R2 bucket (starts with R2_PUBLIC_URL).
 * Returns true if deleted (or not our URL), false on error.
 */
export async function deleteFromR2ByUrl(url: string): Promise<boolean> {
  if (!R2_ENABLED || !bucketName || !publicUrl || !url || typeof url !== 'string') return true
  const trimmed = url.trim()
  if (!trimmed.startsWith(publicUrl)) return true
  const key = trimmed.slice(publicUrl.length).replace(/^\//, '')
  if (!key) return true
  const client = getClient()
  if (!client) return true
  try {
    await client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    )
    return true
  } catch (err) {
    console.error('R2 delete error:', err)
    return false
  }
}
