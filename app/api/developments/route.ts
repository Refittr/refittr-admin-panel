import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createSupabaseAdmin()

    const { data: developments, error } = await supabase
      .from('developments')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error

    return NextResponse.json(developments || [])
  } catch (error: any) {
    console.error('Error fetching developments:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch developments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseAdmin()
    const body = await request.json()

    const { data, error } = await supabase
      .from('developments')
      .insert([{
        name: body.name,
        postcode_area: body.postcode_area || null,
        development_type: body.development_type || null,
        builder_id: body.builder_id || null,
        year_built: body.year_built || null,
        notes: body.notes || null
      }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error creating development:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create development' },
      { status: 500 }
    )
  }
}
