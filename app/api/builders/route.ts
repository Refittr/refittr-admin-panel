import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createSupabaseAdmin()

    const { data: builders, error } = await supabase
      .from('builders')
      .select(`
        *,
        house_schemas:house_schemas(count)
      `)
      .order('name', { ascending: true })

    if (error) throw error

    return NextResponse.json(builders)
  } catch (error: any) {
    console.error('Error fetching builders:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch builders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[API] POST /api/builders - Starting')
    console.log('[API] Service role key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
    console.log('[API] Service role key length:', process.env.SUPABASE_SERVICE_ROLE_KEY?.length)
    console.log('[API] Service role key prefix:', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 30))
    
    const supabase = createSupabaseAdmin()
    const body = await request.json()

    const { data, error } = await supabase
      .from('builders')
      .insert([{
        name: body.name,
        logo_url: body.logo_url || null,
        notes: body.notes || null
      }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error creating builder:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create builder' },
      { status: 500 }
    )
  }
}
