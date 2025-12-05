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
  const { filteredData, timeframe } = useCryptoStore()
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const simulationRef = useRef<d3.Simulation<BubbleNode, undefined> | null>(null)
  const nodesRef = useRef<BubbleNode[]>([])
  const draggedNodeRef = useRef<BubbleNode | null>(null)
  const imagesRef = useRef<Map<string, HTMLImageElement>>(new Map())
  const hoveredNodeRef = useRef<BubbleNode | null>(null)
  const rafRef = useRef<number>()

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
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
    canvas.style.width = `${dimensions.width}px`
    canvas.style.height = `${dimensions.height}px`

    // Preload images via proxy
    filteredData.forEach(crypto => {
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

    // Calculate all percentages first
    const dataWithPercentages = filteredData.map(crypto => ({
      crypto,
      percentage: getPriceChange(crypto, timeframe)
    }))

    // Get max absolute percentage for scaling
    const maxAbsPercentage = Math.max(...dataWithPercentages.map(d => Math.abs(d.percentage)))
    
    // Responsive radius - KECILIN biar rapih dan tidak overlap
    const isMobile = dimensions.width < 640
    const isTablet = dimensions.width >= 640 && dimensions.width < 1024
    
    let baseMinRadius, baseMaxRadius
    if (isMobile) {
      baseMinRadius = 30
      baseMaxRadius = 70
    } else if (isTablet) {
      baseMinRadius = 35
      baseMaxRadius = 85
    } else {
      baseMinRadius = 40
      baseMaxRadius = 100
    }
    
    // Radius based on percentage change - bigger change = bigger bubble
    const radiusScale = d3.scaleSqrt()
      .domain([0, maxAbsPercentage])
      .range([baseMinRadius, baseMaxRadius])

    const nodes: BubbleNode[] = dataWithPercentages.map((item, i) => {
      const percentage = item.percentage
      const radius = radiusScale(Math.abs(percentage))
      
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

    nodesRef.current = nodes

    // MAXIMUM spacing prevention - PAKSA tidak overlap
    const collisionPadding = isMobile ? 8 : (isTablet ? 10 : 12)
    
    const simulation = d3.forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(isMobile ? -50 : -60))
      .force('collision', d3.forceCollide<BubbleNode>()
        .radius(d => d.radius + collisionPadding)
        .strength(1.0)
        .iterations(25)
      )
      // TIDAK pakai center force - biar spread naturally
      .alphaDecay(0.0005)
      .velocityDecay(0.95)
      .alpha(1)
      .alphaTarget(0)

    simulationRef.current = simulation

    const drawBubble = (node: BubbleNode, isHovered: boolean) => {
      const x = node.x! * dpr
      const y = node.y! * dpr
      const r = node.radius * dpr

      ctx.shadowBlur = 0

      // Main bubble circle - solid color dengan opacity
      ctx.fillStyle = node.color + 'f5'
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()

      // Ring outline - TEBAL dan jelas seperti Banter Bubbles
      const ringColor = node.percentage >= 0 ? '#00ff00' : '#ff0000'
      ctx.strokeStyle = ringColor + 'dd'
      ctx.lineWidth = 2.5 * dpr
      ctx.beginPath()
      ctx.arc(x, y, r - 1 * dpr, 0, Math.PI * 2)
      ctx.stroke()

      // Glow effect untuk hovered
      if (isHovered) {
        ctx.strokeStyle = ringColor
        ctx.lineWidth = 4 * dpr
        ctx.shadowColor = ringColor
        ctx.shadowBlur = 12 * dpr
        ctx.beginPath()
        ctx.arc(x, y, r + 1 * dpr, 0, Math.PI * 2)
        ctx.stroke()
        ctx.shadowBlur = 0
      }

      // Logo - lebih kecil dan proporsional
      const img = imagesRef.current.get(node.crypto.id)
      if (img && img.complete) {
        try {
          ctx.save()
          const logoSize = r * 0.3
          ctx.beginPath()
          ctx.arc(x, y - r * 0.1, logoSize, 0, Math.PI * 2)
          ctx.clip()
          ctx.drawImage(
            img,
            x - logoSize,
            y - r * 0.1 - logoSize,
            logoSize * 2,
            logoSize * 2
          )
          ctx.restore()
        } catch (e) {}
      }

      // Symbol - ukuran font responsive
      ctx.fillStyle = '#ffffff'
      const symbolSize = Math.max(8, r * 0.22)
      ctx.font = `bold ${symbolSize}px -apple-system, BlinkMacSystemFont, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.shadowColor = 'rgba(0,0,0,0.6)'
      ctx.shadowBlur = 3 * dpr
      ctx.fillText(node.symbol, x, y + r * 0.35)

      // Percentage - ukuran font responsive
      const percentSize = Math.max(7, r * 0.16)
      ctx.font = `600 ${percentSize}px -apple-system, BlinkMacSystemFont, sans-serif`
      const sign = node.percentage >= 0 ? '+' : ''
      ctx.fillText(`${sign}${node.percentage.toFixed(1)}%`, x, y + r * 0.6)
      ctx.shadowBlur = 0
    }

    const render = () => {
      // Clear with solid black background
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const hoveredNode = hoveredNodeRef.current

      // Draw all bubbles
      nodesRef.current.forEach(node => {
        if (node.x !== undefined && node.y !== undefined) {
          drawBubble(node, node === hoveredNode)
        }
      })

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
  }, [dimensions, filteredData, timeframe])

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
        draggedNodeRef.current = node
        if (simulationRef.current) {
          simulationRef.current.alphaTarget(0.3).restart()
          node.fx = node.x
          node.fy = node.y
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

  return (
    <div ref={containerRef} className="w-full h-full relative bg-black">
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
