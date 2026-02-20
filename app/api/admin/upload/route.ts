import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { uploadToR2, R2_ENABLED, type R2Folder } from '@/lib/r2'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_VIDEO_SIZE = 80 * 1024 * 1024 // 80MB (good quality, max 30 sec enforced in UI)
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_VIDEO_TYPES = ['video/mp4'] // MP4 only for hero

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const type = (formData.get('type') as string) || 'gallery' // service | hero | gallery

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const folder = type as R2Folder
    if (!['service', 'hero', 'gallery', 'subcategory'].includes(folder)) {
      return NextResponse.json({ error: 'Invalid type. Use service, hero, gallery, or subcategory.' }, { status: 400 })
    }

    const fileType = file.type
    const isImage = ALLOWED_IMAGE_TYPES.includes(fileType)
    const isVideo = ALLOWED_VIDEO_TYPES.includes(fileType)

    if (folder === 'hero') {
      if (!isVideo && !isImage) {
        return NextResponse.json(
          { error: 'Hero accepts image (JPEG, PNG, WebP) or MP4 video.' },
          { status: 400 }
        )
      }
    } else {
      if (!isImage) {
        return NextResponse.json(
          { error: 'Invalid file type. Use image (JPEG, PNG, WebP, GIF) for service/gallery.' },
          { status: 400 }
        )
      }
    }

    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: isVideo ? 'Video too large' : 'Image too large (max 10MB)' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    if (R2_ENABLED) {
      const ext = folder === 'hero' && isVideo ? '.mp4' : path.extname(file.name) || '.jpg'
      const url = await uploadToR2(folder, buffer, file.type, ext)
      if (url) {
        return NextResponse.json({ url })
      }
      // Fall through to local if R2 upload failed
    }

    await mkdir(UPLOAD_DIR, { recursive: true })
    const ext = path.extname(file.name) || (isImage ? '.jpg' : '.mp4')
    const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9-_]/g, '_')
    const uniqueName = `${baseName}-${Date.now()}${ext}`
    const filePath = path.join(UPLOAD_DIR, uniqueName)
    await writeFile(filePath, buffer)

    const url = `/uploads/${uniqueName}`
    return NextResponse.json({ url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
