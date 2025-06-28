import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, User } from '@/lib/supabase'

interface UserState {
  user: User | null
  isLoading: boolean
  error: string | null
  
  // Actions
  signUp: (email: string, password: string, name: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateCredits: (amount: number) => Promise<void>
  purchaseCredits: (credits: number) => void
  refreshUser: () => Promise<void>
  initializeSession: () => Promise<void>
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,

      signUp: async (email: string, password: string, name: string) => {
        set({ isLoading: true, error: null })
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name } }
          });
          if (error) throw error;

          // If session is present, user does not need to confirm email
          let user = data.user;
          if (!user && data.session) {
            user = data.session.user;
          }

          if (!user) {
            set({ isLoading: false });
            throw new Error("Signup failed: No user returned from Supabase.");
          }

          // Now insert into users table
          if (!user.email) throw new Error('User email is missing from auth response.');
          const { error: profileError } = await supabase
            .from('users')
            .insert([{
              id: user.id,
              email: user.email,
              name: user.user_metadata?.name || user.email.split('@')[0],
              credits: 0
            }]);
          if (profileError) throw profileError;

          // Fetch the created user
          const { data: userData, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
          if (fetchError) throw fetchError;

          set({ user: userData, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      signIn: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          console.log('Starting signin process...')
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          })
          console.log('Auth signin result:', { data, error })
          if (error) {
            console.error('Auth signin error:', error)
            throw error
          }
          if (data.user) {
            // Just fetch the user profile (should always exist now)
            const { data: userData, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single()
            if (profileError) throw profileError
            set({ user: userData, isLoading: false })
            console.log('Signin completed successfully:', userData)
          }
        } catch (error: any) {
          console.error('Signin failed:', error)
          set({ error: error.message, isLoading: false })
          throw error
        }
      },

      signOut: async () => {
        set({ isLoading: true })
        
        try {
          console.log('Starting signout process...')
          
          const { error } = await supabase.auth.signOut()
          
          console.log('Signout result:', { error })
          
          if (error) {
            console.error('Signout error:', error)
            throw error
          }
          
          set({ user: null, isLoading: false })
          console.log('Signout completed successfully')
        } catch (error: any) {
          console.error('Signout failed:', error)
          set({ error: error.message, isLoading: false })
          throw error
        }
      },

      resetPassword: async (email: string) => {
        set({ isLoading: true, error: null })
        try {
          console.log('Sending password reset email to:', email)
          const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
          })
          console.log('Reset password result:', { data, error })
          if (error) throw error
          set({ isLoading: false })
          console.log('Password reset email sent successfully')
        } catch (error: any) {
          console.error('Password reset failed:', error)
          set({ error: error.message, isLoading: false })
          throw error
        }
      },

      updateCredits: async (amount: number) => {
        const { user } = get()
        if (!user) return

        try {
          console.log('Updating credits:', { userId: user.id, currentCredits: user.credits, amount })
          
          const { data, error } = await supabase
            .from('users')
            .update({ credits: user.credits + amount })
            .eq('id', user.id)
            .select()
            .single()

          console.log('Credit update result:', { data, error })

          if (error) {
            console.error('Credit update error:', error)
            throw error
          }

          set({ user: data })
          console.log('Credits updated successfully:', data.credits)
        } catch (error: any) {
          console.error('Credit update failed:', error)
          set({ error: error.message })
          throw error
        }
      },

      refreshUser: async () => {
        try {
          console.log('🔄 Refreshing user data from database...')
          
          // First check current session
          const { data: session } = await supabase.auth.getSession()
          if (!session.session) {
            console.log('❌ No active session found')
            set({ user: null, error: 'Session expired. Please log in again.' })
            return
          }

          // Then get the user
          const { data: authUser, error: authError } = await supabase.auth.getUser()
          if (authError || !authUser.user) {
            console.log('❌ No auth user found:', authError?.message)
            set({ user: null, error: 'Authentication failed. Please log in again.' })
            return
          }

          console.log('👤 Fetching user data for:', authUser.user.id)
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.user.id)
            .single()
          
          if (error) {
            console.error('❌ Failed to fetch user data:', error)
            throw error
          }

          console.log('✅ User data refreshed:', { 
            id: userData.id, 
            email: userData.email, 
            credits: userData.credits 
          })
          set({ user: userData, error: null })
        } catch (error: any) {
          console.error('❌ Failed to refresh user:', error)
          set({ error: error.message })
          throw error
        }
      },

      purchaseCredits: (credits: number) => {
        const { user } = get()
        if (!user) {
          console.error('❌ Cannot purchase credits: No user found')
          return
        }

        // Payment Links for each credit package (created via Stripe CLI)
        const paymentLinks = {
          10: 'https://buy.stripe.com/test_28EbJ16AA7ly3ic7vh2VG0a',     // Basic Package - 9.99 AED
          50: 'https://buy.stripe.com/test_4gM00jbUUgW83ic3f12VG0b',     // Popular Package - 49.99 AED  
          100: 'https://buy.stripe.com/test_aFadR99MM35ibOI6rd2VG0c',    // Premium Package - 99.99 AED
          500: 'https://buy.stripe.com/test_14AbJ12kk7lyf0U16T2VG0d'     // Enterprise Package - 499.99 AED
        }

        const paymentLink = paymentLinks[credits as keyof typeof paymentLinks]
        if (!paymentLink) {
          console.error('❌ Invalid credit package:', credits)
          return
        }

        // Add user ID to payment link for webhook processing
        const url = `${paymentLink}?client_reference_id=${user.id}&prefilled_email=${encodeURIComponent(user.email)}`
        
        console.log('🔗 Redirecting to payment:', { 
          credits, 
          url,
          userId: user.id 
        })
        
        // Open payment link in new tab
        window.open(url, '_blank')
      },

      setUser: (user: User | null) => set({ user }),
      setLoading: (isLoading: boolean) => set({ isLoading }),
      setError: (error: string | null) => set({ error }),

      // Initialize session - called on app start
      initializeSession: async () => {
        try {
          console.log('🚀 Initializing session...')
          const { data: session } = await supabase.auth.getSession()
          
          if (session.session && session.session.user) {
            console.log('📱 Found existing session for:', session.session.user.id)
            
            // Fetch user data from database
            const { data: userData, error } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.session.user.id)
              .single()
            
            if (!error && userData) {
              console.log('✅ Session restored:', { id: userData.id, email: userData.email, credits: userData.credits })
              set({ user: userData, error: null })
            } else {
              console.log('❌ User data not found for session')
              set({ user: null })
            }
          } else {
            console.log('ℹ️ No existing session found')
            set({ user: null })
          }
        } catch (error: any) {
          console.error('❌ Failed to initialize session:', error)
          set({ user: null, error: error.message })
        }
      }
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ user: state.user })
    }
  )
) 