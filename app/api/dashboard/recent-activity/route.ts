import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createSupabaseAdmin()

    const { data, error } = await supabase
      .from('house_schemas')
      .select(`
        id,
        model_name,
        updated_at,
        builders:builder_id (
          name
        )
      `)
      .order('updated_at', { ascending: false })
      .limit(10)

    if (error) throw error

    const recentActivity = (data || []).map((item: any) => ({
      id: item.id,
      model_name: item.model_name,
      updated_at: item.updated_at,
      builder: {
        name: item.builders?.[0]?.name || item.builders?.name || 'Unknown Builder'
      }
    }))

    return NextResponse.json(recentActivity)
  } catch (error: any) {
    console.error('Error fetching recent activity:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch recent activity' },
      { status: 500 }
    )
  }
}
