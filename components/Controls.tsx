'use client'

import { useCryptoStore } from '@/store/cryptoStore'
import { Pin } from 'lucide-react'
import { useState } from 'react'
import { TimeFrame } from '@/lib/api'

const timeframes: { value: TimeFrame; label: string }[] = [
  { value: '1h', label: '1H' },
  { value: '24h', label: '24H' },
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '1y', label: '1Y' },
]

export default function Controls() {
  const { timeframe, setTimeframe, mode, setMode, popMode, setPopMode } = useCryptoStore() as any

  return (
    <div className="px-4 md:px-6 py-3 bg-black border-b border-white/5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Left: Size */}
        <div className="w-full md:w-auto flex items-center gap-2 flex-wrap text-xs md:text-sm">
          <span className="text-gray-400">Size:</span>
          {[{ key: 'marketcap', label: 'Market Cap & Day' }, { key: 'change', label: 'Change' }].map((opt: any) => (
            <button
              key={opt.key}
              onClick={() => setMode(opt.key)}
              className={`px-2.5 md:px-3 py-1.5 rounded-md font-semibold ${
                mode === opt.key ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Right: Timeframe */}
        <div className="w-full md:w-auto flex gap-2 relative overflow-x-auto md:overflow-visible whitespace-nowrap md:whitespace-normal pb-1">
          {timeframes.map((tf) => {
            const isActive = timeframe === tf.value
            return (
              <button
                key={tf.value}
                onClick={() => setTimeframe(tf.value)}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${
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
            className={`ml-2 md:ml-3 px-3 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${
              popMode ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
            title="Pop Tool: click bubbles to pop"
          >
            <Pin size={16} />
          </button>
          {/* Categories removed */}
        </div>
      </div>
    </div>
  )
}
