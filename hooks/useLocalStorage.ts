'use client'

import { useState, useEffect } from 'react'

// Hook générique pour persister un état dans localStorage.
// Démarre toujours avec initialValue pour éviter le mismatch SSR/client,
// puis charge la valeur réelle depuis localStorage après hydration.
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  // Charger depuis localStorage uniquement côté client, après hydration
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) setStoredValue(JSON.parse(item) as T)
    } catch {
      // localStorage inaccessible, on garde initialValue
    }
  }, [key])

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Erreur localStorage [${key}]:`, error)
    }
  }

  return [storedValue, setValue] as const
}
