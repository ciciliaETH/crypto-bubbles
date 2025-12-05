# Bumble Crypto 🚀

Advanced cryptocurrency market visualization with beautiful bubble charts. Track real-time prices, market cap, and performance of 100+ cryptocurrencies.

![Bumble Crypto](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-cyan)
![D3.js](https://img.shields.io/badge/D3.js-7.8-orange)

## ✨ Features

### 🎨 Modern UI/UX
- **Glassmorphism Design** - Beautiful frosted glass effects
- **Smooth Animations** - Powered by Framer Motion
- **Responsive Layout** - Works perfectly on all devices
- **Dark Theme** - Easy on the eyes with gradient backgrounds

### 📊 Visualization
- **Interactive Bubble Chart** - Size = Market Cap, Color = Performance
- **Real-time D3.js Rendering** - Smooth physics-based animations
- **Smart Color Coding** - Instant visual feedback (green = gains, red = losses)
- **Hover Tooltips** - Quick info without clicking

### 🔧 Functionality
- **Multiple Timeframes** - Hour, Day, Week, Month, Year
- **Live Search** - Find any cryptocurrency instantly
- **Detailed Modal** - Complete stats on click
- **Auto-refresh** - Updates every 60 seconds
- **100+ Cryptocurrencies** - All major coins and tokens

### 📈 Data Features
- Current price & market cap
- Price changes across all timeframes
- 24h high/low prices
- Trading volume
- Circulating supply
- Market cap ranking

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- npm, yarn, or pnpm

### Installation

1. **Install dependencies:**
```powershell
npm install
# or
yarn install
# or
pnpm install
```

2. **Run development server:**
```powershell
npm run dev
# or
yarn dev
# or
pnpm dev
```

3. **Open browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **D3.js** - Data visualization & force simulation

### State Management
- **Zustand** - Lightweight state management

### Data Source
- **CoinGecko API** - Free cryptocurrency data
  - 10-50 calls/minute
  - No API key required for basic usage
  - Real-time price data

### Icons
- **Lucide React** - Beautiful, consistent icons

## 📁 Project Structure

```
bumble-crypto/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/
│   ├── Header.tsx          # Top header with logo
│   ├── Controls.tsx        # Search & timeframe controls
│   ├── BubbleChart.tsx     # Main D3 visualization
│   ├── CryptoDetailModal.tsx # Detail popup
│   └── LoadingScreen.tsx   # Loading animation
├── lib/
│   ├── api.ts              # CoinGecko API integration
│   └── utils.ts            # Utility functions
├── store/
│   └── cryptoStore.ts      # Zustand state management
├── public/                 # Static assets
└── package.json
```

## 🎨 Design Highlights

### Color Palette
- **Background:** Deep space blue (#0a0e27)
- **Primary:** Bright blue (#3b82f6)
- **Secondary:** Purple (#8b5cf6)
- **Accent:** Cyan (#06b6d4)
- **Positive:** Green (#10b981)
- **Negative:** Red (#ef4444)

### Special Effects
- ✨ Gradient mesh backgrounds
- ✨ Glassmorphism cards
- ✨ Glow animations
- ✨ Smooth transitions
- ✨ Physics-based bubble movements

## 🔥 Key Improvements vs Original CryptoBubbles

### Better UI
✅ Modern glassmorphism design  
✅ Smoother animations  
✅ Better color gradients  
✅ Cleaner typography  
✅ Enhanced visual hierarchy  

### Enhanced UX
✅ Instant search feedback  
✅ Better hover tooltips  
✅ Detailed modal with complete stats  
✅ Responsive on all devices  
✅ Loading states  

### Performance
✅ Optimized D3 rendering  
✅ Smart re-renders  
✅ Efficient state management  
✅ Lazy loading ready  

## 📊 API Usage

### CoinGecko Free Tier
- **Rate Limit:** 10-50 calls/minute
- **Endpoint:** `/coins/markets`
- **Data Included:**
  - Current prices
  - Market cap
  - Volume
  - Price changes (1h, 24h, 7d, 30d, 1y)
  - High/Low 24h
  - Circulating supply

### Rate Limit Handling
The app auto-refreshes every 60 seconds to stay within limits.

## 🛠️ Customization

### Change Number of Coins
Edit `lib/api.ts`:
```typescript
await getCryptoMarketData(200) // Show top 200 instead of 100
```

### Change Refresh Interval
Edit `app/page.tsx`:
```typescript
setInterval(() => {
  fetchCryptoData()
}, 30000) // Refresh every 30 seconds instead of 60
```

### Change Color Scheme
Edit `tailwind.config.ts`:
```typescript
colors: {
  background: '#your-color',
  primary: '#your-color',
  // etc...
}
```

## 🚀 Deployment

### Vercel (Recommended)
```powershell
npm run build
# Deploy to Vercel
```

### Netlify
```powershell
npm run build
# Deploy to Netlify
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## 📝 Environment Variables

No API keys needed! CoinGecko free tier works out of the box.

For production or higher limits, get a CoinGecko API key:
```env
NEXT_PUBLIC_COINGECKO_API_KEY=your_api_key_here
```

## 🔍 Features Roadmap

### Planned Features
- [ ] Portfolio tracking
- [ ] Price alerts
- [ ] Historical charts
- [ ] Multiple currencies (EUR, GBP, etc.)
- [ ] Favorites/Watchlist
- [ ] Dark/Light theme toggle
- [ ] Export data
- [ ] Social sharing
- [ ] News integration
- [ ] Mobile app (React Native)

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📄 License

MIT License - feel free to use for personal or commercial projects!

## 🙏 Credits

- **Data:** [CoinGecko](https://www.coingecko.com/)
- **Design Inspiration:** [CryptoBubbles.net](https://cryptobubbles.net/)
- **Icons:** [Lucide](https://lucide.dev/)

## 📧 Support

Issues? Questions? Open an issue on GitHub!

---

**Built with ❤️ using Next.js, TypeScript, and D3.js**

**Data powered by CoinGecko API** 🦎
