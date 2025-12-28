import { NextResponse } from 'next/server'

// Categories feature removed
export async function GET() {
  return NextResponse.json({ error: 'Categories feature removed' }, { status: 410 })
}
