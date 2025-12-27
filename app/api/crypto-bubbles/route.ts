import { NextResponse } from 'next/server'

const SOURCE = 'https://cryptobubbles.net/backend/data/bubbles1000.usd.json'

export async function GET() {
  try {
    const res = await fetch(SOURCE, {
      // spoof UA and disable cache to keep data fresh
      headers: { 'User-Agent': 'Mozilla/5.0' },
      // revalidate frequently
      next: { revalidate: 30 },
    })
    if (!res.ok) {
      return NextResponse.json({ error: 'Upstream error' }, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=30, s-maxage=30',
      },
    })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch CryptoBubbles' }, { status: 500 })
  }
}
