import { create } from 'zustand'
import { getCryptoMarketData, CryptoData, TimeFrame, getPriceChange } from '@/lib/api'

interface CryptoStore {
  cryptoData: CryptoData[]
  filteredData: CryptoData[]
  timeframe: TimeFrame
  searchQuery: string
  maxBubbles: number
  minAbsChange: number
  mode: 'change' | 'marketcap'
  popMode: boolean
  // categories removed
  selectedCrypto: CryptoData | null
  isLoading: boolean
  error: string | null
  
  setTimeframe: (timeframe: TimeFrame) => void
  setSearchQuery: (query: string) => void
  setMaxBubbles: (n: number) => void
  setMinAbsChange: (n: number) => void
  setMode: (m: 'change' | 'marketcap') => void
  setPopMode: (v: boolean) => void
  setSelectedCrypto: (crypto: CryptoData | null) => void
  fetchCryptoData: () => Promise<void>
  filterData: () => void
}

export const useCryptoStore = create<CryptoStore>((set, get) => ({
  cryptoData: [],
  filteredData: [],
  timeframe: '24h',
  searchQuery: '',
  maxBubbles: 100, // default density 100
  minAbsChange: 0, // default 0% agar tampak ramai seperti CryptoBubbles
  mode: 'marketcap',
  popMode: false,
  
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

  setMaxBubbles: (n) => {
    set({ maxBubbles: n })
    get().filterData()
  },

  setMinAbsChange: (n) => {
    set({ minAbsChange: n })
    get().filterData()
  },

  setMode: (m) => {
    set({ mode: m })
    // Paksa timeframe 24h saat marketcap agar sesuai "Market Cap & Day"
    if (m === 'marketcap') set({ timeframe: '24h' })
    get().fetchCryptoData()
  },

  setPopMode: (v) => set({ popMode: v }),


  setSelectedCrypto: (crypto) => {
    set({ selectedCrypto: crypto })
  },

  fetchCryptoData: async () => {
    set({ isLoading: true, error: null })
    try {
      // Ambil data: jika memilih kategori (CoinGecko), gunakan data kategori
      const state = get()
      const data = await getCryptoMarketData(1000)
      
      // FILTER OUT STABLECOINS DAN FIAT - HANYA CRYPTO ASLI (kecuali pada mode marketcap)
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
        if (state.mode === 'marketcap') return true
        // Exclude stable coins explicitly on Change mode
        const isStable = (coin as any).stable === true
        if (isStable) return false
        return !excludeList.some(excluded => symbol.includes(excluded) || id.includes(excluded))
      })

      let prioritized: CryptoData[] = []
      if (state.mode === 'marketcap') {
        prioritized = [...filteredData]
          .filter(c => Number.isFinite(c.market_cap_rank))
          .sort((a, b) => (a.market_cap_rank ?? 1e9) - (b.market_cap_rank ?? 1e9))
          .slice(0, 50) // Tampilkan hanya top 50 coin pada Market Cap & Day
      } else {
        // Prioritaskan TOP MOVERS + TOP BY RANK agar koin penting ikut
        const tf = state.timeframe
        const topMovers = [...filteredData]
          .sort((a, b) => Math.abs(getPriceChange(b, tf)) - Math.abs(getPriceChange(a, tf)))
          .slice(0, 180)
        const topByRank = [...filteredData]
          .filter(c => Number.isFinite(c.market_cap_rank))
          .sort((a, b) => (a.market_cap_rank ?? 1e9) - (b.market_cap_rank ?? 1e9))
          .slice(0, 100) // Pastikan TOP 100 SELALU MASUK
        const map = new Map<string, CryptoData>()
        for (const c of [...topByRank, ...topMovers]) map.set(c.id, c)
        const pippin = filteredData.find(c => c.id.toLowerCase() === 'pippin' || c.symbol.toLowerCase() === 'pippin')
        if (pippin) map.set(pippin.id, pippin)
        prioritized = Array.from(map.values())
      }
      
      // Simpan semua kandidat prioritas sebagai sumber
      set({ cryptoData: prioritized, isLoading: false })
      get().filterData()
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false 
      })
    }
  },

  filterData: () => {
    const { cryptoData, searchQuery, maxBubbles, minAbsChange, timeframe, mode } = get()

    // 1) Search
    const query = searchQuery.trim().toLowerCase()
    let list = cryptoData.filter((c) => {
      if (!query) return true
      return c.name.toLowerCase().includes(query) || c.symbol.toLowerCase().includes(query)
    })

    // 2) Min absolute % change filter (Change mode):
    // - Jika tidak ada query pencarian, sembunyikan coin dengan |change| < 1%
    // - Jika ada query, tampilkan semuanya sesuai hasil pencarian (override)
    if (mode !== 'marketcap') {
      const baseThreshold = query ? 0 : 1
      const threshold = Math.max(baseThreshold, minAbsChange || 0)
      if (threshold > 0) {
        list = list.filter((c) => Math.abs(getPriceChange(c, timeframe)) >= threshold)
      }
    }

    // 3) Limit by maxBubbles to keep UI tidy
    list = list.slice(0, Math.max(10, Math.min(600, maxBubbles)))

    // 3b) Additional auto-trim for Change mode (tanpa search):
    //     supaya layar tidak terlalu penuh, ambil top 100 movers saja
    if (mode !== 'marketcap' && !query) {
      const tf = timeframe
      const TOP_N = 100
      list = [...list]
        .sort((a, b) => Math.abs(getPriceChange(b, tf)) - Math.abs(getPriceChange(a, tf)))
        .slice(0, TOP_N)
    }

    // Guard: bila hasil terlalu sedikit (mis-konfigurasi/filter), fallback ke top by rank
    if (list.length < Math.min(10, maxBubbles / 8)) {
      const fallback = [...cryptoData]
        .filter(c => Number.isFinite(c.market_cap_rank))
        .sort((a, b) => (a.market_cap_rank ?? 1e9) - (b.market_cap_rank ?? 1e9))
        .slice(0, Math.max(10, Math.min(600, maxBubbles)))
      list = fallback
    }

    set({ filteredData: list })
  },
}))
