'use client'

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
} from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  FlaskConical,
  Lock,
  Mail,
  Pill,
  Shield,
  Stethoscope,
  User,
  UserPlus,
  Wrench,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { TopControls } from '@/components/top-controls'
import { SceneBackground } from '@/components/scene-background'
import type { Role } from '@/lib/store'
import { useApp } from '@/lib/store'
import { supabase } from '@/lib/supabase'

const isSupabaseConfigured =
  typeof window !== 'undefined' &&
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder-url.supabase.co' &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder-key'

/* === Static Data === */

const ROLES_DEMO: {
  role: Role
  icon: typeof Stethoscope
  labelKey: string
  descKey: string
  account: string
  gradient: string
  shadow: string
  dot: string
}[] = [
  {
    role: 'doctor',
    icon: Stethoscope,
    labelKey: 'doctor',
    descKey: 'roleDoctorDesc',
    account: 'dr. Raka Pratama',
    gradient: 'from-cyan-500 to-sky-500',
    shadow: 'shadow-cyan-500/25',
    dot: 'bg-cyan-400',
  },
  {
    role: 'pharmacist',
    icon: Pill,
    labelKey: 'pharmacist',
    descKey: 'rolePharmacistDesc',
    account: 'Apt. Sinta Dewi',
    gradient: 'from-violet-500 to-purple-500',
    shadow: 'shadow-violet-500/25',
    dot: 'bg-violet-400',
  },
  {
    role: 'technician',
    icon: Wrench,
    labelKey: 'technician',
    descKey: 'roleTechnicianDesc',
    account: 'Teknisi Bagas',
    gradient: 'from-emerald-500 to-teal-500',
    shadow: 'shadow-emerald-500/25',
    dot: 'bg-emerald-400',
  },
]

const ROLE_OPTIONS: {
  value: Role
  label: string
  labelEn: string
  icon: typeof Stethoscope
  ring: string
}[] = [
  { value: 'doctor',     label: 'Dokter',   labelEn: 'Doctor',     icon: Stethoscope, ring: 'ring-cyan-500/50 border-cyan-500/50 bg-cyan-500/8 text-cyan-400' },
  { value: 'pharmacist', label: 'Apoteker', labelEn: 'Pharmacist', icon: Pill,        ring: 'ring-violet-500/50 border-violet-500/50 bg-violet-500/8 text-violet-400' },
  { value: 'technician', label: 'Teknisi',  labelEn: 'Technician', icon: Wrench,      ring: 'ring-emerald-500/50 border-emerald-500/50 bg-emerald-500/8 text-emerald-400' },
]
/* === Animated Input === */

function Field({
  id, label, icon: Icon, type, value, onChange, placeholder, error, right,
}: {
  id: string; label: string; icon: typeof Mail; type: string
  value: string; onChange: (v: string) => void; placeholder: string
  error?: string; right?: React.ReactNode
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        <motion.span
          className="pointer-events-none absolute -inset-px rounded-xl"
          animate={{
            boxShadow: focused
              ? '0 0 0 1.5px rgba(34,211,238,0.5), 0 0 18px rgba(34,211,238,0.12)'
              : '0 0 0 0px rgba(34,211,238,0)',
          }}
          transition={{ duration: 0.18 }}
        />
        <Icon size={15} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focused ? 'text-cyan-400' : 'text-muted-foreground/60'}`} />
        <input
          id={id}
          type={type}
          value={value}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border bg-background/50 py-3 pl-10 ${right ? 'pr-11' : 'pr-4'} text-sm text-foreground placeholder:text-muted-foreground/40 outline-none backdrop-blur-sm transition-colors ${error ? 'border-destructive/50' : focused ? 'border-cyan-500/40' : 'border-border/60'}`}
        />
        {right && <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{right}</div>}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-xs font-medium text-destructive">
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

/* === Shiny Submit Button === */

function SubmitBtn({ loading, label, icon: Icon }: { loading: boolean; label: string; icon: typeof ArrowRight }) {
  const ref = useRef<HTMLButtonElement>(null)
  const mx = useMotionValue(0), my = useMotionValue(0)
  const rx = useTransform(my, [-30, 30], [5, -5])
  const ry = useTransform(mx, [-60, 60], [-5, 5])
  const onMouse = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    mx.set(e.clientX - r.left - r.width / 2)
    my.set(e.clientY - r.top - r.height / 2)
  }, [mx, my])
  return (
    <motion.button
      ref={ref} type="submit" disabled={loading}
      onMouseMove={onMouse}
      onMouseLeave={() => { mx.set(0); my.set(0) }}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 700 }}
      whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.975 }}
      className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-shadow hover:shadow-cyan-500/45 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <motion.div
        className="pointer-events-none absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }} whileHover={{ x: '220%' }}
        transition={{ duration: 0.55 }}
      />
      <span className="relative flex items-center justify-center gap-2">
        {loading
          ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /><span>Memproses…</span></>
          : <>{label}<Icon size={15} className="transition-transform group-hover:translate-x-1" /></>
        }
      </span>
    </motion.button>
  )
}

/* === Mode Toggle === */

function ModeSwitcher({ mode, onChange, lang }: { mode: 'real' | 'demo'; onChange: (m: 'real' | 'demo') => void; lang: 'id' | 'en' }) {
  return (
    <div className="relative flex rounded-2xl border border-border/50 bg-card/40 p-1 backdrop-blur-sm">
      <motion.div
        layoutId="mode-pill"
        className="absolute top-1 bottom-1 rounded-xl"
        style={{
          left: mode === 'real' ? '4px' : 'calc(50% + 2px)',
          width: 'calc(50% - 6px)',
          background: mode === 'real'
            ? 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(14,165,233,0.15))'
            : 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(168,85,247,0.15))',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: mode === 'real' ? 'rgba(34,211,238,0.35)' : 'rgba(139,92,246,0.35)',
        }}
        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
      />
      {[
        { key: 'real', label: lang === 'en' ? 'Real Login' : 'Login Nyata',   icon: Shield,       color: 'text-cyan-400' },
        { key: 'demo', label: lang === 'en' ? 'Demo / Testing' : 'Demo / Testing', icon: FlaskConical, color: 'text-violet-400' },
      ].map(({ key, label, icon: Icon, color }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key as 'real' | 'demo')}
          className={`relative z-10 flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors duration-200 ${mode === key ? color : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Icon size={15} />
          {label}
        </button>
      ))}
    </div>
  )
}

/* === Real Login Form === */

function generateUUID() {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

function RealForm({
  t,
  lang,
  subtab,
  setSubtab,
}: {
  t: (k: string) => string
  lang: 'id' | 'en'
  subtab: 'signin' | 'register'
  setSubtab: (t: 'signin' | 'register') => void
}) {
  const { login } = useApp()
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('doctor')
  const [showPwd, setShowPwd] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => { setErrors({}) }, [subtab])

  function validate() {
    const e: Record<string, string> = {}
    if (!fullName.trim())
      e.fullName = lang === 'id' ? 'Nama wajib diisi' : 'Name is required'
    if (!password || password.length < 6)
      e.password = lang === 'id' ? 'Minimal 6 karakter' : 'Min. 6 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)

    const cleanName = fullName.trim()
    const generatedEmail = `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@cureflow.com`

    if (isSupabaseConfigured) {
      try {
        if (subtab === 'register') {
          // Check if name is already registered
          const { data: existing } = await supabase
            .from('profiles')
            .select('id')
            .eq('name', cleanName)
            .maybeSingle()
          
          if (existing) {
            setErrors({ general: lang === 'id' ? 'Nama ini sudah terdaftar' : 'This name is already registered' })
            setLoading(false)
            return
          }

          const newId = generateUUID()
          // 1. Insert new profile
          const { error: profileErr } = await supabase.from('profiles').insert({
            id: newId,
            name: cleanName,
            role: role,
            password: password,
            email: generatedEmail
          })

          if (profileErr) {
            setErrors({ general: profileErr.message })
            setLoading(false)
            return
          }

          // 2. Insert default sensor readings row
          await supabase.from('sensor_readings').insert({
            user_id: newId,
            mode: 'auto',
            times: ['07:00', '12:00', '18:00'],
            pump_flow: true,
            pump_drain: false,
            pump_add: false,
            grow_light: true,
            servo: false,
            turbidity: 12,
            food_level: 68.0,
            water_level: 74.0,
          })

          login(role, cleanName, generatedEmail, newId)
        } else {
          // Sign in flow: Lookup by profile name and check password
          const { data: profile, error: fetchErr } = await supabase
            .from('profiles')
            .select('*')
            .eq('name', cleanName)
            .maybeSingle()

          if (fetchErr) {
            setErrors({ general: fetchErr.message })
            setLoading(false)
            return
          }

          if (!profile) {
            setErrors({ general: lang === 'id' ? 'Nama tidak ditemukan' : 'Name not found' })
            setLoading(false)
            return
          }

          if (profile.password !== password) {
            setErrors({ general: lang === 'id' ? 'Kata sandi salah' : 'Incorrect password' })
            setLoading(false)
            return
          }

          const userRole = (profile.role as Role) || 'doctor'
          const userName = profile.name || cleanName
          login(userRole, userName, profile.email || generatedEmail, profile.id)
          
          setSuccess(true)
          await new Promise((r) => setTimeout(r, 480))
          router.push(`/${userRole}`)
          return
        }
      } catch (err: any) {
        setErrors({ general: err.message || 'Authentication failed' })
        setLoading(false)
        return
      }
    } else {
      // Local fallback mode
      login(role, cleanName, generatedEmail)
    }

    setSuccess(true)
    await new Promise((r) => setTimeout(r, 480))
    router.push(`/${role}`)
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-1 rounded-xl border border-border/50 bg-background/40 p-1">
        {[
          { key: 'signin',   label: t('tabSignIn'),  icon: User },
          { key: 'register', label: t('tabSignUp'), icon: UserPlus },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setSubtab(key as 'signin' | 'register')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${subtab === key ? 'bg-card text-cyan-400 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <AnimatePresence mode="wait">
          <motion.div
            key={subtab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="space-y-4"
          >
            {errors.general && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-semibold text-red-400">
                {errors.general}
              </div>
            )}

            <Field id="full-name" label={t('fullNameLabel')} icon={User} type="text" value={fullName}
              onChange={(v) => { setFullName(v); setErrors((x) => ({ ...x, fullName: '' })) }}
              placeholder={t('fullNamePlaceholder')} error={errors.fullName} />

            <Field id="password" label={t('passwordLabel')} icon={Lock}
              type={showPwd ? 'text' : 'password'} value={password}
              onChange={(v) => { setPassword(v); setErrors((x) => ({ ...x, password: '' })) }}
              placeholder="••••••••" error={errors.password}
              right={
                <button type="button" tabIndex={-1} onClick={() => setShowPwd((v) => !v)}
                  className="text-muted-foreground/60 hover:text-foreground transition-colors">
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />

            {subtab === 'register' && (
              <div className="space-y-2">
                <span className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  {t('roleSelectLabel')}
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {ROLE_OPTIONS.map(({ value, label, labelEn, icon: Icon, ring }) => {
                    const active = role === value
                    return (
                      <motion.button
                        key={value} type="button"
                        onClick={() => setRole(value)}
                        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                        className={`relative flex flex-col items-center gap-1.5 rounded-xl border py-3.5 text-xs font-semibold transition-all duration-200 ${active ? `${ring} ring-1` : 'border-border/50 bg-background/40 text-muted-foreground hover:text-foreground'}`}
                      >
                        <Icon size={17} />
                        <span>{lang === 'id' ? label : labelEn}</span>
                        {active && (
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500">
                            <Check size={9} className="text-white" strokeWidth={3} />
                          </motion.span>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              {success ? (
                <motion.div key="ok" initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-3.5 text-sm font-bold text-emerald-400">
                  <Check size={17} strokeWidth={2.5} />
                  {lang === 'id' ? 'Berhasil! Mengalihkan…' : 'Success! Redirecting…'}
                </motion.div>
              ) : (
                <motion.div key="btn">
                  <SubmitBtn loading={loading}
                    label={subtab === 'signin' ? t('btnSubmitLogin') : t('btnSubmitRegister')}
                    icon={ArrowRight} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </form>
    </div>
  )
}

/* === Demo Panel === */

function DemoPanel({ t, lang, onLogin }: { t: (k: string) => string; lang: 'id' | 'en'; onLogin: (role: Role) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/8 px-4 py-3">
        <FlaskConical size={15} className="shrink-0 text-violet-400" />
        <p className="text-xs text-muted-foreground">{t('quickLoginSub')}</p>
      </div>

      <div className="grid gap-2.5">
        {ROLES_DEMO.map(({ role, icon: Icon, labelKey, descKey, account, gradient, shadow, dot }, i) => (
          <motion.button
            key={role}
            type="button"
            id={`quick-login-${role}`}
            onClick={() => onLogin(role)}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            className={`group flex items-center gap-4 rounded-2xl border border-border/50 bg-card/50 p-4 text-left backdrop-blur-sm transition-all hover:border-white/10 hover:shadow-xl ${shadow}`}
          >
            <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
              <Icon size={22} className="text-white" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                <h3 className="font-heading text-sm font-bold text-card-foreground">{t(labelKey)}</h3>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{t(descKey)}</p>
              <p className="mt-1 text-xs font-semibold text-foreground">{account}</p>
            </div>
            <ChevronRight size={18} className="shrink-0 text-muted-foreground/50 transition-all group-hover:translate-x-1 group-hover:text-foreground" />
          </motion.button>
        ))}
      </div>

      <p className="pt-1 text-center text-[11px] text-muted-foreground/60">
        {lang === 'id' ? 'Data akun demo tidak disimpan secara permanen' : 'Demo accounts are not permanently saved'}
      </p>
    </div>
  )
}

/* === Auth Illustration === */

function AuthIllustration({ activeTab, mode, lang }: { activeTab: 'signin' | 'register'; mode: 'real' | 'demo'; lang: string }) {
  const isRegister = mode === 'real' && activeTab === 'register'

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center p-8 overflow-hidden select-none">
      {/* Dynamic ambient color glow behind the illustration */}
      <div 
        className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-teal-500/5 to-transparent blur-[80px]"
        style={{
          background: isRegister
            ? 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)'
        }}
      />

      <AnimatePresence mode="wait">
        {isRegister ? (
          <motion.div
            key="register"
            initial={{ opacity: 0, scale: 0.82, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.82, rotate: 8 }}
            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            className="flex flex-col items-center text-center space-y-5"
          >
            {/* Seedling sprout card with scale pulse & glow */}
            <motion.div
              animate={{ 
                scale: [1, 1.025, 1],
                y: [0, -3, 0]
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="relative w-40 h-40 rounded-[28px] border border-emerald-500/20 bg-[#041611]/80 p-1.5 shadow-[0_0_30px_rgba(16,185,129,0.12)] backdrop-blur-md"
            >
              <Image
                src="/images/login_signup_sprout.jpg"
                alt="Register sprout illustration"
                width={180}
                height={180}
                className="w-full h-full object-cover rounded-[20px]"
              />
            </motion.div>
            <div>
              <h2 className="font-heading text-base font-bold text-white tracking-tight">
                {lang === 'en' ? 'Start Growing Today' : 'Mulai Menanam Hari Ini'}
              </h2>
              <p className="text-[10px] text-emerald-300/60 mt-1 max-w-[180px] leading-relaxed">
                {lang === 'en' ? 'Register a new account to join the CureFlow medical network.' : 'Daftarkan akun baru untuk bergabung dalam jaringan medis CureFlow.'}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="signin"
            initial={{ opacity: 0, scale: 0.82, rotate: 8 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.82, rotate: -8 }}
            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            className="flex flex-col items-center text-center space-y-5"
          >
            {/* Security shield card with slow float/levitation */}
            <motion.div
              animate={{ 
                y: [0, -8, 0]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="relative w-40 h-40 rounded-[28px] border border-cyan-500/20 bg-[#04121a]/80 p-1.5 shadow-[0_0_30px_rgba(6,182,212,0.12)] backdrop-blur-md"
            >
              <Image
                src="/images/login_signin_shield.jpg"
                alt="Login shield illustration"
                width={180}
                height={180}
                className="w-full h-full object-cover rounded-[20px]"
              />
            </motion.div>
            <div>
              <h2 className="font-heading text-base font-bold text-white tracking-tight">
                {lang === 'en' ? 'Secure Authentication' : 'Autentikasi Keamanan'}
              </h2>
              <p className="text-[10px] text-cyan-300/60 mt-1 max-w-[180px] leading-relaxed">
                {lang === 'en' ? 'Access your dashboard securely with encrypted protocols.' : 'Akses dashboard Anda secara aman dengan protokol terenkripsi.'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* === Page === */

export default function LoginPage() {
  const { t, login, lang } = useApp()
  const router = useRouter()
  const [mode, setMode] = useState<'real' | 'demo'>('real')
  const [subtab, setSubtab] = useState<'signin' | 'register'>('signin')

  async function handleQuickLogin(role: Role) {
    const email = `${role}@cureflow.com`
    const demoId = role === 'doctor' 
      ? '11111111-1111-1111-1111-111111111111' 
      : role === 'pharmacist' 
        ? '22222222-2222-2222-2222-222222222222' 
        : '33333333-3333-3333-3333-333333333333'
    const name = role === 'doctor' ? 'dr. Raka Pratama' : role === 'pharmacist' ? 'Apt. Sinta Dewi' : 'Teknisi Bagas'

    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').upsert({
          id: demoId,
          name,
          role,
          email,
        })
      } catch (err) {
        console.warn('Demo quick login profiles sync failed:', err)
      }
    }
    login(role, name, email, demoId)
    router.push(`/${role}`)
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 bg-[#020813]"
    >
      <SceneBackground />

      {/* Top-left Back to Home control */}
      <div className="absolute left-4 top-4 z-30 sm:left-6 sm:top-5">
        <button
          type="button"
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-xs font-bold text-muted-foreground transition-all hover:bg-white/[0.08] hover:text-white cursor-pointer select-none"
        >
          <ArrowLeft size={14} />
          {lang === 'en' ? 'Back' : 'Kembali'}
        </button>
      </div>

      {/* Top-right controls */}
      <div className="absolute right-4 top-4 z-30 sm:right-6 sm:top-5">
        <TopControls />
      </div>

      {/* Card Wrapper with 2-Column Responsive Layout */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[420px] lg:max-w-[800px]"
      >
        {/* Glass card container */}
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.04] shadow-2xl shadow-black/50 backdrop-blur-2xl grid lg:grid-cols-12">
          
          {/* Top shimmer line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent z-20" />
          
          {/* Left panel: Auth Illustration (Visible only on desktop lg screens) */}
          <div className="hidden lg:block lg:col-span-5 border-r border-white/[0.06] bg-black/10 relative">
            <AuthIllustration activeTab={subtab} mode={mode} lang={lang} />
          </div>

          {/* Right panel: Login form */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            {/* Inner noise — makes it feel like real glass */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.022] -z-10"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}
              aria-hidden
            />

            <div className="p-6 sm:p-7">
              {/* Small Mobile-only Illustration emblem */}
              <div className="lg:hidden flex justify-center mb-4">
                <AnimatePresence mode="wait">
                  {mode === 'real' && subtab === 'register' ? (
                    <motion.div
                      key="mb-reg"
                      initial={{ scale: 0.7, opacity: 0, rotate: -10 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      exit={{ scale: 0.7, opacity: 0, rotate: 10 }}
                      className="relative w-16 h-16 rounded-2xl border border-emerald-500/25 bg-[#041611]/80 p-1 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                    >
                      <Image
                        src="/images/login_signup_sprout.jpg"
                        alt="Sprout mobile icon"
                        width={64}
                        height={64}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="mb-sig"
                      initial={{ scale: 0.7, opacity: 0, rotate: 10 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      exit={{ scale: 0.7, opacity: 0, rotate: -10 }}
                      className="relative w-16 h-16 rounded-2xl border border-cyan-500/25 bg-[#04121a]/80 p-1 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                    >
                      <Image
                        src="/images/login_signin_shield.jpg"
                        alt="Shield mobile icon"
                        width={64}
                        height={64}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Brand header clickable to navigate home */}
              <button
                type="button"
                onClick={() => router.push('/')}
                className="mb-6 flex items-center gap-3 text-left hover:opacity-85 transition-opacity cursor-pointer group"
              >
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 20 }}
                  className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-600 shadow-lg shadow-cyan-500/30 group-hover:scale-105 transition-transform"
                >
                  <svg width="26" height="26" viewBox="0 0 40 40" fill="none">
                    <rect x="16" y="4" width="8" height="32" rx="2.5" fill="white" fillOpacity="0.95" />
                    <rect x="4" y="16" width="32" height="8" rx="2.5" fill="white" fillOpacity="0.95" />
                  </svg>
                  <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#020813]">
                    <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/70" />
                  </span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.22 }}
                >
                  <h1 className="font-heading text-xl font-extrabold tracking-tight text-white">
                    Cure<span className="text-cyan-400">Flow</span>
                  </h1>
                  <p className="text-[11px] text-white/40">{t('loginSub').split('.')[0]}.</p>
                </motion.div>
              </button>

              {/* Mode switcher */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 }}
                className="mb-5"
              >
                <ModeSwitcher mode={mode} onChange={setMode} lang={lang} />
              </motion.div>

              {/* Content */}
              <AnimatePresence mode="wait">
                {mode === 'real' ? (
                  <motion.div
                    key="real"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <RealForm t={t} lang={lang} subtab={subtab} setSubtab={setSubtab} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="demo"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <DemoPanel t={t} lang={lang} onLogin={handleQuickLogin} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-white/[0.06] px-7 py-3">
              <p className="text-center text-[10px] text-white/25">
                © {new Date().getFullYear()} Cure<span className="text-cyan-500/60">Flow</span> · Aquaponic Health System · ESP32
              </p>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sky-500/20 to-transparent" />
          </div>

        </div>

        {/* Subtle card ambient glow */}
        <div
          className="pointer-events-none absolute -inset-px -z-10 rounded-3xl blur-2xl"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(34,211,238,0.12) 0%, transparent 65%)', opacity: 0.7 }}
        />
      </motion.div>
    </div>
  )
}
