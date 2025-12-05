'use client'

import { motion } from 'framer-motion'
import { Loader2, TrendingUp } from 'lucide-react'

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-mesh">
      <div className="text-center">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="inline-block mb-6"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-2xl">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-white mb-2">
            Loading Market Data
          </h2>
          <p className="text-gray-400 mb-6">
            Fetching real-time cryptocurrency prices...
          </p>
          
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <span className="text-sm text-gray-500">Powered by CoinGecko</span>
          </div>
        </motion.div>

        {/* Animated progress bar */}
        <motion.div 
          className="mt-8 w-64 h-1 bg-white/10 rounded-full overflow-hidden mx-auto"
        >
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-secondary"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
        </motion.div>
      </div>
    </div>
  )
}
