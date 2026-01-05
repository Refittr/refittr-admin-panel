import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseAdmin()

    const { data, error } = await supabase
      .from('developments')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error fetching development:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch development' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseAdmin()
    const body = await request.json()

    const { data, error } = await supabase
      .from('developments')
      .update({
        name: body.name,
        postcode_area: body.postcode_area || null,
        development_type: body.development_type || null,
        builder_id: body.builder_id || null,
        year_built: body.year_built || null,
        notes: body.notes || null
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error updating development:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update development' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseAdmin()

    const { error } = await supabase
      .from('developments')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting development:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete development' },
      { status: 500 }
    )
  }
}
