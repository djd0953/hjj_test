'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'
import { Button } from '@/components/ui/button'

// hydration mismatch 방지를 위한 hook
function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
}

export function ThemeToggle() {
  // 1. custom hooks
  const { theme, setTheme } = useTheme()
  const isMounted = useIsMounted()

  // 2. computed values
  const isDark = theme === 'dark'

  // 3. event handlers
  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  // 4. early return
  if (!isMounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Sun className="h-5 w-5" />
      </Button>
    )
  }

  // 5. main return

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}>
      {isDark ? (
        <Sun className="h-5 w-5 transition-transform" />
      ) : (
        <Moon className="h-5 w-5 transition-transform" />
      )}
    </Button>
  )
}
