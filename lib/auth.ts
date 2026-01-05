import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

// Singleton instance
let supabaseBrowserClient: SupabaseClient | null = null

// Create browser client for client components (singleton)
export const createBrowserClient = () => {
  if (supabaseBrowserClient) {
    return supabaseBrowserClient
  }

  supabaseBrowserClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    }
  )

  return supabaseBrowserClient
}

// Client-side auth functions
export const signIn = async (email: string, password: string) => {
  const supabase = createBrowserClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signOut = async () => {
  const supabase = createBrowserClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}
