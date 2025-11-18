/**
 * Supabase client for both Server and Client Components
 * 
 * This client can be used in both Next.js Server Components and Client Components.
 * The Supabase client creation doesn't require React hooks or browser APIs,
 * so it works in both environments without the 'use client' directive.
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Export as supabaseClient for backward compatibility with existing imports
export const supabaseClient = supabase