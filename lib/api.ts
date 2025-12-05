import axios from 'axios'

const COINGECKO_API = 'https://api.coingecko.com/api/v3'

export interface CryptoData {
  id: string
  symbol: string
  name: string
  current_price: number
  market_cap: number
  market_cap_rank: number
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
  } catch (error) {
    console.error('Error fetching crypto data:', error)
    throw new Error('Failed to fetch cryptocurrency data')
  }
}

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
