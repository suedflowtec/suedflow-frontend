// hooks/useToast.tsx
'use client'
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

type ToastKind = 'success' | 'error' | 'info'
interface Toast { id: number; msg: string; kind: ToastKind }

const ToastCtx = createContext<{ toast: (msg: string, kind?: ToastKind) => void }>({ toast: () => {} })

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const toast = useCallback((msg: string, kind: ToastKind = 'info') => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, kind }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }, [])
  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[10001] flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.kind}`}>{t.msg}</div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast() { return useContext(ToastCtx) }
