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
  updateCredits: (amount: number) => Promise<void>
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
              credits: 1000
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

      setUser: (user: User | null) => set({ user }),
      setLoading: (isLoading: boolean) => set({ isLoading }),
      setError: (error: string | null) => set({ error })
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ user: state.user })
    }
  )
) 