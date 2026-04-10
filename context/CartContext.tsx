'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import type { Product } from '@/lib/supabase'

type CartItem = { product: Product; quantity: number }

type CartContextType = {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  total: number
  count: number
}

const CartContext = createContext<CartContextType>({
  items: [], addItem: () => {}, removeItem: () => {},
  updateQuantity: () => {}, clearCart: () => {}, total: 0, count: 0
})

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('itra-cart')
    if (saved) setItems(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('itra-cart', JSON.stringify(items))
  }, [items])

  const addItem = (product: Product) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { product, quantity: 1 }]
    })
  }

  const removeItem = (productId: string) => setItems(prev => prev.filter(i => i.product.id !== productId))

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) { removeItem(productId); return }
    setItems(prev => prev.map(i => i.product.id === productId ? { ...i, quantity } : i))
  }

  const clearCart = () => setItems([])
  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
