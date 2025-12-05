'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, TrendingUp, TrendingDown, DollarSign, BarChart3, Activity } from 'lucide-react'
import { CryptoData } from '@/lib/api'
import { formatCurrency, formatPercentage, getPriceChange } from '@/lib/api'
import { useCryptoStore } from '@/store/cryptoStore'

interface CryptoDetailModalProps {
  isOpen: boolean
  onClose: () => void
  crypto: CryptoData | null
}

export default function CryptoDetailModal({ isOpen, onClose, crypto }: CryptoDetailModalProps) {
  const { timeframe } = useCryptoStore()

  if (!crypto) return null

  const priceChange = getPriceChange(crypto, timeframe)
  const isPositive = priceChange >= 0

  const stats = [
    {
      label: 'Current Price',
      value: formatCurrency(crypto.current_price),
      icon: DollarSign,
      color: 'text-primary',
    },
    {
      label: 'Market Cap',
      value: formatCurrency(crypto.market_cap),
      icon: BarChart3,
      color: 'text-secondary',
    },
    {
      label: '24h Volume',
      value: formatCurrency(crypto.total_volume),
      icon: Activity,
      color: 'text-accent',
    },
    {
      label: '24h High',
      value: formatCurrency(crypto.high_24h),
      icon: TrendingUp,
      color: 'text-positive',
    },
    {
      label: '24h Low',
      value: formatCurrency(crypto.low_24h),
      icon: TrendingDown,
      color: 'text-negative',
    },
    {
      label: 'Circulating Supply',
      value: crypto.circulating_supply?.toLocaleString() || 'N/A',
      icon: BarChart3,
      color: 'text-gray-400',
    },
  ]

  const priceChanges = [
    { period: '1 Hour', value: crypto.price_change_percentage_1h_in_currency },
    { period: '24 Hours', value: crypto.price_change_percentage_24h_in_currency },
    { period: '7 Days', value: crypto.price_change_percentage_7d_in_currency },
    { period: '30 Days', value: crypto.price_change_percentage_30d_in_currency },
    { period: '1 Year', value: crypto.price_change_percentage_1y_in_currency },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="glass-strong rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
            >
              {/* Header */}
              <div className="sticky top-0 glass-strong border-b border-white/10 p-6 rounded-t-3xl">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden">
                      <img
                        src={crypto.image}
                        alt={crypto.name}
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    </div>
                    
                    <div>
                      <h2 className="text-3xl font-bold text-white">{crypto.name}</h2>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-gray-400 text-lg">{crypto.symbol.toUpperCase()}</span>
                        <span className="px-2 py-1 rounded-lg bg-white/10 text-xs text-gray-400">
                          Rank #{crypto.market_cap_rank}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Price & Change */}
                <div className="mt-6 flex items-end gap-4">
                  <div className="text-4xl font-bold text-white">
                    {formatCurrency(crypto.current_price)}
                  </div>
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold ${
                      isPositive ? 'bg-positive/20 text-positive' : 'bg-negative/20 text-negative'
                    }`}
                  >
                    {isPositive ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <TrendingDown className="w-5 h-5" />
                    )}
                    <span>{formatPercentage(priceChange)}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Stats Grid */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    Market Statistics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stats.map((stat) => {
                      const Icon = stat.icon
                      return (
                        <div
                          key={stat.label}
                          className="glass rounded-xl p-4 hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <Icon className={`w-5 h-5 ${stat.color}`} />
                            <span className="text-sm text-gray-400">{stat.label}</span>
                          </div>
                          <div className="text-xl font-bold text-white">{stat.value}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Price Changes */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    Price Changes
                  </h3>
                  <div className="glass rounded-xl p-4">
                    <div className="space-y-3">
                      {priceChanges.map((change) => {
                        const value = change.value || 0
                        const isPos = value >= 0
                        
                        return (
                          <div
                            key={change.period}
                            className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                          >
                            <span className="text-gray-400">{change.period}</span>
                            <div className="flex items-center gap-2">
                              <div
                                className={`px-3 py-1 rounded-lg font-semibold ${
                                  isPos ? 'bg-positive/20 text-positive' : 'bg-negative/20 text-negative'
                                }`}
                              >
                                {formatPercentage(value)}
                              </div>
                              {isPos ? (
                                <TrendingUp className="w-4 h-4 text-positive" />
                              ) : (
                                <TrendingDown className="w-4 h-4 text-negative" />
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="glass rounded-xl p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      Data provided by CoinGecko • Updated in real-time
                    </span>
                    <a
                      href={`https://www.coingecko.com/en/coins/${crypto.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-secondary transition-colors font-semibold"
                    >
                      View on CoinGecko →
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
