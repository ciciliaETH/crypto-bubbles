'use client'

import { useCryptoStore } from '@/store/cryptoStore'

export default function Header() {
  const { searchQuery, setSearchQuery } = useCryptoStore() as any

  return (
    <header
      className="px-6 py-3 bg-black/80 backdrop-blur-sm border-b border-white/10"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <h1 className="text-lg md:text-xl font-bold text-white uppercase tracking-wide">
            🫧 CRYPTO BUBBLES
          </h1>
          
          <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-green-500/20">
            <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-green-300 text-[10px] md:text-xs font-semibold">LIVE</span>
          </div>
        </div>

        {/* Search moved here */}
        <div className="w-full max-w-full md:max-w-sm">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 md:px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-white/20 transition-colors"
          />
        </div>
      </div>
    </header>
  )
}
