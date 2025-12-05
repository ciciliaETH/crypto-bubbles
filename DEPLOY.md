# Deploy ke Vercel

## ✅ Persiapan Sudah Selesai

Project sudah siap deploy ke Vercel! Semua issue sudah diperbaiki:

- ✅ Build berhasil tanpa error
- ✅ TypeScript validation passed
- ✅ ESLint configured
- ✅ Dependencies optimized (removed unused Three.js libs)
- ✅ Image proxy configured
- ✅ Vercel config added

## 🚀 Cara Deploy

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push code ke GitHub**
   ```powershell
   git init
   git add .
   git commit -m "Ready for Vercel deployment"
   git branch -M main
   git remote add origin https://github.com/USERNAME/bumble-crypto.git
   git push -u origin main
   ```

2. **Import ke Vercel**
   - Buka https://vercel.com/new
   - Login dengan GitHub
   - Import repository `bumble-crypto`
   - Framework Preset: **Next.js** (auto-detected)
   - Click **Deploy**

### Option 2: Deploy via Vercel CLI

```powershell
# Install Vercel CLI (jika belum)
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

## 🔧 Environment Variables

Tidak ada environment variables yang diperlukan untuk basic deployment.

Optional (untuk rate limit lebih tinggi):
- `NEXT_PUBLIC_COINGECKO_API_KEY` - CoinGecko API key (opsional)

## 📊 Build Information

- **Build Size**: ~164 KB (First Load JS)
- **Static Pages**: 5 pages
- **API Routes**: 1 route (proxy-image)
- **Build Time**: ~30-60 seconds

## ⚡ After Deployment

Setelah deploy sukses, aplikasi akan:
- ✅ Automatically optimize images
- ✅ Enable edge caching (60s for API routes)
- ✅ Deploy to global CDN
- ✅ Get SSL certificate (HTTPS)
- ✅ Auto-preview for pull requests

## 🐛 Troubleshooting

Jika ada error saat deploy:

1. **Build Error**: Check build logs di Vercel dashboard
2. **API Error**: Pastikan CoinGecko API accessible
3. **Image Error**: Proxy route sudah configured correctly

## 📝 Post-Deployment

- Custom domain: Settings → Domains
- Analytics: Settings → Analytics
- Environment vars: Settings → Environment Variables

---

**Ready to deploy! 🚀**
