import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseAdmin()

    const { data, error } = await supabase
      .from('builders')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error fetching builder:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch builder' },
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
      .from('builders')
      .update({
        name: body.name,
        logo_url: body.logo_url,
        notes: body.notes || null
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error updating builder:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update builder' },
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
      .from('builders')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting builder:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete builder' },
      { status: 500 }
    )
  }
}
