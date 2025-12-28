'use client'

import { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'
import { useCryptoStore } from '@/store/cryptoStore'
import { getPriceChange, getColorForPercentage } from '@/lib/api'
import { CryptoData } from '@/lib/api'

interface BubbleNode extends d3.SimulationNodeDatum {
  id: string
  symbol: string
  name: string
  price: number
  marketCap: number
  percentage: number
  color: string
  radius: number
  crypto: CryptoData
  image: string
}

export default function BubbleChartOptimized() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { filteredData, timeframe, mode, popMode } = useCryptoStore() as any
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const simulationRef = useRef<d3.Simulation<BubbleNode, undefined> | null>(null)
  const nodesRef = useRef<BubbleNode[]>([])
  const draggedNodeRef = useRef<BubbleNode | null>(null)
  const imagesRef = useRef<Map<string, HTMLImageElement>>(new Map())
  // Global decorative assets (bull/bear/bubble overlay)
  const assetsRef = useRef<Map<string, HTMLImageElement>>(new Map())
  const hoveredNodeRef = useRef<BubbleNode | null>(null)
  const rafRef = useRef<number>()
  const poppedIdsRef = useRef<Set<string>>(new Set())
  type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string }
  const particlesRef = useRef<Particle[]>([])

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        // Hitung tinggi yang tersedia dari posisi container hingga bawah viewport
        const rect = containerRef.current.getBoundingClientRect()
        const availableHeight = Math.max(200, Math.floor(window.innerHeight - rect.top))
        containerRef.current.style.height = `${availableHeight}px`
        setDimensions({
          width: containerRef.current.clientWidth,
          height: availableHeight,
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0 || filteredData.length === 0) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = dimensions.width * dpr
    canvas.height = dimensions.height * dpr
    // Use string concatenation (no template literal, no global String())
    canvas.style.width = dimensions.width + 'px';
    canvas.style.height = dimensions.height + 'px';

    // Preload crypto images via proxy
    (filteredData as CryptoData[]).forEach((crypto: CryptoData) => {
      if (!imagesRef.current.has(crypto.id)) {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onerror = () => {
          imagesRef.current.delete(crypto.id)
        }
        img.src = `/api/proxy-image?url=${encodeURIComponent(crypto.image)}`
        imagesRef.current.set(crypto.id, img)
      }
    })

    // Preload decorative assets once
    const ensureAsset = (key: string, src: string) => {
      if (!assetsRef.current.has(key)) {
        const img = new Image()
        img.onload = () => {}
        img.onerror = () => {}
        img.src = src
        assetsRef.current.set(key, img)
      }
    }
    ensureAsset('bull', '/images/bull.png')
    ensureAsset('bear', '/images/bear.png')
    ensureAsset('bubble', '/images/bubble.png')

    // Calculate all percentages first (exclude popped)
    const activeList = (filteredData as CryptoData[]).filter((c: CryptoData) => !poppedIdsRef.current.has(c.id))
    const dataWithPercentages = activeList.map((crypto: CryptoData) => ({
      crypto,
      percentage: getPriceChange(crypto, timeframe)
    }))

    // Get max absolute percentage and market cap for scaling
    const maxAbsPercentage = Math.max(...dataWithPercentages.map(d => Math.abs(d.percentage)))
    const caps = (activeList as CryptoData[]).map((d: CryptoData) => d.market_cap).filter(v => typeof v === 'number' && v > 0)
    const maxCap = d3.max(caps) || 1
    const minCap = d3.min(caps) || 1
    
    // Responsive radius - sedikit lebih besar saat jumlah bubble sedikit
    const isMobile = dimensions.width < 640
    const isTablet = dimensions.width >= 640 && dimensions.width < 1024
    const count = activeList.length
    
    let baseMinRadius, baseMaxRadius
    if (isMobile) {
      baseMinRadius = count <= 80 ? 38 : 30
      baseMaxRadius = count <= 80 ? 92 : 70
    } else if (isTablet) {
      baseMinRadius = count <= 80 ? 44 : 35
      baseMaxRadius = count <= 80 ? 110 : 85
    } else {
      baseMinRadius = count <= 80 ? 50 : 40
      baseMaxRadius = count <= 80 ? 130 : 100
    }
    
    // Radius:
    // - mode === 'change': berdasarkan persen perubahan
    // - mode === 'marketcap': berdasarkan market cap (mirip CryptoBubbles)
    const diagonal = Math.min(dimensions.width, dimensions.height)
    // Batasi maksimum radius untuk mencegah bubble raksasa menutupi layar
    const maxFrac = mode === 'marketcap'
      ? (count > 140 ? 0.22 : count > 100 ? 0.26 : 0.30)
      : (count > 140 ? 0.16 : count > 100 ? 0.20 : 0.23)
    const capMaxRadius = Math.max(baseMaxRadius, diagonal * maxFrac)
    const radiusScaleChange = d3.scaleSqrt()
      .domain([0, maxAbsPercentage || 1])
      .range([baseMinRadius, baseMaxRadius])
    // Log-normalized market cap to avoid dominasi ekstrem dan mirip CryptoBubbles
    const logMin = Math.log(Math.max(1, minCap))
    const logMax = Math.log(Math.max(1, maxCap))
    const radiusScaleCap = (cap: number) => {
      const v = Math.log(Math.max(1, cap))
      const t = (v - logMin) / Math.max(1e-6, logMax - logMin)
      // Sedikit lebih menonjolkan market cap besar agar tampak lebih dominan
      const eased = Math.pow(Math.max(0, Math.min(1, t)), 1.15)
      const r = baseMinRadius + eased * (capMaxRadius - baseMinRadius)
      return Math.max(Math.max(6, baseMinRadius * 0.65), Math.min(r, capMaxRadius))
    }

    let nodes: BubbleNode[] = dataWithPercentages.map((item: { crypto: CryptoData; percentage: number }, i: number) => {
      const percentage = item.percentage
      const radius = mode === 'marketcap'
        ? radiusScaleCap(item.crypto.market_cap || minCap)
        : radiusScaleChange(Math.abs(percentage))
      
      // SPREAD KE SELURUH LAYAR - random position across entire viewport
      const margin = radius + 30
      const x = margin + Math.random() * (dimensions.width - margin * 2)
      const y = margin + Math.random() * (dimensions.height - margin * 2)
      
      return {
        id: item.crypto.id,
        symbol: item.crypto.symbol.toUpperCase(),
        name: item.crypto.name,
        price: item.crypto.current_price,
        marketCap: item.crypto.market_cap,
        percentage,
        color: getColorForPercentage(percentage),
        radius,
        crypto: item.crypto,
        image: item.crypto.image,
        x,
        y,
      }
    })

    // Global area-aware scaling to improve mobile packing
    // Aim for a target fill ratio of the screen to reduce overlap on small screens
    const screenArea = Math.max(1, dimensions.width * dimensions.height)
    const targetFill = mode === 'marketcap'
      ? (isMobile ? 0.30 : (isTablet ? 0.36 : 0.42))
      : (isMobile ? 0.30 : (isTablet ? 0.36 : 0.42))
    const totalArea = nodes.reduce((acc, n) => acc + Math.PI * n.radius * n.radius, 0)
    let scale = 1
    if (totalArea > screenArea * targetFill) {
      scale = Math.sqrt((screenArea * targetFill) / totalArea)
    }

    if (scale < 1) {
      const minClamp = Math.max(6, baseMinRadius * 0.65)
      nodes = nodes.map(n => ({
        ...n,
        radius: Math.max(minClamp, n.radius * scale)
      }))
    }

    // Hard cap for maximum radius so big coins don't dominate on mobile
    const baseShort = Math.min(dimensions.width, dimensions.height)
    const hardMax = mode === 'marketcap'
      ? (isMobile
        ? Math.min(120, baseShort * 0.22)
        : (isTablet
          ? Math.min(160, baseShort * 0.26)
          : Math.min(220, baseShort * 0.30)))
      : (isMobile
        ? Math.min(120, baseShort * 0.22)
        : (isTablet
          ? Math.min(160, baseShort * 0.26)
          : Math.min(220, baseShort * 0.30)))

    nodes.forEach(n => { n.radius = Math.min(n.radius, hardMax) })

    nodesRef.current = nodes

    // MAXIMUM spacing prevention - PAKSA tidak overlap
    const collisionPadding = mode === 'marketcap' ? (isMobile ? 6 : (isTablet ? 8 : 10)) : (isMobile ? 6 : (isTablet ? 8 : 10))
    
    const simulation = d3.forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(
        mode === 'marketcap'
          ? (isMobile ? -28 : (isTablet ? -34 : -32))
          : (isMobile ? -28 : (isTablet ? -34 : -32))
      ))
      .force('collision', d3.forceCollide<BubbleNode>()
        .radius(d => d.radius + collisionPadding)
        .strength(1.1)
        .iterations(80)
      )
      // Terapkan gaya pusat untuk semua mode agar packing rapat
      .force('center', d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force('x', d3.forceX(dimensions.width / 2).strength(0.05))
      .force('y', d3.forceY(dimensions.height / 2).strength(0.05))
      .alphaDecay(0.0003)
      .velocityDecay(0.90)
      .alpha(1)
      .alphaTarget(0)

    simulationRef.current = simulation

    const drawBubble = (node: BubbleNode, isHovered: boolean) => {
      const x = node.x! * dpr
      const y = node.y! * dpr
      const r = node.radius * dpr
      const isZero = Math.abs(node.percentage) < 0.0001
      const ringColor = isZero ? '#9ca3af' : (node.percentage >= 0 ? '#00ff4d' : '#ff3333')
      const ringWidth = Math.max(3 * dpr, r * 0.12)

      // Draw base bubble
      const baseKey = node.percentage >= 0 ? 'bull' : 'bear'
      const baseImg = assetsRef.current.get(baseKey)
      const overlayImg = assetsRef.current.get('bubble')

      if (isZero) {
        // Neutral bubble for 0.0% change: soft gray donut style
        const core = ctx.createRadialGradient(x, y, r * 0.08, x, y, r)
        core.addColorStop(0, '#0a0a0a')
        core.addColorStop(0.6, '#1f2937') // gray-800
        core.addColorStop(1, '#6b7280')   // gray-500 outer ring
        ctx.fillStyle = core
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      } else if (baseImg && baseImg.complete) {
        ctx.save()
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.clip()
        ctx.drawImage(baseImg, x - r, y - r, r * 2, r * 2)
        ctx.restore()
      } else {
        // Fallback gradient if asset not yet loaded
        const grad = ctx.createRadialGradient(x, y, r * 0.1, x, y, r)
        grad.addColorStop(0, '#000')
        grad.addColorStop(1, node.percentage >= 0 ? '#0f0' : '#f00')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      }

      // Bubble glossy overlay effect
      if (overlayImg && overlayImg.complete) {
        ctx.save()
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.clip()
        ctx.globalAlpha = 0.45
        ctx.globalCompositeOperation = 'lighter'
        ctx.drawImage(overlayImg, x - r, y - r, r * 2, r * 2)
        ctx.globalAlpha = 1
        ctx.globalCompositeOperation = 'source-over'
        ctx.restore()
      }

      // Logo badge at top area (coin logo)
      const img = imagesRef.current.get(node.crypto.id)
      const logoR = r * 0.18
      const logoCx = x - r * 0.42
      const logoCy = y - r * 0.45
      if (img && img.complete) {
        try {
          ctx.save()
          // Soft glassy badge background
          const badgeGrad = ctx.createRadialGradient(logoCx, logoCy, 0, logoCx, logoCy, logoR * 1.4)
          badgeGrad.addColorStop(0, 'rgba(255,255,255,0.18)')
          badgeGrad.addColorStop(1, 'rgba(255,255,255,0.05)')
          ctx.fillStyle = badgeGrad
          ctx.beginPath()
          ctx.arc(logoCx, logoCy, logoR * 1.15, 0, Math.PI * 2)
          ctx.fill()

          // Logo circle
          ctx.beginPath()
          ctx.arc(logoCx, logoCy, logoR, 0, Math.PI * 2)
          ctx.clip()
          ctx.drawImage(img, logoCx - logoR, logoCy - logoR, logoR * 2, logoR * 2)
          ctx.restore()
        } catch {}
      }

      // Text: symbol centered, percentage below
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#ffffff'
      ctx.shadowColor = 'rgba(0,0,0,0.65)'
      ctx.shadowBlur = 4 * dpr

      const symbolSize = Math.max(10, r * 0.35)
      ctx.font = `bold ${symbolSize}px Inter, -apple-system, Segoe UI, Roboto, sans-serif`
      ctx.fillText(node.symbol, x, y - r * 0.02)

      const percentSize = Math.max(8, r * 0.22)
      ctx.font = `800 ${percentSize}px Inter, -apple-system, Segoe UI, Roboto, sans-serif`
      const sign = node.percentage >= 0 ? '+' : ''
      ctx.fillText(`${sign}${node.percentage.toFixed(1)}%`, x, y + r * 0.30)
      ctx.shadowBlur = 0

      // Hover emphasis ring
      if (isHovered) {
        ctx.save()
        ctx.strokeStyle = ringColor
        ctx.lineWidth = Math.max(5 * dpr, r * 0.16)
        ctx.shadowColor = ringColor
        ctx.shadowBlur = 22 * dpr
        ctx.beginPath()
        ctx.arc(x, y, r - ringWidth * 0.35, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()
      }
    }

    const render = () => {
      // Clear with solid black background
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const hoveredNode = hoveredNodeRef.current

      // Draw bubbles: yang lebih kecil di atas agar tidak tertutup oleh yang besar
      const ordered = [...nodesRef.current].sort((a,b) => a.radius - b.radius)
      ordered.forEach(node => {
        if (node.x !== undefined && node.y !== undefined) {
          drawBubble(node, node === hoveredNode)
        }
      })

      // particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i]
        p.x += p.vx
        p.y += p.vy
        p.life += 1
        const alpha = Math.max(0, 1 - p.life / p.max)
        ctx.fillStyle = p.color
        ctx.globalAlpha = alpha
        ctx.beginPath()
        ctx.arc(p.x * dpr, p.y * dpr, Math.max(1, 3 * dpr * alpha), 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
        if (p.life >= p.max) particlesRef.current.splice(i, 1)
      }

      rafRef.current = requestAnimationFrame(render)
    }

    simulation.on('tick', () => {
      nodesRef.current.forEach(node => {
        if (node.x !== undefined && node.y !== undefined) {
          // STRICT boundary - prevent edge overlap
          const padding = 20
          const minX = node.radius + padding
          const maxX = dimensions.width - node.radius - padding
          const minY = node.radius + padding
          const maxY = dimensions.height - node.radius - padding
          
          // Force within bounds
          if (node.x < minX) node.x = minX
          if (node.x > maxX) node.x = maxX
          if (node.y < minY) node.y = minY
          if (node.y > maxY) node.y = maxY
        }
      })
    })

    render()

    return () => {
      simulation.stop()
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [dimensions, filteredData, timeframe, mode])

  const updateTooltip = (node: BubbleNode | null, x: number, y: number) => {
    const tooltip = tooltipRef.current
    if (!tooltip) return

    if (node) {
      tooltip.style.display = 'block'
      tooltip.style.left = x + 15 + 'px'
      tooltip.style.top = y + 15 + 'px'
      
      tooltip.innerHTML = `
        <div class="font-bold text-sm mb-1">${node.name}</div>
        <div class="text-xs text-gray-300">$${node.price.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: node.price < 1 ? 6 : 2
        })}</div>
        <div class="text-xs ${node.percentage >= 0 ? 'text-green-400' : 'text-red-400'}">
          ${node.percentage >= 0 ? '+' : ''}${node.percentage.toFixed(2)}%
        </div>
        <div class="text-xs text-gray-400 mt-1">
          Cap: $${(node.marketCap / 1e9).toFixed(2)}B
        </div>
      `
    } else {
      tooltip.style.display = 'none'
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    for (const node of nodesRef.current) {
      if (node.x === undefined || node.y === undefined) continue
      
      const dx = x - node.x
      const dy = y - node.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < node.radius) {
        if (popMode) {
          poppedIdsRef.current.add(node.id)
          spawnParticles(node)
          // remove from nodes and update simulation
          nodesRef.current = nodesRef.current.filter(n => n !== node)
          if (simulationRef.current) {
            simulationRef.current.nodes(nodesRef.current as any)
            simulationRef.current.alpha(0.6).restart()
          }
        } else {
          draggedNodeRef.current = node
          if (simulationRef.current) {
            simulationRef.current.alphaTarget(0.3).restart()
            node.fx = node.x
            node.fy = node.y
          }
        }
        break
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Handle drag
    if (draggedNodeRef.current) {
      const padding = 10
      draggedNodeRef.current.fx = Math.max(
        draggedNodeRef.current.radius + padding,
        Math.min(dimensions.width - draggedNodeRef.current.radius - padding, x)
      )
      draggedNodeRef.current.fy = Math.max(
        draggedNodeRef.current.radius + padding,
        Math.min(dimensions.height - draggedNodeRef.current.radius - padding, y)
      )
      return
    }

    // Check hover - langsung tanpa debounce
    let foundNode: BubbleNode | null = null
    for (const node of nodesRef.current) {
      if (node.x === undefined || node.y === undefined) continue
      
      const dx = x - node.x
      const dy = y - node.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < node.radius) {
        foundNode = node
        break
      }
    }

    // Update hanya jika berubah
    if (foundNode !== hoveredNodeRef.current) {
      hoveredNodeRef.current = foundNode
      updateTooltip(foundNode, e.clientX, e.clientY)
    }
  }

  const handleMouseUp = () => {
    if (draggedNodeRef.current) {
      draggedNodeRef.current.fx = null
      draggedNodeRef.current.fy = null
      draggedNodeRef.current = null
      if (simulationRef.current) {
        simulationRef.current.alphaTarget(0)
      }
    }
  }

  const handleMouseLeave = () => {
    handleMouseUp()
    hoveredNodeRef.current = null
    updateTooltip(null, 0, 0)
  }

  const spawnParticles = (node: BubbleNode) => {
    const count = 26
    const color = node.percentage >= 0 ? 'rgba(0,255,77,0.9)' : 'rgba(255,51,51,0.9)'
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 1 + Math.random() * 3
      particlesRef.current.push({
        x: node.x || 0,
        y: node.y || 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        max: 35 + Math.random() * 25,
        color,
      })
    }
  }

  return (
    <div ref={containerRef} className="w-full relative bg-black overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
      
      <div
        ref={tooltipRef}
        className="fixed pointer-events-none bg-black/90 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 text-white z-50"
        style={{ display: 'none' }}
      />
    </div>
  )
}
