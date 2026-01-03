import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function createSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey)
}

// TypeScript interfaces for Refittr database tables

export interface Builder {
  id: string
  name: string
  logo_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface HouseSchema {
  id: string
  builder_id: string
  model_name: string
  bedrooms: number
  property_type: 'Detached' | 'Semi-detached' | 'Terraced' | 'Flat'
  year_from: number | null
  year_to: number | null
  floor_plan_url: string | null
  exterior_photo_url: string | null
  spec_sheet_url: string | null
  verified: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Room {
  id: string
  house_schema_id: string
  room_name: string
  room_type: string
  floor_level: number
  length_cm: number
  width_cm: number
  height_cm: number
  floor_area_sqm: number
  notes: string | null
  created_at: string
}

export interface Street {
  id: string
  street_name: string
  postcode: string | null
  postcode_area: string
  development_id: string | null
  created_at: string
}

export interface Development {
  id: string
  name: string
  postcode_area: string
  development_type: string | null
  builder_id: string | null
  year_built: number | null
  notes: string | null
  created_at: string
}