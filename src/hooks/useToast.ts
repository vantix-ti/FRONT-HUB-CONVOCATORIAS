'use client'

import { useState, useCallback } from 'react'

type ToastVariant = 'default' | 'destructive' | 'success'

interface ToastData {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
  action?: React.ReactElement
}

let toastCount = 0

// Store global simple (sin context) para el toaster
const listeners: Array<(toasts: ToastData[]) => void> = []
let memoryToasts: ToastData[] = []

function dispatch(toasts: ToastData[]) {
  memoryToasts = toasts
  listeners.forEach((l) => l(toasts))
}

export function toast(props: Omit<ToastData, 'id'>) {
  const id = String(++toastCount)
  const newToast: ToastData = { id, ...props }
  dispatch([...memoryToasts, newToast])
  // Auto-remover después de 5 segundos
  setTimeout(() => {
    dispatch(memoryToasts.filter((t) => t.id !== id))
  }, 5000)
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>(memoryToasts)

  // Registrar listener
  useState(() => {
    listeners.push(setToasts)
    return () => {
      const idx = listeners.indexOf(setToasts)
      if (idx > -1) listeners.splice(idx, 1)
    }
  })

  const dismiss = useCallback((id: string) => {
    dispatch(memoryToasts.filter((t) => t.id !== id))
  }, [])

  return { toasts, toast, dismiss }
}
