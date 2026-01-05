import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createSupabaseAdmin()

    const { data: streets, error } = await supabase
      .from('streets')
      .select(`
        *,
        developments!development_id(name)
      `)
      .order('street_name', { ascending: true })

    if (error) throw error

    return NextResponse.json(streets || [])
  } catch (error: any) {
    console.error('Error fetching streets:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch streets' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseAdmin()
    const body = await request.json()

    const { data, error } = await supabase
      .from('streets')
      .insert([{
        street_name: body.street_name,
        postcode: body.postcode || null,
        postcode_area: body.postcode_area,
        development_id: body.development_id || null
      }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error creating street:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create street' },
      { status: 500 }
    )
  }
}
