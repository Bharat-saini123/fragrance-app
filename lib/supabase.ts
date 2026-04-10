import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Product = {
  id: string
  name: string
  description: string
  price: number
  category: string
  image_url: string
  stock: number
  featured: boolean
  created_at: string
}

export type Order = {
  id: string
  user_id: string
  user_email: string
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  items: OrderItem[]
  shipping_address: string
  created_at: string
}

export type OrderItem = {
  product_id: string
  product_name: string
  quantity: number
  price: number
}

export type Profile = {
  id: string
  email: string
  full_name: string
  role: 'user' | 'admin'
  created_at: string
}
