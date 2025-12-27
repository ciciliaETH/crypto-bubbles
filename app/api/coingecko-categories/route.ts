import { NextResponse } from 'next/server'

const CG_ENDPOINT = 'https://api.coingecko.com/api/v3/coins/categories'

export async function GET() {
  try {
    const res = await fetch(`${CG_ENDPOINT}?order=market_cap_desc`, {
      // Revalidate every 10 minutes on the edge
      next: { revalidate: 600 },
      headers: {
        'Accept': 'application/json',
      },
    })
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch categories' }, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
