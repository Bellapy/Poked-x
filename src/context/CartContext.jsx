import { createContext, useContext, useEffect, useState } from 'react'
import { KEYS, readJSON, writeJSON } from '../lib/storage'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => readJSON(KEYS.cart, []))

  useEffect(() => {
    writeJSON(KEYS.cart, items)
  }, [items])

  function addItem(listingId, quantity = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.listingId === listingId)
      if (existing) {
        return prev.map((i) =>
          i.listingId === listingId ? { ...i, quantity: i.quantity + quantity } : i,
        )
      }
      return [...prev, { listingId, quantity }]
    })
  }

  function removeItem(listingId) {
    setItems((prev) => prev.filter((i) => i.listingId !== listingId))
  }

  function clear() {
    setItems([])
  }

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clear }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart precisa estar dentro de um CartProvider')
  return ctx
}
