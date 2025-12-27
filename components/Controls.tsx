'use client'

import { useCryptoStore } from '@/store/cryptoStore'
import { Pin } from 'lucide-react'
import { useEffect, useState } from 'react'
import { TimeFrame } from '@/lib/api'

const timeframes: { value: TimeFrame; label: string }[] = [
  { value: '1h', label: '1H' },
  { value: '24h', label: '24H' },
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '1y', label: '1Y' },
]

export default function Controls() {
  const { timeframe, setTimeframe, mode, setMode, popMode, setPopMode, setCategoryId } = useCryptoStore() as any
  const [openCat, setOpenCat] = useState(false)
  const [cats, setCats] = useState<any[]>([])
  useEffect(() => {
    if (!openCat || cats.length) return
    fetch('/api/coingecko-categories').then(r=>r.json()).then(d=>{
      const sorted = [...d].sort((a:any,b:any)=>Math.abs(b.market_cap_change_24h||0)-Math.abs(a.market_cap_change_24h||0))
      setCats(sorted)
    })
  }, [openCat, cats.length])

  return (
    <div className="px-6 py-3 bg-black border-b border-white/5">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Size */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">Size:</span>
          {[{ key: 'marketcap', label: 'Market Cap & Day' }, { key: 'change', label: 'Change' }].map((opt: any) => (
            <button
              key={opt.key}
              onClick={() => setMode(opt.key)}
              className={`px-3 py-1.5 rounded-md font-semibold ${
                mode === opt.key ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Right: Timeframe */}
        <div className="flex gap-2 relative">
          {timeframes.map((tf) => {
            const isActive = timeframe === tf.value
            return (
              <button
                key={tf.value}
                onClick={() => setTimeframe(tf.value)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {tf.label}
              </button>
            )
          })}
          {/* Pop tool toggle */}
          <button
            onClick={() => setPopMode(!popMode)}
            className={`ml-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
              popMode ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
            title="Pop Tool: click bubbles to pop"
          >
            <Pin size={16} />
          </button>
          <button
            onClick={() => setOpenCat(!openCat)}
            className={`ml-3 px-3 py-1.5 rounded-md font-semibold ${openCat ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
          >
            Categories
          </button>
          {openCat && (
            <div className="absolute left-0 top-10 z-40 w-80 max-h-80 overflow-auto bg-black border border-white/10 rounded-xl p-2 shadow-lg">
              <button className="w-full text-left px-3 py-2 rounded-md bg-white/5 hover:bg-white/10 text-gray-300" onClick={()=>{setCategoryId(null); setOpenCat(false)}}>
                All Coins
              </button>
              {cats.map((c:any)=> (
                <button key={c.id} className="w-full text-left px-3 py-2 rounded-md bg-white/5 hover:bg-white/10 text-gray-300 flex items-center gap-2 mt-1" onClick={()=>{setCategoryId(c.id); setOpenCat(false)}}>
                  <span className="text-white font-semibold">{c.name}</span>
                  <span className={`${(c.market_cap_change_24h||0)>=0? 'text-green-400':'text-red-400'} text-xs`}>{(c.market_cap_change_24h||0).toFixed(2)}%</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
