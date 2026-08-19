'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { cn } from '@/lib/utils'

export function Brand({
  className,
  size = 'md',
}: {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const iconWrapperRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLDivElement>(null)

  const dims =
    size === 'lg'
      ? 'h-14 w-14'
      : size === 'sm'
        ? 'h-8 w-8'
        : 'h-11 w-11'
        
  const textClass =
    size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-base' : 'text-xl tracking-tight font-black font-space-grotesk'

  useEffect(() => {
    // Initial entrance animation for the icon
    const ctx = gsap.context(() => {
      gsap.from(iconRef.current, {
        scale: 0,
        rotation: -180,
        duration: 0.9,
        ease: 'back.out(1.8)',
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  // Magnetic cursor interaction for the icon
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!iconWrapperRef.current) return
    const rect = iconWrapperRef.current.getBoundingClientRect()
    const iconX = rect.left + rect.width / 2
    const iconY = rect.top + rect.height / 2
    
    const dist = Math.hypot(e.clientX - iconX, e.clientY - iconY)
    
    if (dist < 100) {
      const pullX = (e.clientX - iconX) * 0.25
      const pullY = (e.clientY - iconY) * 0.25
      
      gsap.to(iconRef.current, {
        x: pullX,
        y: pullY,
        rotation: pullX * 1.5,
        scale: 1.12,
        duration: 0.3,
        ease: 'power2.out',
      })
    } else {
      handleMouseLeave()
    }
  }

  const handleMouseLeave = () => {
    gsap.to(iconRef.current, {
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      duration: 0.5,
      ease: 'elastic.out(1.2, 0.4)',
    })
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn('flex items-center gap-3 cursor-pointer select-none', className)}
    >
      {/* Premium Glassmorphic Logo Icon container */}
      <div 
        ref={iconWrapperRef}
        className={cn('relative grid place-items-center overflow-visible', dims)}
      >
        <div
          ref={iconRef}
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-600 p-[1.5px] shadow-[0_0_20px_rgba(34,211,238,0.25)] backdrop-blur-lg transition-shadow duration-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.45)]"
        >
          <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#071322]/90 relative overflow-hidden">
            {/* Shimmer backdrop */}
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-transparent to-indigo-500/10 opacity-60" />
            
            <svg
              width="55%"
              height="55%"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="relative z-10 filter drop-shadow-[0_3px_6px_rgba(34,211,238,0.4)]"
            >
              {/* Premium 3D Overlapping Leaves Cross */}
              {/* Vertical pill */}
              <rect x="9.5" y="2" width="5" height="20" rx="2.5" fill="url(#cross-grad)" />
              {/* Horizontal pill */}
              <rect x="2" y="9.5" width="20" height="5" rx="2.5" fill="url(#cross-grad)" />
              {/* Leaf cutout inside cross */}
              <path
                d="M12 5C15.5 8.5, 15.5 15.5, 12 19C8.5 15.5, 8.5 8.5, 12 5Z"
                fill="#050d18"
              />
              <path
                d="M12 7C14 9, 14 13, 12 15C10 13, 10 9, 12 7Z"
                fill="url(#cross-grad)"
                opacity="0.9"
              />
              <defs>
                <linearGradient id="cross-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#22d3ee" />
                  <stop offset="0.5" stopColor="#0ea5e9" />
                  <stop offset="100" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* Static Premium Brand Name (No up/down animations or shiny sweeps) */}
      <span
        className={cn(
          'font-heading font-black select-none text-white flex items-center tracking-tight',
          textClass
        )}
      >
        Cure
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 font-extrabold drop-shadow-[0_2px_12px_rgba(34,211,238,0.35)] ml-[1px]">
          Flow
        </span>
      </span>
    </div>
  )
}
