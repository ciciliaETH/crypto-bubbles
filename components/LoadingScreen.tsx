'use client'

import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
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
          {/* Bubble logo */}
          <div className="w-20 h-20 rounded-2xl bg-black/40 flex items-center justify-center shadow-2xl">
            <div className="relative w-12 h-12">
              <span className="absolute left-0 bottom-0 w-4 h-4 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-300 opacity-90" />
              <span className="absolute left-3 top-1 w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-300 opacity-90" />
              <span className="absolute right-0 top-4 w-5 h-5 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-300 opacity-90" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-white mb-2">
            Loading
          </h2>
          
          <div className="flex items-center justify-center gap-2">
          </div>
        </motion.div>

        {/* Animated progress bar */}
        <motion.div 
          className="mt-8 w-64 h-1 bg-white/10 rounded-full overflow-hidden mx-auto"
        >
          <motion.div
            className="h-full bg-white"
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
