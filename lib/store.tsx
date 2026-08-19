'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { getPlantProfile, REMEDIES } from '@/lib/data'
import { type Lang, translate } from '@/lib/i18n'
import { supabase } from '@/lib/supabase'

export type Role = 'doctor' | 'pharmacist' | 'technician'
export type Theme = 'dark' | 'light'
export type PlantStatus = 'ready' | 'inGrowth' | 'outOfStock'

const DAY = 24 * 60 * 60 * 1000

export type CatalogEntry = {
  id: string
  plant: string
  quantity: number
  plantedAt: number
  growDays: number
}

export type FishEntry = {
  id: string
  type: string
  quantity: number
  addedAt: number
}

export type DoctorRequest = {
  id: string
  doctorName: string
  remedyId: string
  plant: string
  complaint: string
  status: 'pending' | 'approved' | 'declined'
  createdAt: number
  decidedAt?: number
}

export type FeedSchedule = { id: string; time: string }

export type Sensors = {
  turbidity: number // NTU
  feedLevel: number // %
  waterLevel: number // %
}

type User = { id?: string; role: Role; name: string; email?: string }

type AppState = {
  // chrome
  theme: Theme
  toggleTheme: () => void
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
  // auth
  user: User | null
  login: (role: Role, customName?: string, email?: string, id?: string) => void
  logout: () => void
  // data
  catalog: CatalogEntry[]
  fish: FishEntry[]
  requests: DoctorRequest[]
  addCatalogPlant: (plant: string, quantity: number, plantedAt?: number) => void
  removeCatalogEntry: (id: string) => void
  updateCatalogEntry: (id: string, quantity: number) => void
  addFish: (type: string, quantity: number, addedAt?: number) => void
  removeFish: (id: string) => void
  updateFishQuantity: (id: string, diff: number) => void
  updateFishEntry: (id: string, quantity: number) => void
  requestHarvest: (remedyId: string) => void
  decideRequest: (id: string, approve: boolean) => void
  cancelRequest: (id: string) => void
  plantStatus: (plant: string) => PlantStatus
  entryEtaDays: (entry: CatalogEntry) => number
  // technician
  sensors: Sensors
  feedSchedules: FeedSchedule[]
  addFeedSchedule: (time: string) => void
  removeFeedSchedule: (id: string) => void
  updateFeedSchedule: (id: string, time: string) => void
  manualFeed: () => void
  refillDispenser: () => void
  growLightEnabled: boolean
  toggleGrowLightEnabled: () => void
  growLightFrom: string
  growLightTo: string
  setGrowLightRange: (from: string, to: string) => void
  growLightManualOn: boolean
  toggleGrowLightManual: () => void
  isLightOn: boolean
  flowOn: boolean
  drainOn: boolean
  fillOn: boolean
  togglePump: (which: 'drain' | 'fill' | 'flow') => void
  changeWater: () => void
  isEspConnected: boolean
  espLastSeen: string | null
}

const AppContext = createContext<AppState | null>(null)

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

function seedCatalog(): CatalogEntry[] {
  const now = Date.now()
  const mk = (plant: string, quantity: number, ageDays: number): CatalogEntry => {
    const profile = getPlantProfile(plant)
    return {
      id: uid(),
      plant,
      quantity,
      plantedAt: now - ageDays * DAY,
      growDays: profile?.growDays ?? 30,
    }
  }
  return [
    mk('Brokoli', 12, 92), // ready (80d)
    mk('Bayam', 18, 41), // ready (35d)
    mk('Kale', 10, 60), // ready (55d)
    mk('Microgreens', 40, 12), // ready (10d)
    mk('Selada', 24, 9), // in growth (30d)
    mk('Daun mint', 8, 5), // in growth (21d)
    mk('Tomat ceri', 6, 20), // in growth (70d)
  ]
}

function seedRequests(): DoctorRequest[] {
  const now = Date.now()
  const r = REMEDIES.find((x) => x.id === 'r6')!
  return [
    {
      id: uid(),
      doctorName: 'dr. Anindya',
      remedyId: r.id,
      plant: r.plant,
      complaint: r.complaintId,
      status: 'pending',
      createdAt: now - 3 * 60 * 60 * 1000,
    },
  ]
}

const ROLE_NAMES: Record<Role, string> = {
  doctor: 'dr. Raka Pratama',
  pharmacist: 'Apt. Sinta Dewi',
  technician: 'Teknisi Bagas',
}

const isSupabaseConfigured =
  typeof window !== 'undefined' &&
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder-url.supabase.co' &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder-key'

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')
  const [lang, setLang] = useState<Lang>('id')
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cureflow_user')
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch (e) {
          return null
        }
      }
    }
    return null
  })

  const [catalog, setCatalog] = useState<CatalogEntry[]>([])
  const [fish, setFish] = useState<FishEntry[]>([])
  const [requests, setRequests] = useState<DoctorRequest[]>([])

  const lastFeedTrigger = useRef<string>('')
  // Guard untuk mencegah race condition antara polling dan Supabase Realtime
  const isFetchingRef = useRef(false)

  // technician state
  const [sensors, setSensors] = useState<Sensors>({
    turbidity: 10,
    feedLevel: 100,
    waterLevel: 80,
  })
  const [feedSchedules, setFeedSchedules] = useState<FeedSchedule[]>([])
  const [manualFeedUntil, setManualFeedUntil] = useState<number | null>(null)
  const [growLightEnabled, setGrowLightEnabled] = useState(true)
  const [growLightFrom, setGrowLightFrom] = useState('06:00')
  const [growLightTo, setGrowLightTo] = useState('18:00')
  const [growLightManualOn, setGrowLightManualOn] = useState(true)
  const [flowOn, setFlowOn] = useState(true)
  const [drainOn, setDrainOn] = useState(false)
  const [fillOn, setFillOn] = useState(false)
  const [espLastSeen, setEspLastSeen] = useState<string | null>(null)
  const [nowTick, setNowTick] = useState<number>(Date.now())

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTick(Date.now())
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  const isEspConnected = useMemo(() => {
    if (!espLastSeen) return false
    const diffMs = nowTick - new Date(espLastSeen).getTime()
    return diffMs < 20000 // Terhubung jika ESP32 mengirim heartbeat dalam 20 detik terakhir
  }, [espLastSeen, nowTick])

  // Computed: check if grow light should be ON
  const isLightOn = useMemo(() => {
    if (!growLightEnabled) return growLightManualOn
    
    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    
    const parseMinutes = (timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number)
      return h * 60 + m
    }
    
    const startMin = parseMinutes(growLightFrom)
    const endMin = parseMinutes(growLightTo)
    
    if (startMin <= endMin) {
      return currentMinutes >= startMin && currentMinutes <= endMin
    } else {
      return currentMinutes >= startMin || currentMinutes <= endMin
    }
  }, [growLightEnabled, growLightManualOn, growLightFrom, growLightTo])

  // apply theme class
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark', 'light')
    root.classList.add(theme)
  }, [theme])

  // Computed: Determine if current session is demo mode or real account
  const isDemo = useMemo(() => {
    if (!user) return true
    if (!user.email) return true
    const demoEmails = ['doctor@cureflow.com', 'pharmacist@cureflow.com', 'technician@cureflow.com']
    return demoEmails.includes(user.email.toLowerCase())
  }, [user])

  // Populate mock data ONLY in demo mode when Supabase is not configured
  useEffect(() => {
    if (isDemo) {
      if (!isSupabaseConfigured) {
        setCatalog(seedCatalog())
        setFish([
          { id: 'fish-nila', type: 'nila', quantity: 45, addedAt: Date.now() - 30 * DAY },
          { id: 'fish-lele', type: 'lele', quantity: 30, addedAt: Date.now() - 20 * DAY },
        ])
        setRequests(seedRequests())
        setFeedSchedules([
          { id: 'feed-1', time: '07:00' },
          { id: 'feed-2', time: '12:00' },
          { id: 'feed-3', time: '18:00' },
        ])
        setSensors({
          turbidity: 12,
          feedLevel: 68,
          waterLevel: 74,
        })
      }
    } else {
      setCatalog([])
      setFish([])
      setRequests([])
      setFeedSchedules([])
      setSensors({
        turbidity: 10,
        feedLevel: 100,
        waterLevel: 80,
      })
    }
  }, [isDemo])

  // Custom session verification
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cureflow_user')
      if (stored) {
        try {
          setUser(JSON.parse(stored))
        } catch (e) {
          setUser(null)
        }
      }
    }
  }, [])
  // Fetch data from Supabase and subscribe to changes if configured
  useEffect(() => {
    if (!isSupabaseConfigured) return
    if (!user) return

    const catalogTable = isDemo ? 'demo_catalog' : 'catalog'
    const fishTable = isDemo ? 'demo_fish_stock' : 'fish_stock'
    const requestsTable = isDemo ? 'demo_doctor_requests' : 'doctor_requests'

    const fetchData = async () => {
      // Guard: skip jika request sebelumnya masih berjalan (mencegah race condition)
      if (isFetchingRef.current) return
      isFetchingRef.current = true
      try {
        // Fetch catalog
        const { data: catData } = await supabase.from(catalogTable).select('*')
        if (catData) {
          if (isDemo && catData.length === 0) {
            const seeds = seedCatalog()
            await supabase.from('demo_catalog').insert(
              seeds.map((s) => ({
                id: s.id,
                plant: s.plant,
                quantity: s.quantity,
                planted_at: s.plantedAt,
                grow_days: s.growDays,
              })),
            )
            setCatalog(seeds)
          } else {
            setCatalog(
              catData.map((e) => ({
                id: e.id,
                plant: e.plant,
                quantity: e.quantity,
                plantedAt: Number(e.planted_at),
                growDays: e.grow_days,
              })),
            )
          }
        }

        // Fetch fish
        const { data: fishData } = await supabase.from(fishTable).select('*')
        if (fishData) {
          if (isDemo && fishData.length === 0) {
            const seeds = [
              { id: 'fish-nila', type: 'nila', quantity: 45, addedAt: Date.now() - 30 * DAY },
              { id: 'fish-lele', type: 'lele', quantity: 30, addedAt: Date.now() - 20 * DAY },
            ]
            await supabase.from('demo_fish_stock').insert(
              seeds.map((f) => ({
                id: f.id,
                type: f.type,
                quantity: f.quantity,
                added_at: f.addedAt,
              })),
            )
            setFish(seeds)
          } else {
            setFish(
              fishData.map((x) => ({
                id: x.id,
                type: x.type,
                quantity: x.quantity,
                addedAt: Number(x.added_at),
              })),
            )
          }
        }

        // Fetch requests
        const { data: reqData } = await supabase.from(requestsTable).select('*')
        if (reqData) {
          if (isDemo && reqData.length === 0) {
            const seeds = seedRequests()
            await supabase.from('demo_doctor_requests').insert(
              seeds.map((r) => ({
                id: r.id,
                doctor_name: r.doctorName,
                remedy_id: r.remedyId,
                plant: r.plant,
                complaint: r.complaint,
                status: r.status,
                created_at: r.createdAt,
              })),
            )
            setRequests(seeds)
          } else {
            setRequests(
              reqData.map((r) => ({
                id: r.id,
                doctorName: r.doctor_name,
                remedyId: r.remedy_id,
                plant: r.plant,
                complaint: r.complaint,
                status: r.status as 'pending' | 'approved' | 'declined',
                createdAt: Number(r.created_at),
                decidedAt: r.decided_at ? Number(r.decided_at) : undefined,
              })),
            )
          }
        }

        // Fetch unified sensor readings & schedules
        if (user?.id) {
          const { data: reading } = await supabase
            .from('sensor_readings')
            .select('*')
            .eq('user_id', user.id)
            .single()

          if (reading) {
            if (reading.updated_at) {
              setEspLastSeen(reading.updated_at)
            }
            setSensors({
              turbidity: reading.turbidity,
              feedLevel: reading.food_level,
              waterLevel: reading.water_level,
            })
            if (reading.times) {
              setFeedSchedules(
                reading.times.map((t: string, idx: number) => ({
                  id: `f-${idx}`,
                  time: t,
                })),
              )
            }
            setFlowOn(reading.pump_flow)
            setDrainOn(reading.pump_drain)
            setFillOn(reading.pump_add)
            setGrowLightEnabled(reading.mode === 'auto')
            setGrowLightManualOn(reading.grow_light)
            if (reading.grow_light_from) {
              setGrowLightFrom(reading.grow_light_from)
            }
            if (reading.grow_light_to) {
              setGrowLightTo(reading.grow_light_to)
            }
          }
        }
      } catch (err) {
        console.error('Supabase fetch failed:', err)
      } finally {
        isFetchingRef.current = false // Selalu lepas lock, bahkan jika error
      }
    }

    fetchData()

    // 2-second polling fallback to guarantee real-time sensor updates
    const pollInterval = setInterval(() => {
      fetchData()
    }, 2000)

    // Supabase Realtime channel subscription
    const channel = supabase
      .channel('cureflow-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: catalogTable }, () => {
        fetchData()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: fishTable }, () => {
        fetchData()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: requestsTable }, () => {
        fetchData()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sensor_readings' }, () => {
        fetchData()
      })
      .subscribe()

    return () => {
      clearInterval(pollInterval)
      supabase.removeChannel(channel)
    }
  }, [user, isDemo])

  // simulate live sensor data ONLY in mock demo mode when Supabase is NOT configured
  useEffect(() => {
    if (isSupabaseConfigured) return

    const clamp = (v: number, lo: number, hi: number) =>
      Math.max(lo, Math.min(hi, v))
    const id = setInterval(() => {
      const nowTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
      const matchingSchedule = feedSchedules.find((x) => x.time === nowTime)
      let scheduleFed = false
      if (matchingSchedule && lastFeedTrigger.current !== nowTime) {
        lastFeedTrigger.current = nowTime
        scheduleFed = true
      }

      setSensors((s) => {
        // Feed dispenser level drops slowly over time
        let feed = s.feedLevel - Math.random() * 0.05
        // If scheduled feeding is triggered, dispenser drops significantly
        if (scheduleFed) {
          feed = Math.max(0, feed - 12)
        }
        
        let water = s.waterLevel
        // Safety interlocks feedback: drain reduces, fill increases water level consistently
        if (drainOn) water -= 1.8 + Math.random() * 0.5
        if (fillOn) water += 1.8 + Math.random() * 0.5
        
        // Add tiny natural fluctuations
        water += (Math.random() - 0.5) * 0.2
        
        // Turbidity logic: spikes when fed, slowly decays back to normal (10) otherwise
        let targetTurbidity = 10
        if (drainOn) targetTurbidity = 4
        if (fillOn) targetTurbidity = 12
        
        let currentTurb = s.turbidity
        if (scheduleFed) {
          currentTurb = Math.min(100, currentTurb + 22)
        }
        
        const turbidityDiff = targetTurbidity - currentTurb
        const turbidity = currentTurb + turbidityDiff * 0.08 + (Math.random() - 0.5) * 0.4
        
        const nextSensors = {
          feedLevel: clamp(feed, 0, 100),
          waterLevel: clamp(water, 0, 100),
          turbidity: clamp(turbidity, 1, 80),
        }

        return nextSensors
      })
    }, 2500)
    return () => clearInterval(id)
  }, [drainOn, fillOn, feedSchedules, isDemo])

  const toggleTheme = useCallback(
    () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
    [],
  )

  const t = useCallback((key: string) => translate(key, lang), [lang])

  const login = useCallback((role: Role, customName?: string, email?: string, id?: string) => {
    const name = customName && customName.trim().length > 0 ? customName.trim() : ROLE_NAMES[role]
    const newUser = { id, role, name, email }
    setUser(newUser)
    if (typeof window !== 'undefined') {
      localStorage.setItem('cureflow_user', JSON.stringify(newUser))
    }
  }, [])

  const logout = useCallback(async () => {
    setUser(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cureflow_user')
    }
  }, [])

  const addCatalogPlant = useCallback(async (plant: string, quantity: number, plantedAt?: number) => {
    const newId = uid()
    const pAt = plantedAt ?? Date.now()
    const profile = getPlantProfile(plant)
    const growDays = profile?.growDays ?? 30
    
    if (isSupabaseConfigured) {
      try {
        await supabase.from(isDemo ? 'demo_catalog' : 'catalog').insert({
          id: newId,
          plant,
          quantity,
          planted_at: pAt,
          grow_days: growDays
        })
      } catch (err) {
        console.error('addCatalogPlant error:', err)
      }
    }
    
    setCatalog((c) => [
      {
        id: newId,
        plant,
        quantity,
        plantedAt: pAt,
        growDays,
      },
      ...c,
    ])
  }, [isDemo])

  const removeCatalogEntry = useCallback(async (id: string) => {
    if (isSupabaseConfigured) {
      try {
        await supabase.from(isDemo ? 'demo_catalog' : 'catalog').delete().eq('id', id)
      } catch (err) {
        console.error('removeCatalogEntry error:', err)
      }
    }
    setCatalog((c) => c.filter((e) => e.id !== id))
  }, [isDemo])

  const updateCatalogEntry = useCallback(async (id: string, quantity: number) => {
    const qty = Math.max(1, quantity)
    if (isSupabaseConfigured) {
      try {
        await supabase.from(isDemo ? 'demo_catalog' : 'catalog').update({ quantity: qty }).eq('id', id)
      } catch (err) {
        console.error('updateCatalogEntry error:', err)
      }
    }
    setCatalog((c) =>
      c.map((e) => (e.id === id ? { ...e, quantity: qty } : e))
    )
  }, [isDemo])

  const addFish = useCallback(async (type: string, quantity: number, addedAt?: number) => {
    const newId = uid()
    const aAt = addedAt ?? Date.now()
    
    if (isSupabaseConfigured) {
      try {
        await supabase.from(isDemo ? 'demo_fish_stock' : 'fish_stock').insert({
          id: newId,
          type,
          quantity,
          added_at: aAt
        })
      } catch (err) {
        console.error('addFish error:', err)
      }
    }
    
    setFish((f) => [
      { id: newId, type, quantity, addedAt: aAt },
      ...f,
    ])
  }, [isDemo])

  const removeFish = useCallback(async (id: string) => {
    if (isSupabaseConfigured) {
      try {
        await supabase.from(isDemo ? 'demo_fish_stock' : 'fish_stock').delete().eq('id', id)
      } catch (err) {
        console.error('removeFish error:', err)
      }
    }
    setFish((f) => f.filter((e) => e.id !== id))
  }, [isDemo])

  const updateFishQuantity = useCallback(async (id: string, diff: number) => {
    setFish((prev) => {
      const target = prev.find((x) => x.id === id)
      if (!target) return prev
      const nextQty = Math.max(0, target.quantity + diff)
      if (isSupabaseConfigured) {
        supabase.from(isDemo ? 'demo_fish_stock' : 'fish_stock').update({ quantity: nextQty }).eq('id', id).then()
      }
      return prev.map((f) => (f.id === id ? { ...f, quantity: nextQty } : f))
    })
  }, [isDemo])

  const updateFishEntry = useCallback(async (id: string, quantity: number) => {
    const qty = Math.max(0, quantity)
    if (isSupabaseConfigured) {
      try {
        await supabase.from(isDemo ? 'demo_fish_stock' : 'fish_stock').update({ quantity: qty }).eq('id', id)
      } catch (err) {
        console.error('updateFishEntry error:', err)
      }
    }
    setFish((prev) =>
      prev.map((f) => (f.id === id ? { ...f, quantity: qty } : f))
    )
  }, [isDemo])

  const requestHarvest = useCallback(async (remedyId: string) => {
    const remedy = REMEDIES.find((r) => r.id === remedyId)
    if (!remedy) return
    const doctorName = user?.name ?? ROLE_NAMES.doctor
    const newId = uid()
    const createdAt = Date.now()
    
    if (isSupabaseConfigured) {
      try {
        await supabase.from(isDemo ? 'demo_doctor_requests' : 'doctor_requests').insert({
          id: newId,
          doctor_name: doctorName,
          remedy_id: remedyId,
          plant: remedy.plant,
          complaint: remedy.complaintId,
          status: 'pending',
          created_at: createdAt
        })
      } catch (err) {
        console.error('requestHarvest error:', err)
      }
    }
    
    setRequests((rs) => [
      {
        id: newId,
        doctorName,
        remedyId,
        plant: remedy.plant,
        complaint: remedy.complaintId,
        status: 'pending',
        createdAt,
      },
      ...rs,
    ])
  }, [user, isDemo])

  const decideRequest = useCallback(async (id: string, approve: boolean) => {
    const decidedAt = Date.now()
    if (isSupabaseConfigured) {
      try {
        await supabase.from(isDemo ? 'demo_doctor_requests' : 'doctor_requests').update({
          status: approve ? 'approved' : 'declined',
          decided_at: decidedAt
        }).eq('id', id)
      } catch (err) {
        console.error('decideRequest error:', err)
      }
    }

    const targetReq = requests.find((r) => r.id === id)
    if (approve && targetReq && targetReq.status === 'pending') {
      setCatalog((c) => {
        const readyEntries = c.filter(
          (e) => e.plant === targetReq.plant && Date.now() >= e.plantedAt + e.growDays * DAY,
        )
        if (readyEntries.length === 0) return c
        const sorted = [...readyEntries].sort((a, b) => a.plantedAt - b.plantedAt)
        const target = sorted[0]
        const nextQty = target.quantity - 1
        
        if (isSupabaseConfigured) {
          if (nextQty <= 0) {
            supabase.from(isDemo ? 'demo_catalog' : 'catalog').delete().eq('id', target.id).then()
          } else {
            supabase.from(isDemo ? 'demo_catalog' : 'catalog').update({ quantity: nextQty }).eq('id', target.id).then()
          }
        }
        
        return c
          .map((e) =>
            e.id === target.id
              ? { ...e, quantity: nextQty }
              : e,
          )
          .filter((e) => e.quantity > 0)
      })
    }
    
    setRequests((rs) =>
      rs.map((r) =>
        r.id === id
          ? {
              ...r,
              status: approve ? 'approved' : 'declined',
              decidedAt,
            }
          : r
      )
    )
  }, [requests, isDemo])

  const cancelRequest = useCallback(async (id: string) => {
    if (isSupabaseConfigured) {
      try {
        await supabase.from(isDemo ? 'demo_doctor_requests' : 'doctor_requests').delete().eq('id', id)
      } catch (err) {
        console.error('cancelRequest error:', err)
      }
    }
    setRequests((rs) => rs.filter((r) => r.id !== id))
  }, [isDemo])

  const entryEtaDays = useCallback((entry: CatalogEntry) => {
    const readyAt = entry.plantedAt + entry.growDays * DAY
    return Math.ceil((readyAt - Date.now()) / DAY)
  }, [])

  const plantStatus = useCallback(
    (plant: string): PlantStatus => {
      const entries = catalog.filter((e) => e.plant === plant)
      if (entries.length === 0) return 'outOfStock'
      const anyReady = entries.some(
        (e) => Date.now() >= e.plantedAt + e.growDays * DAY,
      )
      return anyReady ? 'ready' : 'inGrowth'
    },
    [catalog],
  )

  const addFeedSchedule = useCallback(async (time: string) => {
    const newId = uid()
    const nextSchedules = [...feedSchedules, { id: newId, time }].sort((a, b) => a.time.localeCompare(b.time))
    
    if (isSupabaseConfigured && user?.id) {
      try {
        await supabase
          .from('sensor_readings')
          .update({
            times: nextSchedules.map((s) => s.time),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
      } catch (err) {
        console.error('addFeedSchedule error:', err)
      }
    }
    setFeedSchedules(nextSchedules)
  }, [feedSchedules, user])

  const removeFeedSchedule = useCallback(async (id: string) => {
    const nextSchedules = feedSchedules.filter((x) => x.id !== id)
    
    if (isSupabaseConfigured && user?.id) {
      try {
        await supabase
          .from('sensor_readings')
          .update({
            times: nextSchedules.map((s) => s.time),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
      } catch (err) {
        console.error('removeFeedSchedule error:', err)
      }
    }
    setFeedSchedules(nextSchedules)
  }, [feedSchedules, user])

  const updateFeedSchedule = useCallback(async (id: string, time: string) => {
    const nextSchedules = feedSchedules
      .map((x) => (x.id === id ? { ...x, time } : x))
      .sort((a, b) => a.time.localeCompare(b.time))
      
    if (isSupabaseConfigured && user?.id) {
      try {
        await supabase
          .from('sensor_readings')
          .update({
            times: nextSchedules.map((s) => s.time),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
      } catch (err) {
        console.error('updateFeedSchedule error:', err)
      }
    }
    setFeedSchedules(nextSchedules)
  }, [feedSchedules, user])

  const manualFeed = useCallback(async () => {
    if (isSupabaseConfigured && user?.id) {
      // Mode real: hanya kirim sinyal servo ke ESP32 via Supabase.
      // Sensor values (feedLevel, turbidity) tidak diubah di sini —
      // ESP32 akan push nilai aslinya kembali setelah servo selesai bergerak.
      try {
        await supabase
          .from('sensor_readings')
          .update({
            servo: true,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
      } catch (err) {
        console.error('manualFeed error:', err)
      }
    } else {
      // Mode demo (Supabase tidak dikonfigurasi): simulasikan perubahan sensor secara lokal
      setSensors((s) => ({
        ...s,
        feedLevel: Math.max(0, s.feedLevel - 12),
        turbidity: Math.min(80, s.turbidity + 22),
      }))
    }
  }, [user])

  const refillDispenser = useCallback(() => {
    setSensors((s) => {
      const nextSensors = { ...s, feedLevel: 100 }
      if (isSupabaseConfigured && user?.id) {
        supabase
          .from('sensor_readings')
          .update({
            food_level: 100.0,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .then()
      }
      return nextSensors
    })
  }, [user])

  const toggleGrowLightEnabled = useCallback(() => {
    setGrowLightEnabled((v) => {
      const next = !v
      if (isSupabaseConfigured && user?.id) {
        supabase.from('sensor_readings').update({
          mode: next ? 'auto' : 'manual',
          grow_light: growLightManualOn,
          updated_at: new Date().toISOString()
        }).eq('user_id', user.id).then()
      }
      return next
    })
  }, [user, growLightManualOn])

  const setGrowLightRange = useCallback(async (f: string, to: string) => {
    setGrowLightFrom(f)
    setGrowLightTo(to)
    if (isSupabaseConfigured && user?.id) {
      try {
        await supabase
          .from('sensor_readings')
          .update({
            grow_light_from: f,
            grow_light_to: to,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
      } catch (err) {
        console.error('setGrowLightRange error:', err)
      }
    }
  }, [user])

  const toggleGrowLightManual = useCallback(() => {
    setGrowLightManualOn((v) => {
      const next = !v
      if (isSupabaseConfigured && user?.id) {
        supabase.from('sensor_readings').update({
          mode: 'manual',
          grow_light: next,
          updated_at: new Date().toISOString()
        }).eq('user_id', user.id).then()
      }
      return next
    })
    setGrowLightEnabled(false)
  }, [user])

  const togglePump = useCallback(async (which: 'drain' | 'fill' | 'flow') => {
    let nextFlow = flowOn
    let nextDrain = drainOn
    let nextFill = fillOn

    if (which === 'flow') {
      nextFlow = !flowOn
    } else if (which === 'drain') {
      nextDrain = !drainOn
      if (nextDrain) nextFill = false
    } else if (which === 'fill') {
      nextFill = !fillOn
      if (nextFill) nextDrain = false
    }

    // Optimistic update: tampilkan perubahan di UI langsung tanpa menunggu Supabase
    setGrowLightEnabled(false)
    setFlowOn(nextFlow)
    setDrainOn(nextDrain)
    setFillOn(nextFill)

    if (isSupabaseConfigured && user?.id) {
      try {
        await supabase.from('sensor_readings').update({
          mode: 'manual',
          pump_flow: nextFlow,
          pump_drain: nextDrain,
          pump_add: nextFill,
          updated_at: new Date().toISOString()
        }).eq('user_id', user.id)
      } catch (err) {
        // Rollback UI ke state sebelumnya jika update ke Supabase gagal
        console.error('togglePump gagal, UI di-rollback:', err)
        setFlowOn(flowOn)
        setDrainOn(drainOn)
        setFillOn(fillOn)
      }
    }
  }, [flowOn, drainOn, fillOn, user])

  const changeWater = useCallback(async () => {
    if (isDemo) {
      setDrainOn(true)
      setFlowOn(false)
      setFillOn(false)
      setTimeout(() => {
        setDrainOn(false)
        setFillOn(true)
        setTimeout(() => {
          setFillOn(false)
          setFlowOn(true)
        }, 8000)
      }, 8000)
    }

    if (isSupabaseConfigured && user?.id) {
      try {
        await supabase
          .from('sensor_readings')
          .update({
            change_water: true,
            mode: 'manual',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
      } catch (err) {
        console.error('changeWater error:', err)
      }
    }
  }, [isDemo, user])

  const value = useMemo<AppState>(
    () => ({
      theme,
      toggleTheme,
      lang,
      setLang,
      t,
      user,
      login,
      logout,
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
      requestHarvest,
      decideRequest,
      cancelRequest,
      plantStatus,
      entryEtaDays,
      sensors,
      feedSchedules,
      addFeedSchedule,
      removeFeedSchedule,
      updateFeedSchedule,
      manualFeed,
      refillDispenser,
      growLightEnabled,
      toggleGrowLightEnabled,
      growLightFrom,
      growLightTo,
      setGrowLightRange,
      growLightManualOn,
      toggleGrowLightManual,
      isLightOn,
      flowOn,
      drainOn,
      fillOn,
      togglePump,
      changeWater,
      isEspConnected,
      espLastSeen,
    }),
    [
      theme,
      toggleTheme,
      lang,
      t,
      user,
      login,
      logout,
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
      requestHarvest,
      decideRequest,
      cancelRequest,
      plantStatus,
      entryEtaDays,
      sensors,
      feedSchedules,
      addFeedSchedule,
      removeFeedSchedule,
      updateFeedSchedule,
      manualFeed,
      refillDispenser,
      growLightEnabled,
      toggleGrowLightEnabled,
      growLightFrom,
      growLightTo,
      setGrowLightRange,
      growLightManualOn,
      toggleGrowLightManual,
      isLightOn,
      flowOn,
      drainOn,
      fillOn,
      togglePump,
      changeWater,
      isEspConnected,
      espLastSeen,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
