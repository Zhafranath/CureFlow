'use client'

import { useState, useEffect } from 'react'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type TimePickerModalProps = {
  open: boolean
  initialTime?: string
  title?: string
  onConfirm: (time: string) => void
  onClose: () => void
}

export function TimePickerModal({
  open,
  initialTime = '12:00',
  title = 'Tetapkan jam',
  onConfirm,
  onClose,
}: TimePickerModalProps) {
  const [mode, setMode] = useState<'hour' | 'minute'>('hour')
  const [hour, setHour] = useState(12)
  const [minute, setMinute] = useState(0)

  useEffect(() => {
    if (open) {
      setMode('hour')
      if (initialTime && initialTime.includes(':')) {
        const [h, m] = initialTime.split(':').map((v) => parseInt(v, 10))
        setHour(isNaN(h) ? 12 : h)
        setMinute(isNaN(m) ? 0 : m)
      }
    }
  }, [open, initialTime])

  if (!open) return null

  // Clock dial math
  const CX = 136 // center x in px for 272px container
  const CY = 136 // center y in px
  const R_OUTER = 96
  const R_INNER = 60

  // Outer hours (1 to 12)
  const outerHours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  // Inner hours (13 to 23, 00)
  const innerHours = [0, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
  // Minutes in steps of 5
  const minutesList = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]

  // Calculate hand pointer target coordinates
  let handX = CX
  let handY = CY - R_OUTER

  if (mode === 'hour') {
    const isInner = hour === 0 || (hour >= 13 && hour <= 23)
    const r = isInner ? R_INNER : R_OUTER
    const hPos = hour === 0 ? 12 : hour % 12
    const angleRad = ((hPos * 30 - 90) * Math.PI) / 180
    handX = CX + r * Math.cos(angleRad)
    handY = CY + r * Math.sin(angleRad)
  } else {
    const angleRad = ((minute * 6 - 90) * Math.PI) / 180
    handX = CX + R_OUTER * Math.cos(angleRad)
    handY = CY + R_OUTER * Math.sin(angleRad)
  }

  const handleConfirm = () => {
    const hStr = String(hour).padStart(2, '0')
    const mStr = String(minute).padStart(2, '0')
    onConfirm(`${hStr}:${mStr}`)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xs sm:max-w-sm rounded-3xl border border-border/80 bg-card p-6 text-card-foreground shadow-2xl space-y-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            aria-label="Batal"
            className="grid h-9 w-9 place-items-center rounded-full bg-secondary border border-border/60 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
          <h3 className="font-heading text-lg font-bold text-foreground">
            {title}
          </h3>
          <button
            type="button"
            onClick={handleConfirm}
            aria-label="Konfirmasi"
            className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground font-bold shadow-md hover:opacity-95 transition-transform active:scale-95 cursor-pointer"
          >
            <Check size={18} />
          </button>
        </div>

        {/* Time Banner Display */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setMode('hour')}
            className={cn(
              'px-5 py-2 rounded-2xl text-4xl font-mono font-extrabold transition-all cursor-pointer',
              mode === 'hour'
                ? 'bg-primary text-primary-foreground shadow-md scale-105'
                : 'bg-secondary/60 text-muted-foreground border border-border/60 hover:border-primary/40'
            )}
          >
            {String(hour).padStart(2, '0')}
          </button>
          <span className="text-2xl font-black text-primary animate-pulse">•</span>
          <button
            type="button"
            onClick={() => setMode('minute')}
            className={cn(
              'px-5 py-2 rounded-2xl text-4xl font-mono font-extrabold transition-all cursor-pointer',
              mode === 'minute'
                ? 'bg-primary text-primary-foreground shadow-md scale-105'
                : 'bg-secondary/60 text-muted-foreground border border-border/60 hover:border-primary/40'
            )}
          >
            {String(minute).padStart(2, '0')}
          </button>
        </div>

        {/* Analog 24-Hour Clock Dial */}
        <div className="relative w-[272px] h-[272px] mx-auto rounded-full border border-border/70 bg-secondary/30 flex items-center justify-center select-none shadow-inner">
          {/* Center Point */}
          <div className="absolute h-3 w-3 rounded-full bg-primary z-20 shadow-xs" />

          {/* SVG Clock Hand Needle */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            <line
              x1={CX}
              y1={CY}
              x2={handX}
              y2={handY}
              className="stroke-primary"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx={handX} cy={handY} r="18" className="fill-primary" />
            <text
              x={handX}
              y={handY + 5}
              className="fill-primary-foreground"
              fontSize="13"
              fontWeight="800"
              textAnchor="middle"
            >
              {mode === 'hour'
                ? String(hour).padStart(2, '0')
                : String(minute).padStart(2, '0')}
            </text>
          </svg>

          {/* Clock Dial Items */}
          {mode === 'hour' ? (
            <>
              {/* Outer Ring Hours (1..12) */}
              {outerHours.map((hVal) => {
                const angleRad = (((hVal % 12 || 12) * 30 - 90) * Math.PI) / 180
                const x = CX + R_OUTER * Math.cos(angleRad)
                const y = CY + R_OUTER * Math.sin(angleRad)
                const isSelected = hour === hVal
                return (
                  <button
                    key={`outer-${hVal}`}
                    type="button"
                    onClick={() => {
                      setHour(hVal)
                      setMode('minute')
                    }}
                    style={{ left: `${x - 14}px`, top: `${y - 14}px` }}
                    className={cn(
                      'absolute h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-pointer z-20',
                      isSelected
                        ? 'opacity-0'
                        : 'text-foreground hover:text-primary hover:scale-125'
                    )}
                  >
                    {hVal}
                  </button>
                )
              })}

              {/* Inner Ring Hours (13..23, 00) */}
              {innerHours.map((hVal) => {
                const hPos = hVal === 0 ? 12 : hVal % 12
                const angleRad = ((hPos * 30 - 90) * Math.PI) / 180
                const x = CX + R_INNER * Math.cos(angleRad)
                const y = CY + R_INNER * Math.sin(angleRad)
                const isSelected = hour === hVal
                return (
                  <button
                    key={`inner-${hVal}`}
                    type="button"
                    onClick={() => {
                      setHour(hVal)
                      setMode('minute')
                    }}
                    style={{ left: `${x - 14}px`, top: `${y - 14}px` }}
                    className={cn(
                      'absolute h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all cursor-pointer z-20',
                      isSelected
                        ? 'opacity-0'
                        : 'text-muted-foreground hover:text-foreground hover:scale-125'
                    )}
                  >
                    {String(hVal).padStart(2, '0')}
                  </button>
                )
              })}
            </>
          ) : (
            /* Minutes Mode */
            minutesList.map((mVal) => {
              const angleRad = ((mVal * 6 - 90) * Math.PI) / 180
              const x = CX + R_OUTER * Math.cos(angleRad)
              const y = CY + R_OUTER * Math.sin(angleRad)
              const isSelected = minute === mVal
              return (
                <button
                  key={`min-${mVal}`}
                  type="button"
                  onClick={() => setMinute(mVal)}
                  style={{ left: `${x - 14}px`, top: `${y - 14}px` }}
                  className={cn(
                    'absolute h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-pointer z-20',
                    isSelected
                      ? 'opacity-0'
                      : 'text-foreground hover:text-primary hover:scale-125'
                  )}
                >
                  {String(mVal).padStart(2, '0')}
                </button>
              )
            })
          )}
        </div>

        {/* Dial Footer Subtext */}
        <p className="text-center text-xs text-muted-foreground font-medium">
          {mode === 'hour' ? 'Pilih jam (format 24 jam)' : 'Pilih menit'}
        </p>
      </div>
    </div>
  )
}
