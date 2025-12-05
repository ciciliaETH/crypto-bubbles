'use client'

import { useCryptoStore } from '@/store/cryptoStore'
import { TimeFrame } from '@/lib/api'

const timeframes: { value: TimeFrame; label: string }[] = [
  { value: '1h', label: '1H' },
  { value: '24h', label: '24H' },
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '1y', label: '1Y' },
]

export default function Controls() {
  const { timeframe, setTimeframe, searchQuery, setSearchQuery } = useCryptoStore()

  return (
    <div className="px-6 py-3 bg-black/70 backdrop-blur-sm border-b border-white/5">
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-white/20 transition-colors"
          />
        </div>

        <div className="flex gap-2">
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
        </div>
      </div>
    </div>
  )
}
