'use client'

import { useCryptoStore } from '@/store/cryptoStore'

export default function Header() {
  const { cryptoData } = useCryptoStore()
  
  return (
    <header
      className="px-6 py-3 bg-black/80 backdrop-blur-sm border-b border-white/10"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-white uppercase tracking-wide">
            🫧 CRYPTO BUBBLES
          </h1>
          
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-green-300 text-xs font-semibold">LIVE</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3 text-xs">
          <div className="text-gray-400">
            <span className="text-white font-bold">{cryptoData.length}</span> COINS
          </div>
        </div>
      </div>
    </header>
  )
}
