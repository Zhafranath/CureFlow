'use client'

import { Moon, Sun } from 'lucide-react'
import { useApp } from '@/lib/store'
import { cn } from '@/lib/utils'

export function TopControls({ className }: { className?: string }) {
  const { theme, toggleTheme, lang, setLang, t } = useApp()

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? t('lightMode') : t('darkMode')}
        className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card/60 text-foreground backdrop-blur transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
      </button>

      <div
        role="group"
        aria-label={t('language')}
        className="flex items-center rounded-lg border border-border bg-card/60 p-0.5 backdrop-blur"
      >
        {(['id', 'en'] as const).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            aria-pressed={lang === l}
            className={cn(
              'rounded-md px-2.5 py-1 text-xs font-semibold uppercase tracking-wide transition-colors',
              lang === l
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  )
}
