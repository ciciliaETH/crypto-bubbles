import axios from 'axios'

const COINGECKO_API = 'https://api.coingecko.com/api/v3'
// Use internal API route to avoid CORS when running in the browser
const CRYPTOBUBBLES_URL = '/api/crypto-bubbles'

export interface CryptoData {
  id: string
  symbol: string
  name: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  stable?: boolean
  price_change_percentage_1h_in_currency?: number
  price_change_percentage_24h_in_currency?: number
  price_change_percentage_7d_in_currency?: number
  price_change_percentage_30d_in_currency?: number
  price_change_percentage_1y_in_currency?: number
  total_volume: number
  image: string
  high_24h: number
  low_24h: number
  circulating_supply: number
}

export type TimeFrame = '1h' | '24h' | '7d' | '30d' | '1y'

const timeFrameMap: Record<TimeFrame, string> = {
  '1h': 'price_change_percentage_1h_in_currency',
  '24h': 'price_change_percentage_24h_in_currency',
  '7d': 'price_change_percentage_7d_in_currency',
  '30d': 'price_change_percentage_30d_in_currency',
  '1y': 'price_change_percentage_1y_in_currency',
}

export async function getCryptoMarketData(
  limit: number = 100,
  currency: string = 'usd'
): Promise<CryptoData[]> {
  try {
    // 1) Try CryptoBubbles dataset first (includes more coins like PIPPIN)
    const bubbles = await axios.get(CRYPTOBUBBLES_URL, { timeout: 12000 })
    if (Array.isArray(bubbles.data)) {
      const BASE = 'https://cryptobubbles.net/backend/'
      const mapped: CryptoData[] = bubbles.data.slice(0, limit).map((item: any, idx: number) => {
        const perf = item.performance || {}
        const imgPath = typeof item.image === 'string' ? item.image.replace(/^\/*/, '') : ''
        const fullImg = imgPath.startsWith('http') ? imgPath : `${BASE}${imgPath}`
        return {
          id: item.slug || item.cg_id || String(item.id || idx),
          symbol: String(item.symbol || '').toUpperCase(),
          name: item.name || item.symbol || 'Unknown',
          current_price: Number(item.price ?? 0),
          market_cap: Number(item.marketcap ?? 0),
          market_cap_rank: Number(item.rank ?? idx + 1),
          stable: Boolean(item.stable),
          price_change_percentage_1h_in_currency: typeof perf.hour === 'number' ? perf.hour : 0,
          price_change_percentage_24h_in_currency: typeof perf.day === 'number' ? perf.day : 0,
          price_change_percentage_7d_in_currency: typeof perf.week === 'number' ? perf.week : 0,
          price_change_percentage_30d_in_currency: typeof perf.month === 'number' ? perf.month : 0,
          price_change_percentage_1y_in_currency: typeof perf.year === 'number' ? perf.year : 0,
          total_volume: Number(item.volume ?? 0),
          image: fullImg,
          // dataset tidak menyediakan high/low, isi dengan current price agar aman ditampilkan
          high_24h: Number(item.price ?? 0),
          low_24h: Number(item.price ?? 0),
          circulating_supply: Number(item.circulating_supply ?? 0),
        }
      })
      return mapped
    }
  } catch (error) {
    // Fallthrough to CoinGecko
  }

  // 2) Fallback: CoinGecko
  try {
    const response = await axios.get(`${COINGECKO_API}/coins/markets`, {
      params: {
        vs_currency: currency,
        order: 'market_cap_desc',
        per_page: limit,
        page: 1,
        sparkline: false,
        price_change_percentage: '1h,24h,7d,30d,1y',
      },
    })
    return response.data
  } catch (err) {
    console.error('Error fetching crypto data (fallback CoinGecko):', err)
    throw new Error('Failed to fetch cryptocurrency data')
  }
}

// Fetch coins for a specific CoinGecko category
// Category-specific API removed

export function getPriceChange(crypto: CryptoData, timeframe: TimeFrame): number {
  const field = timeFrameMap[timeframe] as keyof CryptoData
  const value = crypto[field]
  return typeof value === 'number' ? value : 0
}

export function formatCurrency(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`
  return `$${value.toFixed(2)}`
}

export function formatPercentage(value: number): string {
  const formatted = value.toFixed(2)
  return value > 0 ? `+${formatted}%` : `${formatted}%`
}

export function getColorForPercentage(percentage: number): string {
  // More vibrant colors with smooth gradients
  if (percentage >= 15) return '#10b981' // Bright emerald green
  if (percentage >= 10) return '#14b8a6' // Teal
  if (percentage >= 7) return '#22c55e' // Green
  if (percentage >= 5) return '#34d399' // Light green
  if (percentage >= 3) return '#4ade80' // Lighter green
  if (percentage >= 1) return '#6ee7b7' // Very light green
  if (percentage > 0) return '#86efac' // Pale green
  if (percentage === 0) return '#6b7280' // Gray
  if (percentage > -1) return '#fca5a5' // Pale red
  if (percentage > -3) return '#f87171' // Light red
  if (percentage > -5) return '#ef4444' // Red
  if (percentage > -7) return '#dc2626' // Darker red
  if (percentage > -10) return '#b91c1c' // Deep red
  return '#991b1b' // Very deep red
}
