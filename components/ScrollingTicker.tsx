'use client'

import { useEffect, useState } from 'react'

export default function ScrollingTicker() {
  const [tickerItems] = useState([
    "Strategi Trading dan Investasi Crypto untuk Gandain Uang Kamu.",
    "81% Members Puas dengan Outlook Calls Informasi Informasi, dan komunitas Trade With Suli (Survery per Juli 2025).",
    "Dapatkan Sinyal Trading dari Suli Sebelum Orang Lain Tahu.",
    "Gratis! Trading Risk Calculator",
    "Akses Komunitas Diskusi Crypto Terbesar di Indonesia"
  ])

  return (
    <div className="w-full bg-black border-b border-white/10 overflow-hidden py-2">
      <div className="flex animate-scroll whitespace-nowrap">
        {/* Duplicate items for seamless loop */}
        {[...tickerItems, ...tickerItems].map((item, index) => (
          <div key={index} className="inline-flex items-center mx-8">
            <span className="text-white/70 text-sm font-medium">|</span>
            <span className="text-white/90 text-sm ml-4">{item}</span>
          </div>
        ))}
      </div>
      
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 60s linear infinite;
        }
      `}</style>
    </div>
  )
}
