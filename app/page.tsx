'use client'

import { motion } from 'framer-motion'
import {
  Activity,
  ArrowRight,
  Clock,
  Cpu,
  Droplets,
  Gauge,
  Lightbulb,
  Pill,
  Sliders,
  Sparkles,
  Stethoscope,
  Thermometer,
  Utensils,
  Wrench,
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Brand } from '@/components/brand'
import { TopControls } from '@/components/top-controls'
import { SceneBackground } from '@/components/scene-background'
import { useApp } from '@/lib/store'

/* ── Glowing Tech Orb for Cyberpunk/Dashboard theme background ── */
function GlowingOrb({ delay = 0, duration = 15, startX = 10, startY = 10, scale = 1, color = 'rgba(6,182,212,0.15)' }) {
  return (
    <motion.div
      initial={{ x: `${startX}vw`, y: `${startY}vh`, scale: scale, opacity: 0.35 }}
      animate={{
        y: [`${startY}vh`, `${startY + 14}vh`, `${startY}vh`],
        x: [`${startX}vw`, `${startX + 6}vw`, `${startX}vw`],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: delay,
      }}
      className="absolute pointer-events-none -z-10 rounded-full blur-[100px]"
      style={{ width: '220px', height: '220px', backgroundColor: color }}
    />
  )
}

export default function HomePage() {
  const { t, lang, flowOn, drainOn, fillOn } = useApp()
  const router = useRouter()
  const [timeStr, setTimeStr] = useState('')

  // Live clock for footer telemetry
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTimeStr(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB')
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const activePumps = (flowOn ? 1 : 0) + (drainOn ? 1 : 0) + (fillOn ? 1 : 0)

  // Features list for original website themes
  const iotFeatures = [
    { icon: Utensils, label: t('feat1t'), desc: t('feat1d') },
    { icon: Droplets, label: t('feat2t'), desc: t('feat2d') },
    { icon: Lightbulb, label: t('feat3t'), desc: t('feat3d') },
    { icon: Gauge, label: t('feat4t'), desc: t('feat4d') },
  ]

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden bg-[#020813]">
      {/* 3D wave and topographic overlays */}
      <SceneBackground />

      {/* Cyberpunk ambient glowing orbs (Space Blue/Navy accents) */}
      <GlowingOrb startX={10} startY={20} delay={0} duration={18} scale={1.2} color="rgba(6,182,212,0.18)" /> {/* Cyan */}
      <GlowingOrb startX={80} startY={30} delay={4} duration={22} scale={1.4} color="rgba(16,185,129,0.14)" /> {/* Emerald */}
      <GlowingOrb startX={40} startY={60} delay={8} duration={20} scale={1.3} color="rgba(139,92,246,0.15)" /> {/* Violet */}
      <GlowingOrb startX={15} startY={75} delay={2} duration={16} scale={1.1} color="rgba(59,130,246,0.16)" /> {/* Blue */}
      <GlowingOrb startX={75} startY={80} delay={6} duration={19} scale={1.2} color="rgba(6,182,212,0.14)" /> {/* Cyan */}

      {/* Floating navigation header bar */}
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/[0.05] bg-[#020813]/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Brand size="sm" />
          

          <TopControls />
        </div>
      </header>

      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-12 lg:gap-8">
          {/* Left panel: Brand slogan & copy */}
          <div className="lg:col-span-7 flex flex-col items-start z-10">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400"
            >
              <Cpu size={12} className="animate-pulse text-emerald-400" /> {t('tagline')}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.7 }}
              className="mt-6 font-heading text-3xl font-extrabold leading-[1.12] tracking-tight text-white sm:text-4xl lg:text-[46px] text-balance"
            >
              {lang === 'en' ? (
                <>
                  Growing Medicine, <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 filter drop-shadow-[0_2px_12px_rgba(52,211,153,0.15)]">
                    Growing Hope.
                  </span>
                </>
              ) : (
                <>
                  Menanam Obat, <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 filter drop-shadow-[0_2px_12px_rgba(52,211,153,0.15)]">
                    Menumbuhkan Harapan.
                  </span>
                </>
              )}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.7 }}
              className="mt-5 text-sm sm:text-base leading-relaxed text-slate-300/80 text-balance"
            >
              {t('heroSub')}
            </motion.p>

            {/* Premium CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32, duration: 0.7 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-cyan-500/35 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <span className="relative flex items-center gap-2">
                  {t('heroCta')}
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </span>
              </button>
            </motion.div>
          </div>

          {/* Right panel: Original hero-aquaponic.png Mockup */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
            {/* Ambient lighting behind image */}
            <div className="absolute inset-0 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none -z-10 scale-90" />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              className="relative w-full max-w-[420px] overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.01] p-3 shadow-2xl backdrop-blur-sm"
            >
              <div className="overflow-hidden rounded-2xl border border-white/[0.05] bg-black/10">
                <Image
                  src="/images/hero-aquaponic.png"
                  alt="CureFlow Smart Aquaponic System Setup Illustration"
                  width={800}
                  height={800}
                  priority
                  className="h-full w-full object-cover transition-transform duration-[4000ms] hover:scale-105"
                />
              </div>
              
              {/* Glowing badge */}
              <div className="absolute top-6 right-6 flex items-center gap-2 rounded-lg bg-black/75 px-3 py-1.5 border border-white/[0.1] backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{lang === 'en' ? 'System Active' : 'Sistem Aktif'}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. AUTOMATION FEATURES SECTIONS */}
      <section className="relative py-20 border-t border-white/[0.04] bg-white/[0.01]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-12 items-center lg:grid-cols-12 lg:gap-8">
            
            {/* Left Column: Symmetrical Secondary Hero Image View */}
            <div className="lg:col-span-5 order-last lg:order-first flex justify-center lg:justify-start">
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7 }}
                className="relative w-full max-w-[340px] overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.01] p-2 shadow-2xl"
              >
                <div className="overflow-hidden rounded-xl bg-black/10">
                  <Image
                    src="/images/hero-aquaponic.png"
                    alt="Secondary view illustration"
                    width={500}
                    height={500}
                    className="h-full w-full object-cover grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
                  />
                </div>
              </motion.div>
            </div>

            {/* Right Column: Original Features (Satu Ekosistem Tanpa Limbah) */}
            <div className="lg:col-span-7 flex flex-col items-start">
              <div className="inline-flex items-center justify-center h-8.5 w-8.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-5">
                <Sparkles size={16} />
              </div>

              <h2 className="font-heading text-2xl sm:text-3xl font-black tracking-tight text-white mb-2 leading-tight">
                {t('featTitle')}
              </h2>
              
              <p className="text-sm leading-relaxed text-slate-300/80 mb-8 max-w-xl">
                {t('featSub')}
              </p>

              {/* 2x2 Clean Minimalist Features List */}
              <div className="grid gap-6 sm:grid-cols-2 w-full">
                {iotFeatures.map((f, i) => {
                  const IconComp = f.icon
                  return (
                    <div key={i} className="flex gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-0.5">
                        <IconComp size={13} />
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-white tracking-wide uppercase">{f.label}</h4>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{f.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. THREE ROLES SYSTEM CARDS (CARA KERJA TIGA PERAN) */}
      <section className="relative mx-auto max-w-6xl px-4 py-20">
        <div className="max-w-xl mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-400 mb-3">
            <Cpu size={11} className="text-emerald-400" /> {t('howTitle')}
          </div>
          
          <h2 className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl text-balance">
            {lang === 'en' ? 'Collaborative Role Ecosystem' : 'Kolaborasi Ekosistem Tiga Peran'}
          </h2>
          
          <p className="mt-2 text-xs leading-relaxed text-slate-400">
            {lang === 'en'
              ? 'Three distinct interfaces seamlessly synchronized via automated IoT feedback loops to run the hospital aquaponics garden.'
              : 'Tiga peran pekerjaan yang terhubung secara terpadu melalui robot aquaponik IoT untuk menjamin suplai obat herbal rumah sakit.'}
          </p>
        </div>

        {/* 3-Card Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          
          {/* Card 1: Dokter */}
          <motion.div
            whileHover={{ y: -6 }}
            className="group rounded-3xl border border-white/[0.06] bg-white/[0.01] p-5 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5 backdrop-blur-sm relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="overflow-hidden rounded-2xl border border-white/[0.04] aspect-square relative bg-slate-900/60">
                <Image
                  src="/images/role_doctor.jpg"
                  alt="Doctor role illustration tech card"
                  width={400}
                  height={400}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="text-[10px] text-emerald-300 font-bold tracking-wider flex items-center gap-1">
                    <Stethoscope size={12} /> {lang === 'en' ? 'Doctor Portal' : 'Portal Dokter'}
                  </span>
                </div>
              </div>
              <h3 className="mt-5 font-heading text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Stethoscope size={16} className="text-emerald-400" />
                {t('step1t')}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{t('step1d')}</p>
            </div>
            
            <div className="mt-6 flex items-center justify-between border-t border-white/[0.05] pt-4">
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/20 px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-emerald-400">
                {t('doctor')}
              </span>
              <button 
                type="button" 
                onClick={() => router.push('/login')} 
                className="text-[10px] font-bold text-emerald-400 group-hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                {lang === 'en' ? 'Access' : 'Akses'} <ArrowRight size={10} />
              </button>
            </div>
          </motion.div>

          {/* Card 2: Apoteker */}
          <motion.div
            whileHover={{ y: -6 }}
            className="group rounded-3xl border border-white/[0.06] bg-white/[0.01] p-5 transition-all duration-300 hover:border-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/5 backdrop-blur-sm relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="overflow-hidden rounded-2xl border border-white/[0.04] aspect-square relative bg-slate-900/60">
                <Image
                  src="/images/role_pharmacist.jpg"
                  alt="Pharmacist role illustration tech card"
                  width={400}
                  height={400}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="text-[10px] text-cyan-300 font-bold tracking-wider flex items-center gap-1">
                    <Pill size={12} /> {lang === 'en' ? 'Pharmacist Portal' : 'Portal Apoteker'}
                  </span>
                </div>
              </div>
              <h3 className="mt-5 font-heading text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Pill size={16} className="text-cyan-400" />
                {t('step2t')}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{t('step2d')}</p>
            </div>
            
            <div className="mt-6 flex items-center justify-between border-t border-white/[0.05] pt-4">
              <span className="rounded-full bg-cyan-500/15 border border-cyan-500/20 px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-cyan-400">
                {t('pharmacist')}
              </span>
              <button 
                type="button" 
                onClick={() => router.push('/login')} 
                className="text-[10px] font-bold text-cyan-400 group-hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                {lang === 'en' ? 'Access' : 'Akses'} <ArrowRight size={10} />
              </button>
            </div>
          </motion.div>

          {/* Card 3: Teknisi */}
          <motion.div
            whileHover={{ y: -6 }}
            className="group rounded-3xl border border-white/[0.06] bg-white/[0.01] p-5 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5 backdrop-blur-sm relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="overflow-hidden rounded-2xl border border-white/[0.04] aspect-square relative bg-slate-900/60">
                <Image
                  src="/images/role_technician.jpg"
                  alt="Technician role illustration tech card"
                  width={400}
                  height={400}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="text-[10px] text-emerald-300 font-bold tracking-wider flex items-center gap-1">
                    <Wrench size={12} /> {lang === 'en' ? 'Technician Portal' : 'Portal Teknisi'}
                  </span>
                </div>
              </div>
              <h3 className="mt-5 font-heading text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Sliders size={16} className="text-emerald-400" />
                {t('step3t')}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{t('step3d')}</p>
            </div>
            
            <div className="mt-6 flex items-center justify-between border-t border-white/[0.05] pt-4">
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/20 px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-emerald-400">
                {t('technician')}
              </span>
              <button 
                type="button" 
                onClick={() => router.push('/login')} 
                className="text-[10px] font-bold text-emerald-400 group-hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                {lang === 'en' ? 'Access' : 'Akses'} <ArrowRight size={10} />
              </button>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 4. FOOTER / TELEMETRY STATUS BAR */}
      <footer className="border-t border-white/[0.05] bg-[#020813]/90 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 py-8 flex flex-col items-center justify-between gap-6 sm:flex-row sm:px-6">
          {/* Footer Left */}
          <div className="flex flex-col items-center sm:items-start gap-1">
            <Brand size="sm" />
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
              ESP32 Aquaponic Health System
            </p>
          </div>

          {/* Footer Right: Symmetrical Telemetry overlay panel */}
          <div className="flex flex-wrap justify-center sm:justify-end gap-3.5">
            {/* Clock */}
            <div className="flex items-center gap-2 rounded-xl bg-white/[0.02] border border-white/[0.05] px-4 py-2.5 shadow-lg">
              <Clock size={14} className="text-emerald-400" />
              <span className="text-[10px] font-black text-white tracking-widest tabular-nums uppercase">{timeStr || 'LOADING...'}</span>
            </div>

            {/* Temperature */}
            <div className="flex items-center gap-2 rounded-xl bg-white/[0.02] border border-white/[0.05] px-4 py-2.5 shadow-lg">
              <Thermometer size={14} className="text-emerald-400" />
              <span className="text-[10px] font-black text-white tracking-wider">20.3 °C</span>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2 rounded-xl bg-white/[0.02] border border-white/[0.05] px-4 py-2.5 shadow-lg">
              <Activity size={14} className="text-emerald-400" />
              <span className="text-[10px] font-black text-white uppercase tracking-wider">
                {activePumps > 0 ? `${activePumps} POMPA` : 'STANDBY'}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
