import React, { useRef, useEffect } from 'react'

const colorScale = [
  "#99F1C6",
  "#1781D9",
  "#E12175",
  "#F69B2E",
  "#CBED8E",
  "#99F1C6"
]

interface Particle {
  x: number
  y: number
  radius: number
  color: string
  opacity: number
  vx: number
  vy: number
}

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const colorIndexRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const animate = () => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((particle, index) => {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.radius += 0.2
        particle.opacity *= 0.97 // Slower opacity decay for longer-lasting particles

        // Watercolor effect
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.radius
        )
        gradient.addColorStop(0, `${particle.color}${Math.floor(particle.opacity * 255).toString(16).padStart(2, '0')}`)
        gradient.addColorStop(1, `${particle.color}00`)

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        if (particle.opacity < 0.01) {
          particlesRef.current.splice(index, 1)
        }
      })

      requestAnimationFrame(animate)
    }

    animate()

    const interpolateColor = (color1: string, color2: string, factor: number) => {
      const r1 = parseInt(color1.slice(1, 3), 16)
      const g1 = parseInt(color1.slice(3, 5), 16)
      const b1 = parseInt(color1.slice(5, 7), 16)
      const r2 = parseInt(color2.slice(1, 3), 16)
      const g2 = parseInt(color2.slice(3, 5), 16)
      const b2 = parseInt(color2.slice(5, 7), 16)
      const r = Math.round(r1 + factor * (r2 - r1))
      const g = Math.round(g1 + factor * (g2 - g1))
      const b = Math.round(b1 + factor * (b2 - b1))
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    }

    const getGradualColor = () => {
      const index = Math.floor(colorIndexRef.current)
      const nextIndex = (index + 1) % colorScale.length
      const factor = colorIndexRef.current - index
      return interpolateColor(colorScale[index], colorScale[nextIndex], factor)
    }

    const createParticle = (x: number, y: number) => {
      colorIndexRef.current += 0.01 // Much slower color change
      if (colorIndexRef.current >= colorScale.length) colorIndexRef.current = 0

      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 0.3 + 0.1

      const newParticle: Particle = {
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        radius: 5 + Math.random() * 10,
        color: getGradualColor(),
        opacity: 0.6 + Math.random() * 0.2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed
      }

      particlesRef.current.push(newParticle)
    }

    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event
      for (let i = 0; i < 2; i++) {
        createParticle(clientX, clientY)
      }
    }

    canvas.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      canvas.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-screen"
      style={{ background: 'white' }}
    />
  )
}

export default App