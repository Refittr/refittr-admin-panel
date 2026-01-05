import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createSupabaseAdmin()
    const { id } = await params

    const { data, error } = await supabase
      .from('streets')
      .select(`
        *,
        developments!development_id(name)
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error fetching street:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch street' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createSupabaseAdmin()
    const body = await request.json()
    const { id } = await params

    const { data, error } = await supabase
      .from('streets')
      .update({
        street_name: body.street_name,
        postcode: body.postcode || null,
        postcode_area: body.postcode_area,
        development_id: body.development_id || null
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error updating street:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update street' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createSupabaseAdmin()
    const { id } = await params

    const { error } = await supabase
      .from('streets')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting street:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete street' },
      { status: 500 }
    )
  }
}
