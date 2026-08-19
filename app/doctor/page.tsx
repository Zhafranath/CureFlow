'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  Check,
  History,
  Leaf,
  Search,
  Stethoscope,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { DashboardShell, type TabDef } from '@/components/dashboard-shell'
import { RoleGuard } from '@/components/role-guard'
import { StatusBadge } from '@/components/status-badge'
import { plantName, REMEDIES } from '@/lib/data'
import { type PlantStatus, useApp } from '@/lib/store'
import { cn } from '@/lib/utils'

function DoctorContent() {
  const {
    t,
    lang,
    user,
    requests,
    requestHarvest,
    plantStatus,
    cancelRequest,
    catalog,
  } = useApp()
  const [tab, setTab] = useState('catalog')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | PlantStatus>('all')
  const [toast, setToast] = useState<string | null>(null)

  const pendingRemedyIds = useMemo(
    () =>
      new Set(
        requests
          .filter((r) => r.status === 'pending')
          .map((r) => r.remedyId),
      ),
    [requests],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    
    // 1. Text filter
    let list = REMEDIES
    if (q) {
      list = REMEDIES.filter((r) => {
        const hay = [
          r.complaintId,
          r.complaintEn,
          r.plant,
          plantName(r.plant, 'en'),
          r.prepId,
          r.prepEn,
        ]
          .join(' ')
          .toLowerCase()
        return hay.includes(q)
      })
    }

    // 2. Status filter
    if (statusFilter !== 'all') {
      list = list.filter((r) => plantStatus(r.plant) === statusFilter)
    }

    return list
  }, [query, statusFilter, plantStatus])

  const myRequests = useMemo(
    () =>
      requests
        .filter((r) => r.doctorName === user?.name)
        .sort((a, b) => b.createdAt - a.createdAt),
    [requests, user],
  )

  const getPlantStock = (plantId: string) => {
    const entries = catalog.filter((e) => e.plant === plantId)
    const total = entries.reduce((acc, curr) => acc + curr.quantity, 0)
    const ready = entries
      .filter((e) => Date.now() >= e.plantedAt + e.growDays * 24 * 60 * 60 * 1000)
      .reduce((acc, curr) => acc + curr.quantity, 0)
    return { total, ready }
  }

  function handleRequest(remedyId: string, isOutOfStock: boolean) {
    requestHarvest(remedyId)
    if (isOutOfStock) {
      setToast(lang === 'en' ? 'Planting request sent to pharmacist.' : 'Permintaan tanam dikirim ke apoteker.')
    } else {
      setToast(t('requestSent'))
    }
    window.setTimeout(() => setToast(null), 2600)
  }

  const tabs: TabDef[] = [
    { key: 'catalog', label: t('doctorCatalog'), icon: Stethoscope },
    { key: 'history', label: t('doctorHistory'), icon: History },
  ]

  const filterOptions = [
    { key: 'all', label: lang === 'en' ? 'All' : 'Semua' },
    { key: 'ready', label: t('ready') },
    { key: 'inGrowth', label: t('inGrowth') },
    { key: 'outOfStock', label: t('outOfStock') },
  ]

  return (
    <DashboardShell
      roleLabel={t('doctor')}
      tabs={tabs}
      active={tab}
      onChange={setTab}
    >
      {tab === 'catalog' ? (
        <div className="space-y-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-heading text-2xl font-bold tracking-tight text-white">
                {t('doctorCatalog')}
              </h1>
              <p className="text-xs text-muted-foreground">
                {filtered.length} / {REMEDIES.length} {t('complaint').toLowerCase()}
              </p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            {/* Search Input */}
            <div className="relative flex-1 group">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-cyan-400 transition-colors"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full rounded-xl border border-white/[0.07] bg-white/[0.02] py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-white/30 focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/10 outline-none transition-all duration-200 backdrop-blur-md"
              />
            </div>

            {/* Status Filter Tab Switcher */}
            <div className="flex rounded-xl border border-white/[0.05] bg-white/[0.01] p-1 overflow-x-auto select-none backdrop-blur-md">
              {filterOptions.map((opt) => {
                const isActive = statusFilter === opt.key
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setStatusFilter(opt.key as any)}
                    className={cn(
                      'relative whitespace-nowrap rounded-lg px-4.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors',
                      isActive ? 'text-cyan-400' : 'text-muted-foreground hover:text-white'
                    )}
                  >
                    <span className="relative z-10">{opt.label}</span>
                    {isActive && (
                      <motion.span
                        layoutId="active-catalog-filter"
                        className="absolute inset-0 rounded-lg border border-cyan-500/20 bg-cyan-500/10"
                        transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Table Layout */}
          {filtered.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/[0.08] py-12 text-center text-sm text-muted-foreground backdrop-blur-sm bg-white/[0.01]">
              {t('noResults')}
            </p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/[0.07] bg-white/[0.02] shadow-xl backdrop-blur-sm">
              <table className="w-full border-collapse text-left text-sm text-white/90">
                <thead>
                  <tr className="border-b border-white/[0.07] bg-white/[0.02] text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="px-6 py-4">{t('complaint')}</th>
                    <th className="px-6 py-4">{t('plant')}</th>
                    <th className="px-6 py-4">Stok (Siap / Total)</th>
                    <th className="px-6 py-4">{t('howToUse')}</th>
                    <th className="px-6 py-4">{t('status')}</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {filtered.map((r, index) => {
                    const status = plantStatus(r.plant)
                    const isRequested = pendingRemedyIds.has(r.id)
                    const stock = getPlantStock(r.plant)
                    const isOutOfStock = status === 'outOfStock'
                    return (
                      <motion.tr
                        key={r.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: Math.min(index * 0.02, 0.2) }}
                        className="group border-l-2 border-transparent hover:border-cyan-500/60 hover:bg-white/[0.02] transition-all duration-200"
                      >
                        <td className="px-6 py-4.5 font-semibold text-white min-w-[200px] group-hover:translate-x-1 transition-transform duration-200">
                          {lang === 'en' ? r.complaintEn : r.complaintId}
                        </td>
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 text-xs font-semibold text-cyan-400">
                            <Leaf size={11} className="group-hover:rotate-12 transition-transform duration-200" />
                            {plantName(r.plant, lang)}
                          </span>
                        </td>
                        <td className="px-6 py-4.5 whitespace-nowrap font-mono text-xs">
                          {stock.total === 0 ? (
                            <span className="text-red-400/80 font-bold uppercase tracking-wider">{lang === 'en' ? 'Out of Stock' : 'Habis'}</span>
                          ) : (
                            <span>
                              <span className={stock.ready > 0 ? "text-cyan-400 font-extrabold" : "text-white/40"}>
                                {stock.ready}
                              </span>
                              <span className="text-white/30 font-semibold"> / {stock.total} unit</span>
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4.5 text-xs text-muted-foreground/90 max-w-sm leading-relaxed">
                          {lang === 'en' ? r.prepEn : r.prepId}
                        </td>
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          <StatusBadge status={status} />
                        </td>
                        <td className="px-6 py-4.5 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleRequest(r.id, isOutOfStock)}
                            disabled={isRequested}
                            className={
                              isRequested
                                ? 'inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-400'
                                : isOutOfStock
                                ? 'group relative inline-flex items-center justify-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-violet-500/10 transition-all hover:scale-[1.02] active:scale-98'
                                : 'group relative inline-flex items-center justify-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-cyan-500/10 transition-all hover:scale-[1.02] active:scale-98'
                            }
                          >
                            {isRequested ? (
                              <>
                                <Check size={13} strokeWidth={2.5} /> {t('requested')}
                              </>
                            ) : (
                              <>
                                <span className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-[220%] transition-transform duration-500" />
                                <span className="relative">
                                  {isOutOfStock
                                    ? (lang === 'en' ? 'Req Plant' : 'Req Tanam')
                                    : t('request')}
                                </span>
                              </>
                            )}
                          </button>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-white">
              {t('doctorHistory')}
            </h1>
            <p className="text-xs text-muted-foreground">
              {myRequests.length} {lang === 'en' ? 'requests total' : 'total permintaan'}
            </p>
          </div>
          
          {myRequests.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/[0.08] py-12 text-center text-sm text-muted-foreground backdrop-blur-sm bg-white/[0.01]">
              {t('historyEmpty')}
            </p>
          ) : (
            <ul className="grid gap-3">
              {myRequests.map((r, i) => (
                <motion.li
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  className="flex flex-col gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 sm:flex-row sm:items-center sm:justify-between transition-all hover:border-white/[0.12] hover:bg-white/[0.04] backdrop-blur-sm shadow-md"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-xs font-semibold text-cyan-400">
                        <Leaf size={11} />
                        {plantName(r.plant, lang)}
                      </span>
                      <h3 className="font-bold text-white tracking-tight text-sm sm:text-base">
                        {(() => {
                          const rem = REMEDIES.find((rx) => rx.id === r.remedyId)
                          return lang === 'en'
                            ? (rem?.complaintEn ?? r.complaint)
                            : r.complaint
                        })()}
                      </h3>
                    </div>
                    <p className="mt-2 text-[11px] text-muted-foreground/80">
                      {t('requestedOn')}{' '}
                      <span className="text-white/60 font-medium">
                        {new Date(r.createdAt).toLocaleString(
                          lang === 'en' ? 'en-US' : 'id-ID',
                          { dateStyle: 'medium', timeStyle: 'short' },
                        )}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <RequestStatusPill status={r.status} />
                    {r.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => {
                          cancelRequest(r.id)
                          setToast(lang === 'en' ? 'Request cancelled successfully.' : 'Permintaan berhasil dibatalkan.')
                          window.setTimeout(() => setToast(null), 2600)
                        }}
                        className="inline-flex h-8 px-3 items-center justify-center rounded-xl bg-destructive/15 text-destructive border border-transparent hover:border-destructive/20 hover:bg-destructive/20 text-xs font-bold transition-all cursor-pointer"
                        title={lang === 'en' ? 'Cancel Request' : 'Batalkan Permintaan'}
                      >
                        {lang === 'en' ? 'Cancel' : 'Batal'}
                      </button>
                    )}
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-6 left-1/2 z-50 rounded-xl border border-emerald-500/20 bg-emerald-950/80 px-4.5 py-3 text-sm font-bold text-emerald-400 shadow-2xl backdrop-blur-lg shadow-black/50"
          >
            <span className="inline-flex items-center gap-2">
              <Check size={16} strokeWidth={2.5} className="text-emerald-400" />
              {toast}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardShell>
  )
}

function RequestStatusPill({
  status,
}: {
  status: 'pending' | 'approved' | 'declined'
}) {
  const { t } = useApp()
  const map = {
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.05)]',
    approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.05)]',
    declined: 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_12px_rgba(239,68,68,0.05)]',
  }
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${map[status]}`}
    >
      <span className={`h-1 w-1 rounded-full ${status === 'pending' ? 'bg-amber-400' : status === 'approved' ? 'bg-emerald-400' : 'bg-red-400'}`} />
      {t(status)}
    </span>
  )
}

export default function DoctorPage() {
  return (
    <RoleGuard role="doctor">
      <DoctorContent />
    </RoleGuard>
  )
}
