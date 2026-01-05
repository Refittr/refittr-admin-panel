import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createSupabaseAdmin()

    // Fetch all statistics in parallel
    const [
      { count: totalBuilders },
      { count: totalSchemas },
      { count: verifiedSchemas },
      { count: totalRooms },
      { count: unverifiedSchemas }
    ] = await Promise.all([
      supabase.from('builders').select('*', { count: 'exact', head: true }),
      supabase.from('house_schemas').select('*', { count: 'exact', head: true }),
      supabase.from('house_schemas').select('*', { count: 'exact', head: true }).eq('verified', true),
      supabase.from('rooms').select('*', { count: 'exact', head: true }),
      supabase.from('house_schemas').select('*', { count: 'exact', head: true }).eq('verified', false)
    ])

    return NextResponse.json({
      totalBuilders: totalBuilders || 0,
      totalSchemas: totalSchemas || 0,
      verifiedSchemas: verifiedSchemas || 0,
      totalRooms: totalRooms || 0,
      unverifiedSchemas: unverifiedSchemas || 0
    })
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
