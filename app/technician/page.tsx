'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { motion } from 'framer-motion'
import {
  Activity,
  AlertTriangle,
  Camera,
  Check,
  Clock,
  Copy,
  Cpu,
  Gauge,
  Lightbulb,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sliders,
  Sparkles,
  Terminal,
  Upload,
  Utensils,
  Waves,
  X,
} from 'lucide-react'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { DashboardShell, type TabDef } from '@/components/dashboard-shell'
import { RoleGuard } from '@/components/role-guard'
import { TimePickerModal } from '@/components/time-picker-modal'
import { useApp } from '@/lib/store'
import { cn } from '@/lib/utils'

type SensorSpec = {
  key: 'turbidity' | 'feedLevel' | 'waterLevel'
  label: string
  icon: typeof Gauge
  value: number
  unit: string
  pct: number
  warn: boolean
  warnDir: string
}

function Ring({ pct, warn }: { pct: number; warn: boolean }) {
  const r = 46
  const c = 2 * Math.PI * r
  const offset = c - (Math.min(100, Math.max(0, pct)) / 100) * c
  return (
    <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
      <circle
        cx="60"
        cy="60"
        r={r}
        fill="none"
        strokeWidth="9"
        className="stroke-white/[0.04]"
      />
      <motion.circle
        cx="60"
        cy="60"
        r={r}
        fill="none"
        strokeWidth="9"
        strokeLinecap="round"
        className={warn ? 'stroke-amber-500' : 'stroke-emerald-400'}
        strokeDasharray={c}
        animate={{ strokeDashoffset: offset }}
        transition={{ type: 'spring', stiffness: 90, damping: 18 }}
        style={{
          filter: warn
            ? 'drop-shadow(0 0 6px rgba(245,158,11,0.4))'
            : 'drop-shadow(0 0 6px rgba(52,211,153,0.4))',
        }}
      />
    </svg>
  )
}

function SensorCard({
  spec,
  lang,
  t
}: {
  spec: SensorSpec
  lang: string
  t: (k: string) => string
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const countRef = useRef<HTMLSpanElement>(null)
  const value = spec.value

  useEffect(() => {
    if (!countRef.current) return
    const obj = { val: 0 }
    gsap.to(obj, {
      val: value,
      duration: 1.2,
      ease: 'power2.out',
      onUpdate: () => {
        if (countRef.current) {
          countRef.current.innerText = String(Math.round(obj.val))
        }
      }
    })
  }, [value])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = -(y - centerY) / 8
    const rotateY = (x - centerX) / 8
    
    gsap.to(cardRef.current, {
      rotateX,
      rotateY,
      scale: 1.02,
      transformPerspective: 1000,
      duration: 0.3,
      ease: 'power2.out',
    })

    if (glowRef.current) {
      gsap.to(glowRef.current, {
        left: `${x}px`,
        top: `${y}px`,
        opacity: 0.65,
        duration: 0.1,
      })
    }
  }

  const handleMouseLeave = () => {
    if (!cardRef.current) return
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      duration: 0.5,
      ease: 'power2.out',
    })

    if (glowRef.current) {
      gsap.to(glowRef.current, {
        opacity: 0,
        duration: 0.4,
      })
    }
  }

  const Icon = spec.icon

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: 'preserve-3d' }}
      className={cn(
        'relative overflow-hidden rounded-3xl border bg-[#061121]/60 p-6 sm:p-7 backdrop-blur-xl shadow-lg transition-shadow duration-300',
        spec.warn
          ? 'border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.08)] bg-gradient-to-b from-[#061121]/70 via-[#061121]/60 to-amber-500/5'
          : 'border-white/[0.07] hover:border-emerald-500/40 hover:shadow-[0_0_25px_rgba(52,211,153,0.08)]'
      )}
    >
      <div
        ref={glowRef}
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px] opacity-0 transition-opacity duration-300"
        style={{
          width: '180px',
          height: '180px',
          background: spec.warn 
            ? 'radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 70%)' 
            : 'radial-gradient(circle, rgba(52,211,153,0.18) 0%, transparent 70%)',
          mixBlendMode: 'screen',
          left: '50%',
          top: '50%',
        }}
      />

      <div style={{ transform: 'translateZ(20px)' }} className="space-y-5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2.5 text-sm font-bold text-white">
            <span
              className={cn(
                'grid h-8.5 w-8.5 place-items-center rounded-xl',
                spec.warn
                  ? 'bg-amber-500/15 text-amber-400'
                  : 'bg-emerald-500/15 text-emerald-400'
              )}
            >
              <Icon size={17} />
            </span>
            {spec.label}
          </span>
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider uppercase border',
              spec.warn
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            )}
          >
            {spec.warn ? t('warning') : t('normal')}
          </span>
        </div>

        <div className="relative flex items-center justify-center py-2">
          <Ring pct={spec.pct} warn={spec.warn} />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span 
              ref={countRef}
              className="font-heading text-4xl font-black text-white tabular-nums tracking-tight filter drop-shadow-[0_2px_8px_rgba(255,255,255,0.1)]"
            >
              0
            </span>
            <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider mt-0.5">
              {spec.unit}
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-white/[0.05] text-center">
          <p
            className={cn(
              'text-xs font-semibold min-h-[1.25rem] tracking-wide',
              spec.warn ? 'text-amber-400' : 'text-muted-foreground/75'
            )}
          >
            {spec.warn
              ? spec.warnDir
              : lang === 'en'
              ? 'Parameter in normal range'
              : 'Parameter dalam batas normal'}
          </p>
        </div>
      </div>
    </div>
  )
}

function CustomPillSwitch({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean
  onChange: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        'relative inline-flex h-7.5 w-13 shrink-0 cursor-pointer rounded-full p-0.5 transition-all duration-300 ease-in-out outline-none',
        checked
          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/10'
          : 'bg-white/[0.05] border border-white/[0.07]',
        disabled && 'opacity-40 cursor-not-allowed'
      )}
    >
      <motion.span
        layout
        className={cn(
          'pointer-events-none inline-block h-6 w-6 transform rounded-full shadow-lg transition duration-200 ease-in-out',
          checked ? 'bg-white ml-auto' : 'bg-white/40'
        )}
        style={{ originX: 0.5 }}
      />
    </button>
  )
}

export default function TechnicianPage() {
  const {
    t,
    lang,
    user,
    sensors,
    feedSchedules,
    addFeedSchedule,
    removeFeedSchedule,
    updateFeedSchedule,
    manualFeed,
    refillDispenser,
    growLightEnabled,
    growLightFrom,
    growLightTo,
    setGrowLightRange,
    growLightManualOn,
    toggleGrowLightManual,
    toggleGrowLightEnabled,
    isLightOn,
    flowOn,
    drainOn,
    fillOn,
    togglePump,
    changeWater,
    isEspConnected,
  } = useApp()

  const [activeTab, setActiveTab] = useState('dashboard')
  const controlMode = growLightEnabled ? 'otomatis' : 'manual'
  const setControlMode = useCallback((m: 'otomatis' | 'manual') => {
    if (m === 'otomatis') {
      if (!growLightEnabled) toggleGrowLightEnabled()
    } else {
      if (growLightEnabled) toggleGrowLightEnabled()
    }
  }, [growLightEnabled, toggleGrowLightEnabled])
  const [savedToast, setSavedToast] = useState(false)
  const [copiedCodeToast, setCopiedCodeToast] = useState(false)
  const [timePickerTarget, setTimePickerTarget] = useState<
    | null
    | { type: 'growLightFrom' }
    | { type: 'growLightTo' }
    | { type: 'feedScheduleSlot' }
    | { type: 'editFeedScheduleSlot'; id: string }
  >(null)
  const [timePickerInitial, setTimePickerInitial] = useState('12:00')

  const [confirm, setConfirm] = useState<null | {
    title: string
    message: string
    destructive?: boolean
    action: () => void
  }>(null)

  // State for Plant Analysis Feature
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<{
    plantName: string
    healthStatus: 'sehat' | 'sakit'
    diseaseName: string
    isReadyToHarvest: boolean
    harvestDescription: string
    recommendations: string
  } | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  const handleCaptureAndAnalyze = async (imageInput?: File | string) => {
    setAnalyzing(true)
    setAnalysisError(null)

    try {
      if (imageInput instanceof File || (typeof imageInput === 'string' && imageInput.startsWith('data:image'))) {
        const formData = new FormData()
        if (imageInput instanceof File) {
          formData.append('image', imageInput)
          setPreviewImage(URL.createObjectURL(imageInput))
        } else {
          formData.append('image_base64', imageInput)
          setPreviewImage(imageInput)
        }

        const res = await fetch('/api/analyze-plant', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          throw new Error('Gagal memproses analisis gambar')
        }

        const data = await res.json()
        setAnalysisResult(data)
        setAnalyzing(false)
      } else {
        // Trigger capture on ESP32-CAM via backend API
        const triggerRes = await fetch('/api/camera-trigger', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'trigger' })
        })

        if (!triggerRes.ok) {
          throw new Error('Gagal mengirim pemicu ke ESP32-CAM')
        }

        // Start polling the status
        let pollCount = 0
        const maxPolls = 15 // 15 * 1.5s = 22.5 seconds timeout
        
        const pollInterval = setInterval(async () => {
          pollCount++
          if (pollCount > maxPolls) {
            clearInterval(pollInterval)
            setAnalysisError('Timeout: ESP32-CAM tidak merespons atau offline.')
            setAnalyzing(false)
            
            // Reset trigger state on server
            fetch('/api/camera-trigger', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'reset' })
            }).catch(() => {})
            return
          }

          try {
            const statusRes = await fetch('/api/camera-trigger')
            if (statusRes.ok) {
              const statusData = await statusRes.json()
              
              if (statusData.status === 'success' && statusData.analysisResult) {
                clearInterval(pollInterval)
                setPreviewImage(`/images/esp32cam.jpg?t=${Date.now()}`)
                setAnalysisResult(statusData.analysisResult)
                setAnalyzing(false)
              } else if (statusData.status === 'error') {
                clearInterval(pollInterval)
                setAnalysisError(statusData.error || 'Terjadi kesalahan pada ESP32-CAM')
                setAnalyzing(false)
              }
            }
          } catch (pollErr: any) {
            console.error('Polling error:', pollErr)
          }
        }, 1500)
      }
    } catch (err: any) {
      setAnalysisError(err.message || 'Terjadi kesalahan saat menganalisis')
      setAnalyzing(false)
    }
  }

  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (activeTab !== 'dashboard') return
    const ctx = gsap.context(() => {
      gsap.from('.header-animate', {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.6,
        ease: 'power3.out',
      })
      gsap.from('.telemetry-animate', {
        opacity: 0,
        x: -20,
        duration: 0.5,
        ease: 'power2.out',
        delay: 0.25,
      })
      gsap.from('.sensor-card-animate', {
        opacity: 0,
        scale: 0.96,
        y: 15,
        stagger: 0.08,
        duration: 0.6,
        ease: 'power3.out',
        delay: 0.35,
      })
    }, headerRef)
    return () => ctx.revert()
  }, [activeTab])

  // Load last analysis and image on mount or when switching to the analysis tab
  useEffect(() => {
    if (activeTab !== 'analysis') return
    const fetchLastAnalysis = async () => {
      try {
        const res = await fetch('/api/camera-trigger')
        if (res.ok) {
          const data = await res.json()
          if (data.status === 'success' && data.analysisResult) {
            setPreviewImage(`/images/esp32cam.jpg?t=${Date.now()}`)
            setAnalysisResult(data.analysisResult)
          }
        }
      } catch (err) {
        console.error('Gagal mengambil data analisis terakhir:', err)
      }
    }
    fetchLastAnalysis()
  }, [activeTab])

  const activePumpsCount = (flowOn ? 1 : 0) + (drainOn ? 1 : 0) + (fillOn ? 1 : 0)

  // Sensor definitions
  const sensorSpecs: SensorSpec[] = [
    {
      key: 'turbidity',
      label: t('turbidity'),
      icon: Gauge,
      value: Math.round(sensors.turbidity),
      unit: 'NTU',
      pct: Math.min(100, (sensors.turbidity / 40) * 100),
      warn: sensors.turbidity > 25,
      warnDir: lang === 'en' ? 'Water is too cloudy' : 'Air terlalu keruh',
    },
    {
      key: 'feedLevel',
      label: t('feedLevel'),
      icon: Utensils,
      value: Math.round(sensors.feedLevel),
      unit: '%',
      pct: sensors.feedLevel,
      warn: sensors.feedLevel < 20,
      warnDir: lang === 'en' ? 'Refill feed soon' : 'Segera isi pakan',
    },
    {
      key: 'waterLevel',
      label: t('waterLevel'),
      icon: Waves,
      value: Math.round(sensors.waterLevel),
      unit: '%',
      pct: sensors.waterLevel,
      warn: sensors.waterLevel < 25,
      warnDir: lang === 'en' ? 'Add water soon' : 'Segera tambah air',
    },
  ]

  const hasWarnings = sensorSpecs.some((s) => s.warn)

  const tabDefs: TabDef[] = [
    { key: 'dashboard', label: t('techCenter'), icon: Sliders },
    { key: 'analysis', label: 'Analisis Tanaman', icon: Camera },
    { key: 'arduino', label: 'Arduino Integration', icon: Cpu },
  ]

  return (
    <RoleGuard role="technician">
      <DashboardShell
        roleLabel={t('technician')}
        tabs={tabDefs}
        active={activeTab}
        onChange={setActiveTab}
      >
        {activeTab === 'dashboard' ? (
          <div ref={headerRef} className="space-y-6">
            {/* Header Banner & System Status */}
            <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#07111e]/80 p-6 sm:p-8 shadow-xl backdrop-blur-md">
              {/* Moving neon mesh backdrop glow */}
              <div 
                className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none animate-pulse" 
                style={{ animationDuration: '4s' }}
              />
              <div 
                className="absolute -left-24 -bottom-24 h-80 w-80 rounded-full bg-cyan-500/5 blur-[100px] pointer-events-none animate-pulse" 
                style={{ animationDuration: '6s' }}
              />

              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between relative z-10">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5 mb-3.5 header-animate">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                      {t('liveData')}
                    </span>
                    <span className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold backdrop-blur-sm transition-all duration-300",
                      isEspConnected
                        ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                        : "border border-amber-500/30 bg-amber-500/10 text-amber-400"
                    )}>
                      <Cpu size={13} className={cn(isEspConnected ? "text-emerald-400 animate-pulse" : "text-amber-400")} />
                      {isEspConnected 
                        ? `ESP32 Terhubung (${user?.id ? user.id.slice(0, 8) : 'UUID'})` 
                        : `ESP32 Offline / Terputus (${user?.id ? user.id.slice(0, 8) : 'UUID'})`}
                    </span>
                  </div>
                  <h1 className="font-heading text-2xl font-extrabold tracking-tight text-white sm:text-3xl header-animate">
                    {t('techCenter')}
                  </h1>
                  <p className="mt-1 max-w-xl text-xs sm:text-sm text-muted-foreground/80 header-animate">
                    {lang === 'en'
                      ? 'Real-time telemetry monitoring and unified actuator control for your aquaponics system.'
                      : 'Monitoring telemetri real-time dan pusat kontrol aktuator terpadu untuk ekosistem aquaponik.'}
                  </p>
                </div>

                {/* Status Overview Badges */}
                <div className="grid grid-cols-3 gap-3 shrink-0 header-animate">
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3.5 text-center backdrop-blur-sm hover:border-white/[0.15] transition-all duration-200 shadow-inner">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                      {lang === 'en' ? 'System Health' : 'Kondisi Sistem'}
                    </span>
                    <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold">
                      {hasWarnings ? (
                        <span className="inline-flex items-center gap-1 text-amber-400">
                          <AlertTriangle size={13} />
                          {t('warning')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-400">
                          <ShieldCheck size={13} />
                          {t('normal')}
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3.5 text-center backdrop-blur-sm hover:border-white/[0.15] transition-all duration-200 shadow-inner">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                      {lang === 'en' ? 'Grow Light' : 'Grow Light'}
                    </span>
                    <span
                      className={cn(
                        'mt-1.5 text-xs font-bold',
                        growLightEnabled || growLightManualOn
                          ? 'text-emerald-400'
                          : 'text-muted-foreground'
                      )}
                    >
                      {growLightManualOn
                        ? t('lightOn')
                        : growLightEnabled
                        ? t('enabled')
                        : t('disabled')}
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3.5 text-center backdrop-blur-sm hover:border-white/[0.15] transition-all duration-200 shadow-inner">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                      {lang === 'en' ? 'Active Pumps' : 'Pompa Aktif'}
                    </span>
                    <span
                      className={cn(
                        'mt-1.5 text-xs font-bold',
                        activePumpsCount > 0 ? 'text-emerald-400' : 'text-muted-foreground'
                      )}
                    >
                      {activePumpsCount > 0
                        ? `${activePumpsCount} ${lang === 'en' ? 'Running' : 'Aktif'}`
                        : lang === 'en'
                        ? 'Standby'
                        : 'Siaga'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 1: MONITORING TELEMETRY */}
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 telemetry-animate">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8.5 w-8.5 place-items-center rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400">
                    <Activity size={17} />
                  </span>
                  <div>
                    <h2 className="font-heading text-lg font-bold text-white tracking-tight">
                      {t('techMonitor')}
                    </h2>
                    <p className="text-xs text-muted-foreground/80">
                      {lang === 'en'
                        ? 'Real-time telemetry readings from hardware sensors'
                        : 'Pembacaan data telemetri real-time dari sensor fisik'}
                    </p>
                  </div>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted-foreground/80 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Updated live
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sensorSpecs.map((s) => (
                  <div key={s.key} className="sensor-card-animate">
                    <SensorCard spec={s} lang={lang} t={t} />
                  </div>
                ))}
              </div>
            </section>

          {/* SECTION 2: KONTROL MONITORING */}
          <section className="grid gap-6 lg:grid-cols-12">
            {/* Left Box: Kontrol Aktuator */}
            <div className="lg:col-span-6 rounded-3xl border border-white/[0.07] bg-[#07111e]/60 p-6 sm:p-7 backdrop-blur-xl shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-white/[0.05] pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white tracking-tight">Kontrol Aktuator</h3>
                </div>
                
                {/* Mode Switcher */}
                <div className="inline-flex items-center rounded-full bg-white/[0.03] p-1 border border-white/[0.07] backdrop-blur-sm">
                  <button
                    type="button"
                    onClick={() => setControlMode('otomatis')}
                    className={cn(
                      'px-3 py-0.5 text-[11px] font-bold rounded-full transition-all duration-200 cursor-pointer',
                      controlMode === 'otomatis'
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10'
                        : 'text-muted-foreground hover:text-white'
                    )}
                  >
                    Otomatis
                  </button>
                  <button
                    type="button"
                    onClick={() => setControlMode('manual')}
                    className={cn(
                      'px-3 py-0.5 text-[11px] font-bold rounded-full transition-all duration-200 cursor-pointer',
                      controlMode === 'manual'
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10'
                        : 'text-muted-foreground hover:text-white'
                    )}
                  >
                    Manual
                  </button>
                </div>
              </div>

              {/* Minimal Actuator Control Rows */}
              <div className="divide-y divide-white/[0.04] space-y-1">
                {/* Device 1: Pompa Aliran */}
                <div className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <Waves size={16} className="text-cyan-400" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">Pompa Aliran (Flow)</h4>
                      <p className="text-[10px] text-muted-foreground/60 font-semibold tracking-wider uppercase">{controlMode === 'manual' ? 'MANUAL' : 'OTOMATIS'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
                      <span className={cn('h-1.5 w-1.5 rounded-full', flowOn ? 'bg-emerald-400 animate-pulse' : 'bg-white/20')} />
                      {flowOn ? 'AKTIF' : 'MATI'}
                    </span>
                    <CustomPillSwitch checked={flowOn} onChange={() => togglePump('flow')} />
                  </div>
                </div>

                {/* Device 2: Pompa Kuras */}
                <div className="flex items-center justify-between py-3.5">
                  <div className="flex items-center gap-3">
                    <Waves size={16} className="text-amber-400" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">Pompa Kuras (Drain)</h4>
                      <p className="text-[10px] text-muted-foreground/60 font-semibold tracking-wider uppercase">{controlMode === 'manual' ? 'MANUAL' : 'OTOMATIS'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
                      <span className={cn('h-1.5 w-1.5 rounded-full', drainOn ? 'bg-emerald-400 animate-pulse' : 'bg-white/20')} />
                      {drainOn ? 'AKTIF' : 'MATI'}
                    </span>
                    <CustomPillSwitch 
                      checked={drainOn} 
                      onChange={() => togglePump('drain')} 
                    />
                  </div>
                </div>

                {/* Device 3: Pompa Pengisi */}
                <div className="flex items-center justify-between py-3.5">
                  <div className="flex items-center gap-3">
                    <Waves size={16} className="text-emerald-400" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">Pompa Pengisi (Fill)</h4>
                      <p className="text-[10px] text-muted-foreground/60 font-semibold tracking-wider uppercase">{controlMode === 'manual' ? 'MANUAL' : 'OTOMATIS'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
                      <span className={cn('h-1.5 w-1.5 rounded-full', fillOn ? 'bg-emerald-400 animate-pulse' : 'bg-white/20')} />
                      {fillOn ? 'AKTIF' : 'MATI'}
                    </span>
                    <CustomPillSwitch 
                      checked={fillOn} 
                      onChange={() => togglePump('fill')} 
                    />
                  </div>
                </div>

                {/* Device 4: Grow Light */}
                <div className="flex items-center justify-between py-3.5 last:pb-0">
                  <div className="flex items-center gap-3">
                    <Lightbulb size={16} className="text-amber-400" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">Lampu Tumbuh (Grow Light)</h4>
                      <p className="text-[10px] text-muted-foreground/60 font-semibold tracking-wider uppercase">{controlMode === 'manual' ? 'MANUAL' : 'OTOMATIS'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
                      <span className={cn('h-1.5 w-1.5 rounded-full', isLightOn ? 'bg-emerald-400 animate-pulse' : 'bg-white/20')} />
                      {isLightOn ? 'AKTIF' : 'MATI'}
                    </span>
                    <CustomPillSwitch 
                      checked={controlMode === 'manual' ? growLightManualOn : growLightEnabled} 
                      onChange={() =>
                        setConfirm({
                          title: t('growLight'),
                          message: t('lightManualWarn'),
                          action: () => {
                            if (controlMode === 'manual') {
                              toggleGrowLightManual()
                            } else {
                              toggleGrowLightEnabled()
                            }
                          },
                        })
                      } 
                    />
                  </div>
                </div>
              </div>

              {/* Manual Water Change Button */}
              {controlMode === 'manual' && (
                <div className="pt-4 border-t border-white/[0.05] mt-1">
                  <button
                    type="button"
                    onClick={() =>
                      setConfirm({
                        title: 'Mulai Penggantian Air',
                        message: 'Apakah Anda yakin ingin memulai proses penggantian air? Ini akan mematikan sirkulasi, membuang air (kuras), lalu mengisi kembali dengan air bersih.',
                        action: () => changeWater(),
                      })
                    }
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 py-2.5 px-4 text-xs font-extrabold text-white shadow-md shadow-cyan-500/10 hover:opacity-95 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <Waves size={14} className="animate-pulse" />
                    Mulai Proses Ganti Air
                  </button>
                </div>
              )}
            </div>

            {/* Right Box: Otomatisasi & Pakan */}
            <div className="lg:col-span-6 rounded-3xl border border-white/[0.07] bg-[#07111e]/60 p-6 sm:p-7 backdrop-blur-xl shadow-xl space-y-6">
              <div className="flex items-center gap-2 border-b border-white/[0.05] pb-3">
                <Clock className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white tracking-tight">Otomatisasi & Pakan</h3>
              </div>

              {/* Feed Controls (Buttons side by side) */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setConfirm({
                      title: t('manualFeed'),
                      message: t('manualFeedWarn'),
                      action: manualFeed,
                    })
                  }
                  disabled={sensors.feedLevel <= 0}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 px-4 text-xs font-extrabold text-white shadow-md shadow-emerald-500/10 hover:opacity-95 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Utensils size={14} />
                  Beri Pakan Instan
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setConfirm({
                      title: 'Isi Ulang Pakan',
                      message: 'Apakah Anda yakin ingin mengisi ulang kontainer pakan dispenser hingga 100%?',
                      action: refillDispenser,
                    })
                  }
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] py-3 px-4 text-xs font-bold text-slate-300 hover:bg-white/[0.08] hover:text-white transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Plus size={14} />
                  Isi Dispenser (100%)
                </button>
              </div>

              {/* Feed Slots Schedule */}
              <div className="space-y-2">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  Jadwal Pakan Teratur:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {feedSchedules.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-xs font-bold text-white shadow-md hover:border-emerald-500/40 transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setTimePickerInitial(f.time)
                          setTimePickerTarget({ type: 'editFeedScheduleSlot', id: f.id })
                        }}
                        className="font-mono hover:text-emerald-400 transition-colors cursor-pointer"
                        title={lang === 'en' ? 'Click to edit time' : 'Klik untuk edit waktu'}
                      >
                        {f.time}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFeedSchedule(f.id)}
                        aria-label="Hapus slot"
                        className="text-muted-foreground hover:text-destructive transition-colors ml-1 cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      setTimePickerInitial('12:00')
                      setTimePickerTarget({ type: 'feedScheduleSlot' })
                    }}
                    className="flex items-center gap-1 rounded-xl border border-dashed border-emerald-500/30 bg-emerald-500/5 px-3.5 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    Tambah Jadwal
                  </button>
                </div>
              </div>

              {/* Grow Light Automatic Schedule Range Setting */}
              <div className="rounded-2xl border border-white/[0.07] bg-[#030b14]/50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Lightbulb size={14} className="text-amber-500" />
                    Rentang Waktu Grow Light (Otomatis)
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
                  <span className="text-muted-foreground/80 font-bold">Nyala dari:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setTimePickerInitial(growLightFrom)
                      setTimePickerTarget({ type: 'growLightFrom' })
                    }}
                    className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-1 font-mono font-bold text-white hover:border-emerald-500/40 transition-colors cursor-pointer"
                  >
                    <Clock size={13} className="text-emerald-400" />
                    {growLightFrom} WIB
                  </button>

                  <span className="text-muted-foreground/80 font-bold">sampai:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setTimePickerInitial(growLightTo)
                      setTimePickerTarget({ type: 'growLightTo' })
                    }}
                    className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-1 font-mono font-bold text-white hover:border-emerald-500/40 transition-colors cursor-pointer"
                  >
                    <Clock size={13} className="text-emerald-400" />
                    {growLightTo} WIB
                  </button>
                </div>
              </div>

              {/* Save Settings Button */}
              <div className="flex items-center justify-end pt-3 border-t border-white/[0.05]">
                <button
                  type="button"
                  onClick={() => {
                    setSavedToast(true)
                    setTimeout(() => setSavedToast(false), 2500)
                  }}
                  className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/10 hover:opacity-95 transition-all active:scale-95 cursor-pointer"
                >
                  <Check size={14} strokeWidth={2.5} />
                  {savedToast ? 'Tersimpan!' : 'Simpan Jadwal'}
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : activeTab === 'analysis' ? (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#07111e]/80 p-6 sm:p-8 shadow-xl backdrop-blur-md">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between relative z-10">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 mb-3">
                  <Sparkles size={14} />
                  AI Vision Plant Diagnostic
                </div>
                <h1 className="font-heading text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  Analisis Tanaman Real-time
                </h1>
                <p className="mt-1 max-w-xl text-xs sm:text-sm text-muted-foreground/80">
                  Ambil gambar langsung dari ESP32-CAM untuk mendeteksi jenis tanaman, status kesehatan, diagnosa penyakit, dan tingkat kesiapan panen.
                </p>
              </div>

              {/* Trigger Button */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  disabled={analyzing}
                  onClick={() => handleCaptureAndAnalyze()}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-emerald-500/20 hover:opacity-95 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  {analyzing ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      Memproses Gambar...
                    </>
                  ) : (
                    <>
                      <Camera size={18} />
                      Ambil Gambar & Analisis Tanaman
                    </>
                  )}
                </button>
                
                <label className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/[0.1] bg-white/[0.04] px-5 py-3.5 text-sm font-bold text-slate-200 hover:bg-white/[0.08] hover:text-white transition-all cursor-pointer">
                  <Upload size={16} />
                  Upload File
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleCaptureAndAnalyze(file)
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {analysisError && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-bold text-rose-400 flex items-center gap-2">
              <AlertTriangle size={16} />
              {analysisError}
            </div>
          )}

          {/* Main Analysis Display Grid */}
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left Card: Camera Preview Frame */}
            <div className="lg:col-span-5 rounded-3xl border border-white/[0.07] bg-[#07111e]/60 p-6 backdrop-blur-xl shadow-xl flex flex-col items-center justify-center min-h-[340px] relative overflow-hidden">
              {analyzing ? (
                <div className="relative w-full h-full min-h-[300px] rounded-2xl overflow-hidden border border-emerald-500/30 bg-black/60 flex flex-col items-center justify-center p-6 space-y-4">
                  {/* Futuristic Scanning Laser Line */}
                  <motion.div
                    className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981]"
                    animate={{ top: ['5%', '90%', '5%'] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                  />

                  {/* Pulsing Target Radar Circle */}
                  <div className="relative grid place-items-center">
                    <motion.div
                      className="absolute h-24 w-24 rounded-full border-2 border-emerald-400/40"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0.2, 0.8] }}
                      transition={{ repeat: Infinity, duration: 1.8 }}
                    />
                    <div className="grid h-16 w-16 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
                      <Camera size={32} className="animate-pulse" />
                    </div>
                  </div>

                  <div className="text-center space-y-1 z-10">
                    <h4 className="text-sm font-extrabold text-white tracking-wide">MENGAMBIL & MENGANALISIS GAMBAR</h4>
                    <p className="text-[11px] font-mono text-emerald-400/90 animate-pulse">
                      Stream Frame ESP32-CAM ➔ In-Memory AI Processor
                    </p>
                  </div>
                </div>
              ) : previewImage ? (
                <div className="relative w-full h-full min-h-[280px] rounded-2xl overflow-hidden border border-white/[0.1] group">
                  <img
                    src={previewImage}
                    alt="Tanaman Capture"
                    className="w-full h-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                    <span className="text-[11px] font-mono text-emerald-400 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-500/30">
                      ESP32-CAM Frame (In-Memory Only)
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-3 p-8 border border-dashed border-white/[0.1] rounded-2xl w-full">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/[0.03] text-muted-foreground">
                    <Camera size={28} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Belum Ada Gambar Taken</h4>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Klik tombol &quot;Ambil Gambar & Analisis Tanaman&quot; untuk mengambil sampel real-time dari ESP32-CAM.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Card: Diagnostic AI Results */}
            <div className="lg:col-span-7 rounded-3xl border border-white/[0.07] bg-[#07111e]/60 p-6 sm:p-7 backdrop-blur-xl shadow-xl space-y-5 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white border-b border-white/[0.06] pb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-400" />
                  Hasil Diagnosis Tanaman
                </h3>

                {analyzing ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
                    <RefreshCw size={32} className="text-emerald-400 animate-spin" />
                    <p className="text-xs font-bold text-white">Menganalisis Gambar Tanaman...</p>
                    <p className="text-[11px] text-muted-foreground">Memproses deteksi kesehatan, penyakit, dan kesiapan panen.</p>
                  </div>
                ) : analysisResult ? (
                  <div className="mt-5 space-y-4">
                    {/* 1. Nama Tanaman */}
                    <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nama Tanaman</span>
                      <span className="text-sm font-extrabold text-white font-heading">{analysisResult.plantName}</span>
                    </div>

                    {/* 2. Kondisi Kesehatan & Penyakit */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Status Kesehatan</span>
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border',
                            analysisResult.healthStatus === 'sehat'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          )}
                        >
                          <span className={cn('h-1.5 w-1.5 rounded-full', analysisResult.healthStatus === 'sehat' ? 'bg-emerald-400' : 'bg-rose-400')} />
                          {analysisResult.healthStatus === 'sehat' ? 'SEHAT' : 'SAKIT'}
                        </span>
                      </div>

                      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Diagnosa Penyakit</span>
                        <span className="text-xs font-bold text-white block truncate">
                          {analysisResult.healthStatus === 'sehat' ? '-' : analysisResult.diseaseName}
                        </span>
                      </div>
                    </div>

                    {/* 3. Status Siap Panen */}
                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Status Panen</span>
                        <span
                          className={cn(
                            'px-3 py-0.5 rounded-full text-[11px] font-extrabold border',
                            analysisResult.isReadyToHarvest
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          )}
                        >
                          {analysisResult.isReadyToHarvest ? 'SIAP PANEN' : 'BELUM SIAP PANEN'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground/80 leading-relaxed">
                        {analysisResult.harvestDescription}
                      </p>
                    </div>

                    {/* 4. Rekomendasi Perawatan */}
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-1">
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <Sparkles size={14} />
                        Rekomendasi Teknisi
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {analysisResult.recommendations}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-muted-foreground">
                    Belum ada data analisis. Tekan tombol diatas untuk memulai analisis tanaman.
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/[0.05] flex items-center justify-between text-[11px] text-muted-foreground/60">
                <span>Keamanan Data: Gambar tidak disimpan di database/disk</span>
                <span>Proses: In-Memory Buffer</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Time Picker Modal */}
          <TimePickerModal
            open={!!timePickerTarget}
            initialTime={timePickerInitial}
            onConfirm={(selectedTime) => {
              if (timePickerTarget?.type === 'growLightFrom') {
                setGrowLightRange(selectedTime, growLightTo)
              } else if (timePickerTarget?.type === 'growLightTo') {
                setGrowLightRange(growLightFrom, selectedTime)
              } else if (timePickerTarget?.type === 'feedScheduleSlot') {
                addFeedSchedule(selectedTime)
              } else if (timePickerTarget?.type === 'editFeedScheduleSlot') {
                updateFeedSchedule(timePickerTarget.id, selectedTime)
              }
              setTimePickerTarget(null)
            }}
            onClose={() => setTimePickerTarget(null)}
          />

          {/* Action Confirmation Modal */}
          <ConfirmDialog
            open={!!confirm}
            title={confirm?.title ?? ''}
            message={confirm?.message ?? ''}
            destructive={confirm?.destructive}
            onConfirm={() => {
              confirm?.action()
              setConfirm(null)
            }}
            onCancel={() => setConfirm(null)}
          />
      </DashboardShell>
    </RoleGuard>
  )
}
