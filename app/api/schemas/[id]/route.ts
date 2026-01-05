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
      .from('house_schemas')
      .select(`
        *,
        builder:builders(id, name),
        streets:house_schema_streets(street_id)
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error fetching house schema:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch house schema' },
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
      .from('house_schemas')
      .update({
        builder_id: body.builder_id,
        model_name: body.model_name,
        bedrooms: body.bedrooms,
        property_type: body.property_type,
        year_from: body.year_from || null,
        year_to: body.year_to || null,
        floor_plan_url: body.floor_plan_url,
        exterior_photo_url: body.exterior_photo_url || null,
        spec_sheet_url: body.spec_sheet_url || null,
        verified: body.verified || false,
        notes: body.notes || null
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error updating house schema:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update house schema' },
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
      .from('house_schemas')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting house schema:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete house schema' },
      { status: 500 }
    )
  }
}
