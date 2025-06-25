import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

console.log('Supabase Configuration:')
console.log('URL:', supabaseUrl)
console.log('Key exists:', !!supabaseAnonKey)
console.log('Key length:', supabaseAnonKey?.length)

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!')
  console.error('Please check your .env.local file')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Test the connection
supabase.auth.getSession().then(({ data, error }) => {
  console.log('Supabase connection test:', { data, error })
})

// Database types
export interface User {
  id: string
  email: string
  name: string
  credits: number
  created_at: string
  updated_at: string
}

export interface Agent {
  id: number
  name: string
  description: string
  category: string
  cost: number
  rating: number
  reviews: number
  initials: string
  gradient: string
  slug: string
  is_active: boolean
  created_at: string
}

export interface UsageHistory {
  id: string
  user_id: string
  agent_id: number
  agent_name: string
  cost: number
  result: string
  status: 'completed' | 'processing' | 'failed'
  created_at: string
}

export interface CreditTransaction {
  id: string
  user_id: string
  amount: number
  type: 'purchase' | 'usage' | 'refund'
  stripe_payment_intent_id?: string
  created_at: string
} 