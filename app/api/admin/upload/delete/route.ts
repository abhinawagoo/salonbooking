import { NextResponse } from 'next/server'
import path from 'path'
import { unlink } from 'fs/promises'
import { deleteFromR2ByUrl } from '@/lib/r2'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

/** POST: Delete a file from storage by URL. R2: deletes from bucket. Local: deletes from public/uploads. */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const url = body?.url
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL required' }, { status: 400 })
    }
    const trimmed = url.trim()

    // Local upload: /uploads/filename.ext
    if (trimmed.startsWith('/uploads/')) {
      const filename = trimmed.replace(/^\/uploads\//, '').replace(/\.\./g, '')
      if (!filename) return NextResponse.json({ ok: true })
      const filePath = path.join(UPLOAD_DIR, filename)
      try {
        await unlink(filePath)
      } catch (err) {
        if ((err as NodeJS.ErrnoException)?.code !== 'ENOENT') {
          console.error('Local delete error:', err)
          return NextResponse.json({ error: 'Failed to delete from storage' }, { status: 500 })
        }
      }
      return NextResponse.json({ ok: true })
    }

    // R2 upload
    const deleted = await deleteFromR2ByUrl(trimmed)
    if (!deleted) {
      return NextResponse.json({ error: 'Failed to delete from storage' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Delete upload error:', error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
