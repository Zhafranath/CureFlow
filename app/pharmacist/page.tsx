'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  Bell,
  Check,
  Clock,
  Fish,
  Leaf,
  Plus,
  Pencil,
  Search,
  Sprout,
  Trash2,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import Image from 'next/image'
import { DashboardShell, type TabDef } from '@/components/dashboard-shell'
import { RoleGuard } from '@/components/role-guard'
import { StatusBadge } from '@/components/status-badge'
import {
  FISH_TYPES,
  getPlantProfile,
  plantName,
  PLANTS,
  REMEDIES,
} from '@/lib/data'
import { type CatalogEntry, useApp } from '@/lib/store'

function PharmacistContent() {
  const {
    t,
    lang,
    catalog,
    fish,
    requests,
    addCatalogPlant,
    removeCatalogEntry,
    updateCatalogEntry,
    addFish,
    removeFish,
    updateFishQuantity,
    updateFishEntry,
    decideRequest,
    entryEtaDays,
  } = useApp()
  const [tab, setTab] = useState('plants')

  const pendingCount = requests.filter((r) => r.status === 'pending').length

  const tabs: TabDef[] = [
    { key: 'plants', label: t('pharmaPlants'), icon: Sprout },
    { key: 'fish', label: t('pharmaFish'), icon: Fish },
    {
      key: 'requests',
      label: t('pharmaRequests'),
      icon: Bell,
      badge: pendingCount,
    },
  ]

  return (
    <DashboardShell
      roleLabel={t('pharmacist')}
      tabs={tabs}
      active={tab}
      onChange={setTab}
    >
      {tab === 'plants' && (
        <PlantsTab
          catalog={catalog}
          onAdd={addCatalogPlant}
          onRemove={removeCatalogEntry}
          onUpdate={updateCatalogEntry}
          etaDays={entryEtaDays}
          lang={lang}
          t={t}
        />
      )}
      {tab === 'fish' && (
        <FishTab
          fish={fish}
          onAdd={addFish}
          onRemove={removeFish}
          onUpdateQty={updateFishQuantity}
          onUpdateEntry={updateFishEntry}
          lang={lang}
          t={t}
        />
      )}
      {tab === 'requests' && (
        <RequestsTab
          requests={requests}
          onDecide={decideRequest}
          lang={lang}
          t={t}
        />
      )}
    </DashboardShell>
  )
}

/* ----------------------------- Plants ----------------------------- */

function PlantsTab({
  catalog,
  onAdd,
  onRemove,
  onUpdate,
  etaDays,
  lang,
  t,
}: {
  catalog: CatalogEntry[]
  onAdd: (plant: string, qty: number, dateVal?: number) => void
  onRemove: (id: string) => void
  onUpdate: (id: string, qty: number) => void
  etaDays: (e: CatalogEntry) => number
  lang: 'id' | 'en'
  t: (k: string) => string
}) {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'ready' | 'inGrowth'>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editQty, setEditQty] = useState<number>(0)

  const options = PLANTS.map((p) => ({
    value: p.id,
    label: plantName(p.id, lang),
    hint: `${p.growDays} ${t('daysLeft')}`,
  }))

  const filteredCatalog = useMemo(() => {
    let list = catalog

    // 1. Text filter
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter((e) => plantName(e.plant, lang).toLowerCase().includes(q))
    }

    // 2. Status filter
    if (statusFilter === 'ready') {
      list = list.filter((e) => etaDays(e) <= 0)
    } else if (statusFilter === 'inGrowth') {
      list = list.filter((e) => etaDays(e) > 0)
    }

    return list
  }, [catalog, query, statusFilter, etaDays, lang])

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <AddCard
        title={t('addPlant')}
        icon={Sprout}
        searchPlaceholder={t('searchPlantPlaceholder')}
        selectLabel={t('selectPlant')}
        options={options}
        addLabel={t('add')}
        quantityLabel={t('quantity')}
        onAdd={onAdd}
        t={t}
        lang={lang}
        themeColor="violet"
      />

      <div className="space-y-4">
        <h2 className="font-heading text-lg font-bold text-white tracking-tight">
          {t('growingList')}
        </h2>

        {/* Filter Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search bar inside list */}
          <div className="relative flex-1 group">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-violet-400 transition-colors"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={lang === 'en' ? 'Search growing plants...' : 'Cari tanaman...'}
              className="w-full rounded-xl border border-white/[0.07] bg-white/[0.02] py-2 pl-9 pr-3 text-xs text-white placeholder:text-white/30 focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/10 outline-none transition-all duration-200 backdrop-blur-md"
            />
          </div>

          {/* Status Tabs Switcher */}
          <div className="flex rounded-xl border border-white/[0.05] bg-white/[0.01] p-1 overflow-x-auto select-none backdrop-blur-md">
            {[
              { key: 'all', label: lang === 'en' ? 'All' : 'Semua' },
              { key: 'ready', label: t('ready') },
              { key: 'inGrowth', label: t('inGrowth') },
            ].map((opt) => {
              const isActive = statusFilter === opt.key
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setStatusFilter(opt.key as any)}
                  className={`relative whitespace-nowrap rounded-lg px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                    isActive ? 'text-violet-400' : 'text-muted-foreground hover:text-white'
                  }`}
                >
                  <span className="relative z-10">{opt.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="active-pharmacist-plant-filter"
                      className="absolute inset-0 rounded-lg border border-violet-500/20 bg-violet-500/10"
                      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {catalog.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/[0.08] py-16 text-center bg-white/[0.01] backdrop-blur-sm px-4">
            <Leaf className="mx-auto text-violet-400/30 animate-pulse mb-3" size={28} />
            <h3 className="text-sm font-bold text-white mb-1">
              {lang === 'en' ? 'No Plants Growing' : 'Tidak Ada Tanaman'}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              {lang === 'en' 
                ? 'The plant catalog is currently empty. Use the planting form on the left to plant your first batch.' 
                : 'Katalog tanaman saat ini masih kosong di database Supabase. Gunakan form tanam di sebelah kiri untuk menanam bibit pertama Anda.'}
            </p>
          </div>
        ) : filteredCatalog.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/[0.08] py-16 text-center bg-white/[0.01] backdrop-blur-sm px-4">
            <Search className="mx-auto text-white/20 mb-3" size={24} />
            <p className="text-xs text-muted-foreground">
              {t('noResults')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Header row (hidden on mobile, visible on desktop) */}
            <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground/60 select-none">
              <div className="col-span-3">{lang === 'en' ? 'Plant Species' : 'Nama Tanaman'}</div>
              <div className="col-span-1">{lang === 'en' ? 'Stock' : 'Jumlah Stok'}</div>
              <div className="col-span-2">{lang === 'en' ? 'Planted Date' : 'Tanggal Tanam'}</div>
              <div className="col-span-2">{lang === 'en' ? 'Harvest ETA' : 'Estimasi Panen'}</div>
              <div className="col-span-2">{lang === 'en' ? 'Growth / Status' : 'Progres & Status'}</div>
              <div className="col-span-2 text-right">Aksi</div>
            </div>

            <AnimatePresence>
              {filteredCatalog.map((e, index) => {
                const eta = etaDays(e)
                const ready = eta <= 0
                const profile = getPlantProfile(e.plant)
                const growDays = profile?.growDays ?? 1
                const progressPct = ready
                  ? 100
                  : Math.max(5, Math.min(95, ((growDays - eta) / growDays) * 100))
                const isEditing = editingId === e.id

                return (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: Math.min(index * 0.02, 0.2) }}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center rounded-2xl border border-white/[0.07] bg-white/[0.01] hover:bg-white/[0.025] p-5 sm:px-6 sm:py-4.5 hover:border-violet-500/40 hover:shadow-[0_4px_20px_rgba(139,92,246,0.04)] transition-all duration-300 group border-l-2 hover:border-l-violet-500"
                  >
                    {/* Plant Species */}
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-white/[0.08] shadow-inner bg-black/10">
                        <Image
                          src={
                            e.plant === 'Daun mint'
                              ? '/images/plant_pot_three.jpg'
                              : e.plant === 'Tomat ceri' || e.plant === 'Kale'
                                ? '/images/plant_pot_two.jpg'
                                : '/images/plant_pot_one.jpg'
                          }
                          alt={e.plant}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                      <div>
                        <span className="block text-[9px] font-bold text-muted-foreground/50 sm:hidden uppercase tracking-widest mb-0.5">Nama Tanaman</span>
                        <span className="font-bold text-white tracking-tight group-hover:text-violet-300 transition-colors">{plantName(e.plant, lang)}</span>
                      </div>
                    </div>

                    {/* Stock Qty */}
                    <div className="col-span-1">
                      <span className="block text-[9px] font-bold text-muted-foreground/50 sm:hidden uppercase tracking-widest mb-0.5">Jumlah Stok</span>
                      {isEditing ? (
                        <input
                          type="number"
                          min={1}
                          value={editQty}
                          onChange={(evt) => setEditQty(Math.max(1, Number(evt.target.value) || 1))}
                          className="w-16 rounded border border-violet-500/50 bg-black/40 px-1.5 py-0.5 text-center text-xs font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-violet-500/30"
                        />
                      ) : (
                        <span className="font-mono text-xs font-extrabold text-white flex items-center gap-1.5">
                          <span>{e.quantity} {t('units')}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(e.id)
                              setEditQty(e.quantity)
                            }}
                            className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-violet-400 transition-all p-0.5 cursor-pointer"
                            title="Edit"
                          >
                            <Pencil size={11} />
                          </button>
                        </span>
                      )}
                    </div>

                    {/* Planted Date */}
                    <div className="col-span-2 text-xs text-muted-foreground/80 font-medium">
                      <span className="block text-[9px] font-bold text-muted-foreground/50 sm:hidden uppercase tracking-widest mb-0.5">Tanggal Tanam</span>
                      {new Date(e.plantedAt).toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID', {
                        dateStyle: 'medium',
                      })}
                    </div>

                    {/* Harvest ETA */}
                    <div className="col-span-2 text-xs text-muted-foreground/80">
                      <span className="block text-[9px] font-bold text-muted-foreground/50 sm:hidden uppercase tracking-widest mb-0.5">Estimasi Panen</span>
                      <span className="font-bold text-white">
                        {ready
                          ? t('ready')
                          : eta === 0
                            ? t('today')
                            : `${eta} ${t('daysLeft')}`}
                      </span>
                      <span className="text-white/40 text-[10px] ml-1">
                        · {growDays}d total
                      </span>
                    </div>

                    {/* Growth Progress / Status */}
                    <div className="col-span-2 space-y-1.5">
                      <span className="block text-[9px] font-bold text-muted-foreground/50 sm:hidden uppercase tracking-widest mb-0.5">Progres & Status</span>
                      <div className="flex flex-wrap items-center gap-2">
                        {ready ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.08)]">
                            <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                            {lang === 'en' ? 'Ready' : 'Siap'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.08)]">
                            <span className="h-1 w-1 rounded-full bg-amber-400 animate-pulse" />
                            {lang === 'en' ? 'Growing' : 'Tumbuh'}
                          </span>
                        )}
                        <span className="font-mono text-[10px] font-bold text-violet-400">{Math.round(progressPct)}%</span>
                      </div>
                      <div className="relative h-1.5 w-full rounded-full bg-white/[0.04] overflow-hidden border border-white/[0.03] max-w-[120px]">
                        <motion.div
                          className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full shadow-[0_0_12px_rgba(139,92,246,0.35)]"
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPct}%` }}
                          transition={{ type: 'spring', stiffness: 80, damping: 15 }}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex justify-end gap-1.5">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              onUpdate(e.id, editQty)
                              setEditingId(null)
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-emerald-400 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 transition-all cursor-pointer"
                            title="Simpan"
                          >
                            <Check size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer"
                            title="Batal"
                          >
                            <X size={13} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(e.id)
                              setEditQty(e.quantity)
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-white/5 hover:text-violet-400 transition-colors border border-transparent hover:border-white/10 cursor-pointer"
                            title="Edit"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemove(e.id)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-colors border border-transparent hover:border-destructive/20 cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 size={13} />
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------ Fish ------------------------------ */
function FishTab({
  fish,
  onAdd,
  onRemove,
  onUpdateQty,
  onUpdateEntry,
  lang,
  t,
}: {
  fish: { id: string; type: string; quantity: number; addedAt: number }[]
  onAdd: (type: string, qty: number, dateVal?: number) => void
  onRemove: (id: string) => void
  onUpdateQty: (id: string, diff: number) => void
  onUpdateEntry: (id: string, qty: number) => void
  lang: 'id' | 'en'
  t: (k: string) => string
}) {
  const [toast, setToast] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editQty, setEditQty] = useState<number>(0)

  const options = FISH_TYPES.map((f) => ({
    value: f.id,
    label: lang === 'en' ? f.nameEn : f.nameId,
    hint: lang === 'en' ? f.noteEn : f.noteId,
  }))

  function fishName(typeId: string) {
    const f = FISH_TYPES.find((x) => x.id === typeId)
    return f ? (lang === 'en' ? f.nameEn : f.nameId) : typeId
  }

  function getDensityStatus(qty: number) {
    if (qty <= 0) return { label: lang === 'en' ? 'Out of Stock' : 'Stok Habis', style: 'border-red-500/20 bg-red-500/10 text-red-400' }
    if (qty > 40) return { label: lang === 'en' ? 'Overcrowded' : 'Terlalu Padat', style: 'border-amber-500/20 bg-amber-500/10 text-amber-400' }
    if (qty >= 20) return { label: lang === 'en' ? 'Ideal' : 'Ideal', style: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' }
    return { label: lang === 'en' ? 'Sparse' : 'Sangat Rendah', style: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-400' }
  }

  function handleHarvest(id: string, currentQty: number) {
    if (currentQty <= 0) return
    const harvestQty = Math.min(10, currentQty)
    onUpdateQty(id, -harvestQty)
    setToast(lang === 'en' ? `${harvestQty} fish harvested and sent to dietary kitchen!` : `${harvestQty} ekor ikan dipanen dan dikirim ke instalasi gizi dapur!`)
    window.setTimeout(() => setToast(null), 2800)
  }

  function handleRestock(id: string) {
    onUpdateQty(id, 10)
    setToast(lang === 'en' ? '10 fish fry successfully added to the pond!' : '10 bibit ikan berhasil ditambahkan ke kolam!')
    window.setTimeout(() => setToast(null), 2800)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <AddCard
        title={t('addFish')}
        icon={Fish}
        searchPlaceholder={t('selectFish')}
        selectLabel={t('selectFish')}
        options={options}
        addLabel={t('add')}
        quantityLabel={t('quantity')}
        onAdd={onAdd}
        t={t}
        lang={lang}
        themeColor="cyan"
      />

      <div className="space-y-4">
        <h2 className="font-heading text-lg font-bold text-white tracking-tight">
          {t('fishStock')}
        </h2>        {fish.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/[0.08] py-16 text-center bg-white/[0.01] backdrop-blur-sm px-4">
            <Fish className="mx-auto text-cyan-400/30 animate-pulse mb-3" size={28} />
            <h3 className="text-sm font-bold text-white mb-1">
              {lang === 'en' ? 'No Fish Stocked' : 'Tidak Ada Stok Ikan'}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              {lang === 'en' 
                ? 'No fish stock found in the pond. Use the stocking form on the left to add your first batch.' 
                : 'Belum ada stok ikan di kolam database Supabase. Gunakan form tebar di sebelah kiri untuk menambahkan bibit ikan pertama Anda.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Header row (hidden on mobile, visible on desktop) */}
            <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground/60 select-none">
              <div className="col-span-3">{lang === 'en' ? 'Fish Species' : 'Jenis Ikan'}</div>
              <div className="col-span-2">{lang === 'en' ? 'Stock (Qty)' : 'Jumlah Stok'}</div>
              <div className="col-span-2">{lang === 'en' ? 'Density Status' : 'Kepadatan Kolam'}</div>
              <div className="col-span-2">{lang === 'en' ? 'Stocked Date' : 'Tanggal Tebar'}</div>
              <div className="col-span-3 text-right">Aksi</div>
            </div>

            <AnimatePresence>
              {fish.map((f, index) => {
                const density = getDensityStatus(f.quantity)
                const isEditing = editingId === f.id

                return (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: Math.min(index * 0.02, 0.2) }}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center rounded-2xl border border-white/[0.07] bg-white/[0.01] hover:bg-white/[0.025] p-5 sm:px-6 sm:py-4.5 hover:border-cyan-500/40 hover:shadow-[0_4px_20px_rgba(6,182,212,0.04)] transition-all duration-300 group border-l-2 hover:border-l-cyan-500"
                  >
                    {/* Fish Species */}
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-white/[0.08] shadow-inner bg-black/10">
                        <Image
                          src="/images/pharma_fish_koi.jpg"
                          alt={f.type}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                      <div>
                        <span className="block text-[9px] font-bold text-muted-foreground/50 sm:hidden uppercase tracking-widest mb-0.5">Jenis Ikan</span>
                        <span className="font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors">{fishName(f.type)}</span>
                      </div>
                    </div>

                    {/* Stock Qty */}
                    <div className="col-span-2">
                      <span className="block text-[9px] font-bold text-muted-foreground/50 sm:hidden uppercase tracking-widest mb-0.5">Jumlah Stok</span>
                      {isEditing ? (
                        <input
                          type="number"
                          min={0}
                          value={editQty}
                          onChange={(evt) => setEditQty(Math.max(0, Number(evt.target.value) || 0))}
                          className="w-16 rounded border border-cyan-500/50 bg-black/40 px-1.5 py-0.5 text-center text-xs font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                        />
                      ) : (
                        <span className="font-mono text-xs font-extrabold text-white flex items-center gap-1.5">
                          <span>{f.quantity} {t('units')}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(f.id)
                              setEditQty(f.quantity)
                            }}
                            className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-cyan-400 transition-all p-0.5 cursor-pointer"
                            title="Edit"
                          >
                            <Pencil size={11} />
                          </button>
                        </span>
                      )}
                    </div>

                    {/* Density Status */}
                    <div className="col-span-2">
                      <span className="block text-[9px] font-bold text-muted-foreground/50 sm:hidden uppercase tracking-widest mb-0.5">Kepadatan Kolam</span>
                      <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${density.style}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse mr-1.5" />
                        {density.label}
                      </span>
                    </div>

                    {/* Stocked Date */}
                    <div className="col-span-2 text-xs text-muted-foreground/80 font-medium">
                      <span className="block text-[9px] font-bold text-muted-foreground/50 sm:hidden uppercase tracking-widest mb-0.5">Tanggal Tebar</span>
                      {new Date(f.addedAt).toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID', {
                        dateStyle: 'medium',
                      })}
                    </div>

                    {/* Actions */}
                    <div className="col-span-3 flex justify-end gap-1.5">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateEntry(f.id, editQty)
                              setEditingId(null)
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-emerald-400 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 transition-all cursor-pointer"
                            title="Simpan"
                          >
                            <Check size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer"
                            title="Batal"
                          >
                            <X size={13} />
                          </button>
                        </>
                      ) : (
                        <div className="inline-flex gap-2 items-center">
                          {/* Panen Gizi Action */}
                          <button
                            type="button"
                            onClick={() => handleHarvest(f.id, f.quantity)}
                            disabled={f.quantity <= 0}
                            className="group relative inline-flex items-center justify-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/10 transition-all enabled:hover:scale-[1.02] enabled:active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <span className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-[220%] transition-transform duration-500" />
                            <span className="relative">{lang === 'en' ? 'Harvest Diet' : 'Panen Gizi'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(f.id)
                              setEditQty(f.quantity)
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-white/5 hover:text-cyan-400 transition-colors border border-transparent hover:border-white/10 cursor-pointer"
                            title="Edit"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemove(f.id)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-colors border border-transparent hover:border-destructive/20 cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

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
    </div>
  )
}

/* ---------------------------- Requests ---------------------------- */

function RequestsTab({
  requests,
  onDecide,
  lang,
  t,
}: {
  requests: import('@/lib/store').DoctorRequest[]
  onDecide: (id: string, approve: boolean) => void
  lang: 'id' | 'en'
  t: (k: string) => string
}) {
  const pending = requests.filter((r) => r.status === 'pending')
  const processed = requests
    .filter((r) => r.status !== 'pending')
    .sort((a, b) => (b.decidedAt ?? 0) - (a.decidedAt ?? 0))

  return (
    <div className="grid gap-8">
      <section className="space-y-4">
        <h2 className="font-heading text-lg font-bold text-white tracking-tight">
          {t('pendingRequests')}{' '}
          <span className="text-white/40 font-medium">({pending.length})</span>
        </h2>
        {pending.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/[0.08] py-16 text-center bg-white/[0.01] backdrop-blur-sm px-4">
            <Bell className="mx-auto text-amber-400/30 animate-pulse mb-3" size={28} />
            <h3 className="text-sm font-bold text-white mb-1">
              {lang === 'en' ? 'No Pending Requests' : 'Tidak Ada Permintaan Tertunda'}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              {lang === 'en' 
                ? 'No harvest requests from doctors are currently pending.' 
                : 'Belum ada permintaan panen dari dokter yang tertunda saat ini.'}
            </p>
          </div>
        ) : (
          <ul className="grid gap-3">
            <AnimatePresence initial={false}>
              {pending.map((r) => (
                <motion.li
                  key={r.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-4 rounded-xl border border-amber-500/20 bg-white/[0.02] p-5 sm:flex-row sm:items-center sm:justify-between shadow-md hover:bg-white/[0.04] hover:border-amber-500/30 transition-all duration-200 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    {/* Doctor request creator avatar */}
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-amber-500/20 shadow-md bg-black/10">
                      <Image
                        src="/images/role_doctor.jpg"
                        alt="Doctor request avatar"
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-xs font-semibold text-cyan-400">
                          <Leaf size={11} /> {plantName(r.plant, lang)}
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
                      <p className="mt-1.5 text-xs text-muted-foreground/80">
                        {t('from')}:{' '}
                        <span className="font-semibold text-white/80">
                          {r.doctorName}
                        </span>{' '}
                        ·{' '}
                        <span className="text-muted-foreground/60 font-medium">
                          {new Date(r.createdAt).toLocaleString(
                            lang === 'en' ? 'en-US' : 'id-ID',
                            { dateStyle: 'medium', timeStyle: 'short' },
                          )}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => onDecide(r.id, true)}
                      className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/10 hover:scale-[1.02] active:scale-98 transition-all"
                    >
                      <span className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-[220%] transition-transform duration-500" />
                      <Check size={14} strokeWidth={2.5} /> {t('approve')}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDecide(r.id, false)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-xs font-bold text-white hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all"
                    >
                      <X size={14} strokeWidth={2.5} /> {t('decline')}
                    </button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </section>

      {processed.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-heading text-lg font-bold text-white tracking-tight">
            {t('processedRequests')}
          </h2>
          <ul className="grid gap-2">
            {processed.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.01] px-4 py-3 backdrop-blur-sm"
              >
                <div className="min-w-0">
                  <span className="text-sm font-bold text-white">
                    {plantName(r.plant, lang)}
                  </span>
                  <span className="ml-2.5 text-xs text-muted-foreground/80">
                    {(() => {
                      const rem = REMEDIES.find((rx) => rx.id === r.remedyId)
                      return lang === 'en' ? (rem?.complaintEn ?? r.complaint) : r.complaint
                    })()} · {r.doctorName}
                  </span>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                    r.status === 'approved'
                      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.05)]'
                      : 'border-red-500/20 bg-red-500/10 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.05)]'
                  }`}
                >
                  {t(r.status)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

/* --------------------------- Shared bits --------------------------- */

function EmptyState({
  label,
  icon: Icon,
}: {
  label: string
  icon: typeof Leaf
}) {
  return (
    <div className="grid place-items-center rounded-xl border border-dashed border-white/[0.08] py-14 text-center bg-white/[0.01]">
      <Icon size={24} className="text-white/20" />
      <p className="mt-3 text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">{label}</p>
    </div>
  )
}

function AddCard({
  title,
  icon: Icon,
  searchPlaceholder,
  selectLabel,
  options,
  addLabel,
  quantityLabel,
  onAdd,
  t,
  lang,
  themeColor = 'violet',
}: {
  title: string
  icon: typeof Leaf
  searchPlaceholder: string
  selectLabel: string
  options: { value: string; label: string; hint?: string }[]
  addLabel: string
  quantityLabel: string
  onAdd: (value: string, qty: number, date?: number) => void
  t: (k: string) => string
  lang: 'id' | 'en'
  themeColor?: 'violet' | 'cyan'
}) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [qty, setQty] = useState(1)
  const [dateStr, setDateStr] = useState(() => new Date().toISOString().split('T')[0])

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.trim().toLowerCase()),
  )
  const selectedOption = options.find((o) => o.value === selected)

  function submit() {
    if (!selected || qty < 1) return
    const customTime = dateStr ? new Date(dateStr).getTime() : Date.now()
    onAdd(selected, qty, customTime)
    setSelected(null)
    setQuery('')
    setQty(1)
    setDateStr(new Date().toISOString().split('T')[0])
  }

  const focusRingClass = themeColor === 'violet'
    ? 'focus-within:ring-violet-500/25 focus-within:border-violet-500/50'
    : 'focus-within:ring-cyan-500/25 focus-within:border-cyan-500/50'

  const btnGradClass = themeColor === 'violet'
    ? 'from-violet-500 to-purple-600 shadow-violet-500/20 hover:shadow-violet-500/40 text-white'
    : 'from-cyan-500 to-teal-600 shadow-cyan-500/20 hover:shadow-cyan-500/40 text-white'

  const cardBorderClass = themeColor === 'violet'
    ? 'hover:border-violet-500/30 hover:shadow-[0_0_40px_rgba(139,92,246,0.06)]'
    : 'hover:border-cyan-500/30 hover:shadow-[0_0_40px_rgba(6,182,212,0.06)]'

  return (
    <div className={`h-fit rounded-3xl border border-white/[0.08] bg-white/[0.015] p-6 lg:sticky lg:top-[110px] shadow-2xl backdrop-blur-md transition-all duration-300 ${cardBorderClass}`}>
      
      {/* 3D Cyberpunk Banner Illustration */}
      <div className="relative mb-5 overflow-hidden rounded-2xl border border-white/[0.05] bg-black/10 aspect-[16/10] shadow-inner select-none">
        <Image
          src={themeColor === 'violet' ? '/images/role_pharmacist.jpg' : '/images/pharma_fish_koi.jpg'}
          alt="Pharmacist card banner illustration"
          fill
          className="object-cover transition-transform duration-700 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span className={`grid h-8 w-8 place-items-center rounded-xl border ${
            themeColor === 'violet' ? 'bg-violet-500/20 border-violet-500/30 text-violet-300' : 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300'
          } backdrop-blur-md`}>
            <Icon size={14} />
          </span>
          <h2 className="font-heading text-sm font-extrabold text-white tracking-tight drop-shadow-md">
            {title}
          </h2>
        </div>
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
          {selectLabel}
        </label>
        <div className={`relative rounded-xl border border-white/[0.07] bg-[#070e17]/50 ${focusRingClass} focus-within:ring-2 transition-all duration-200`}>
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
          />
          <input
            type="text"
            value={selectedOption ? selectedOption.label : query}
            onChange={(e) => {
              setSelected(null)
              setQuery(e.target.value)
            }}
            placeholder={searchPlaceholder}
            className="w-full bg-transparent py-3 pl-10 pr-3.5 text-xs text-white placeholder:text-white/30 outline-none"
          />
        </div>

        {!selectedOption && query.trim() !== '' && (
          <ul className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-white/[0.08] bg-[#070e17] shadow-xl">
            {filtered.length === 0 ? (
              <li className="px-3.5 py-3 text-xs text-muted-foreground/60">
                {t('noResults')}
              </li>
            ) : (
              filtered.map((o) => (
                <li key={o.value}>
                  <button
                     type="button"
                     onClick={() => {
                       setSelected(o.value)
                       setQuery('')
                     }}
                     className="flex w-full flex-col items-start border-b border-white/[0.05] px-3.5 py-2.5 text-left hover:bg-white/[0.03] transition-colors last:border-0"
                   >
                     <span className="text-xs font-bold text-white">
                       {o.label}
                     </span>
                     {o.hint && (
                       <span className="text-[10px] text-muted-foreground/80 mt-0.5">
                         {o.hint}
                       </span>
                     )}
                   </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      <div className="mt-4">
        <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
          {quantityLabel}
        </label>
        <input
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
          className={`w-full rounded-xl border border-white/[0.07] bg-[#070e17]/50 px-3.5 py-3 text-xs text-white outline-none focus:ring-2 focus:outline-none transition-all duration-200 ${
            themeColor === 'violet' ? 'focus:ring-violet-500/20 focus:border-violet-500/40' : 'focus:ring-cyan-500/20 focus:border-cyan-500/40'
          }`}
        />
      </div>

      <div className="mt-4">
        <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
          {themeColor === 'violet' ? (lang === 'en' ? 'Planting Date' : 'Tanggal Tanam') : (lang === 'en' ? 'Stocked Date' : 'Tanggal Tebar')}
        </label>
        <input
          type="date"
          value={dateStr}
          onChange={(e) => setDateStr(e.target.value)}
          className={`w-full rounded-xl border border-white/[0.07] bg-[#070e17]/50 px-3.5 py-3 text-xs text-white outline-none focus:ring-2 focus:outline-none transition-all duration-200 ${
            themeColor === 'violet' ? 'focus:ring-violet-500/20 focus:border-violet-500/40' : 'focus:ring-cyan-500/20 focus:border-cyan-500/40'
          } [color-scheme:dark]`}
        />
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={!selected}
        className={`group relative mt-6 inline-flex w-full items-center justify-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-r px-4 py-3 text-xs font-bold transition-all enabled:hover:scale-[1.015] enabled:active:scale-98 disabled:cursor-not-allowed disabled:opacity-40 ${btnGradClass}`}
      >
        <span className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-[220%] transition-transform duration-500" />
        <Plus size={14} strokeWidth={2.5} /> <span className="relative">{addLabel}</span>
      </button>
    </div>
  )
}

export default function PharmacistPage() {
  return (
    <RoleGuard role="pharmacist">
      <PharmacistContent />
    </RoleGuard>
  )
}
