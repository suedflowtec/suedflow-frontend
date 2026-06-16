'use client'
import { useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('suedflow_theme') as Theme | null
    if (saved === 'light') {
      setTheme('light')
      document.documentElement.setAttribute('data-theme', 'light')
    }
  }, [])

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    if (next === 'light') {
      document.documentElement.setAttribute('data-theme', 'light')
      localStorage.setItem('suedflow_theme', 'light')
    } else {
      document.documentElement.removeAttribute('data-theme')
      localStorage.setItem('suedflow_theme', 'dark')
    }
  }

  return { theme, toggle }
}
