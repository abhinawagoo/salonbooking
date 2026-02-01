import { NextResponse } from 'next/server'
import { deleteFromR2ByUrl } from '@/lib/r2'

/** POST: Delete a file from storage by URL (R2 only; local uploads are not deleted from disk). */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const url = body?.url
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL required' }, { status: 400 })
    }
    await deleteFromR2ByUrl(url)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Delete upload error:', error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
