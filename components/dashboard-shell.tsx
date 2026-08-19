'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'
import { Brand } from '@/components/brand'
import { TopControls } from '@/components/top-controls'
import { SceneBackground } from '@/components/scene-background'
import { useApp } from '@/lib/store'
import { cn } from '@/lib/utils'

export type TabDef = {
  key: string
  label: string
  icon: LucideIcon
  badge?: number
}

export function DashboardShell({
  roleLabel,
  tabs,
  active,
  onChange,
  children,
}: {
  roleLabel: string
  tabs: TabDef[]
  active: string
  onChange: (key: string) => void
  children: React.ReactNode
}) {
  const { t, user, logout } = useApp()
  const router = useRouter()

  function handleLogout() {
    logout()
    router.push('/')
  }

  // Get active role colors for custom accent trims
  const roleColorClass =
    roleLabel.toLowerCase() === 'dokter' || roleLabel.toLowerCase() === 'doctor'
      ? 'text-cyan-400'
      : roleLabel.toLowerCase() === 'apoteker' || roleLabel.toLowerCase() === 'pharmacist'
      ? 'text-violet-400'
      : 'text-emerald-400'

  const roleBgClass =
    roleLabel.toLowerCase() === 'dokter' || roleLabel.toLowerCase() === 'doctor'
      ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
      : roleLabel.toLowerCase() === 'apoteker' || roleLabel.toLowerCase() === 'pharmacist'
      ? 'bg-violet-500/10 border-violet-500/20 text-violet-400'
      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'

  return (
    <div className="relative min-h-screen overflow-hidden text-foreground bg-background">
      {/* Premium topographic backdrop */}
      <SceneBackground />

      {/* Sticky Header with high-fidelity glassmorphism */}
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Brand size="sm" />
            <span className="hidden h-5 w-px bg-white/[0.1] sm:block" />
            <span className={cn("hidden rounded-full border px-3 py-1 text-xs font-bold sm:inline", roleBgClass)}>
              {roleLabel}
            </span>
          </div>

          <div className="flex items-center gap-3.5">
            <TopControls />
            <span className="hidden text-right text-xs leading-tight sm:block">
              <span className="block font-bold text-white">
                {user?.name}
              </span>
              <span className="text-muted-foreground/80 text-[11px]">{roleLabel}</span>
            </span>
            <button
              type="button"
              onClick={handleLogout}
              aria-label={t('logout')}
              className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Sliding Pill Navigation Bar */}
        {tabs.length > 1 && (
          <nav className="mx-auto max-w-6xl px-4 pb-2 sm:px-6">
            <div className="flex gap-1.5 rounded-xl border border-white/[0.05] bg-white/[0.02] p-1 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = active === tab.key
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => onChange(tab.key)}
                    className={cn(
                      'relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all select-none',
                      isActive
                        ? roleColorClass
                        : 'text-muted-foreground hover:text-white',
                    )}
                  >
                    <Icon size={14} />
                    {tab.label}
                    {tab.badge ? (
                      <span className="grid h-4.5 min-w-4.5 place-items-center rounded-full bg-destructive px-1 text-[10px] font-extrabold text-white">
                        {tab.badge}
                      </span>
                    ) : null}
                    {isActive && (
                      <motion.span
                        layoutId={`tab-bg-pill-${roleLabel}`}
                        className={cn("absolute inset-0 -z-10 rounded-lg border",
                          roleLabel.toLowerCase() === 'dokter' || roleLabel.toLowerCase() === 'doctor'
                            ? 'bg-cyan-500/10 border-cyan-500/20'
                            : roleLabel.toLowerCase() === 'apoteker' || roleLabel.toLowerCase() === 'pharmacist'
                            ? 'bg-violet-500/10 border-violet-500/20'
                            : 'bg-emerald-500/10 border-emerald-500/20'
                        )}
                        transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </nav>
        )}
      </header>

      {/* Main dashboard content wrapped in a smooth animation */}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
