import { create } from 'zustand'
import { getCryptoMarketData, CryptoData, TimeFrame } from '@/lib/api'

interface CryptoStore {
  cryptoData: CryptoData[]
  filteredData: CryptoData[]
  timeframe: TimeFrame
  searchQuery: string
  selectedCrypto: CryptoData | null
  isLoading: boolean
  error: string | null
  
  setTimeframe: (timeframe: TimeFrame) => void
  setSearchQuery: (query: string) => void
  setSelectedCrypto: (crypto: CryptoData | null) => void
  fetchCryptoData: () => Promise<void>
  filterData: () => void
}

export const useCryptoStore = create<CryptoStore>((set, get) => ({
  cryptoData: [],
  filteredData: [],
  timeframe: '24h',
  searchQuery: '',
  selectedCrypto: null,
  isLoading: false,
  error: null,

  setTimeframe: (timeframe) => {
    set({ timeframe })
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query })
    get().filterData()
  },

  setSelectedCrypto: (crypto) => {
    set({ selectedCrypto: crypto })
  },

  fetchCryptoData: async () => {
    set({ isLoading: true, error: null })
    try {
      const data = await getCryptoMarketData(200)
      
      // FILTER OUT STABLECOINS DAN FIAT - HANYA CRYPTO ASLI
      const excludeList = [
        'usdt', 'usdc', 'busd', 'dai', 'usdd', 'tusd', 'usdp', 'gusd', 'usdn',
        'frax', 'lusd', 'susd', 'ustc', 'ust', 'fei', 'tribe', 'usdk', 'usdx',
        'wbtc', 'weth', 'wbnb', 'renbtc', 'hbtc', 'tbtc', 'steth', 'reth',
        'wrapped', 'tether', 'usd-coin', 'binance-usd', 'true-usd',
        'paxos', 'gemini', 'liquity', 'magic-internet-money', 'mim',
        'wrapped-bitcoin', 'wrapped-ether', 'wrapped-bnb', 'staked-ether'
      ]
      
      const filteredData = data.filter(coin => {
        const symbol = coin.symbol.toLowerCase()
        const id = coin.id.toLowerCase()
        return !excludeList.some(excluded => 
          symbol.includes(excluded) || id.includes(excluded)
        )
      }).slice(0, 100)
      
      set({ cryptoData: filteredData, filteredData: filteredData, isLoading: false })
      get().filterData()
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false 
      })
    }
  },

  filterData: () => {
    const { cryptoData, searchQuery } = get()
    
    if (!searchQuery.trim()) {
      set({ filteredData: cryptoData })
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = cryptoData.filter(
      (crypto) =>
        crypto.name.toLowerCase().includes(query) ||
        crypto.symbol.toLowerCase().includes(query)
    )
    
    set({ filteredData: filtered })
  },
}))
