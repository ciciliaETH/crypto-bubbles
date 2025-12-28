'use client'

import { useState, useEffect } from 'react'
import BubbleChartOptimized from '@/components/BubbleChartOptimized'
import Header from '@/components/Header'
import Controls from '@/components/Controls'
import ScrollingTicker from '@/components/ScrollingTicker'
import LoadingScreen from '@/components/LoadingScreen'
import { useCryptoStore } from '@/store/cryptoStore'

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const { fetchCryptoData, timeframe } = useCryptoStore()

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await fetchCryptoData()
      setIsLoading(false)
    }
    
    loadData()
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetchCryptoData()
    }, 60000)
    
    return () => clearInterval(interval)
  }, [timeframe, fetchCryptoData])

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <main className="min-h-screen bg-black flex flex-col">
      <Header />
      <ScrollingTicker />
      <Controls />
      <div className="flex-1">
        <BubbleChartOptimized />
      </div>
      {/* Categories removed */}
    </main>
  )
}
