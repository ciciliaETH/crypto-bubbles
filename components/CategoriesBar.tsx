
'use client'

import { useEffect, useMemo, useState } from 'react'

interface Category {
  id: string
  name: string
  market_cap: number
  market_cap_change_24h: number
  volume_24h: number
  top_3_coins: string[]
}

export default function CategoriesBar() {
  const [items, setItems] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch('/api/coingecko-categories')
        const data = await r.json()
        const sorted: Category[] = [...data]
          .sort((a, b) => Math.abs(b.market_cap_change_24h || 0) - Math.abs(a.market_cap_change_24h || 0))
          .slice(0, 20)
        setItems(sorted)
      } catch (e) {
        setItems([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return null
  if (!items.length) return null

  return (
    <div className="px-4 md:px-6 py-3 border-t border-white/5 bg-black/70 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
        <div className="text-sm text-gray-300 font-medium">Viral Categories (24h)</div>
        <div className="w-full sm:w-64">
          <input
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            placeholder="Search categories..."
            className="w-full px-3 py-1.5 text-sm rounded-md bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
          />
        </div>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1" style={{scrollbarWidth:'none'}}>
        {items
          .filter(c => c.name.toLowerCase().includes(q.toLowerCase()))
          .map((c) => {
          const pos = (c.market_cap_change_24h || 0) >= 0
          return (
            <a
              key={c.id}
              href={`https://www.coingecko.com/en/categories/${encodeURIComponent(c.id)}`}
              target="_blank" rel="noopener noreferrer"
              className="shrink-0 px-3 py-2 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] hover:from-white/10 hover:to-white/[0.04] border border-white/10 flex items-center gap-2 shadow-sm"
            >
              <div className="flex -space-x-2 mr-1">
                {(c.top_3_coins || []).slice(0,3).map((img, i) => (
                  <img key={i} src={img} alt="coin" className="w-5 h-5 rounded-full border border-black/30" />
                ))}
              </div>
              <div>
                <div className="text-sm text-white font-semibold leading-4 truncate max-w-[12rem]">{c.name}</div>
                <div className={`text-xs ${pos ? 'text-green-400' : 'text-red-400'}`}>{(c.market_cap_change_24h || 0).toFixed(2)}%</div>
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}

// small helper css (no-scrollbar) is inline via tailwind defaults; if not present, it will just show a thin scrollbar.
