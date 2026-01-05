import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createSupabaseAdmin()

    const { data: schemas, error } = await supabase
      .from('house_schemas')
      .select(`
        *,
        builder:builders(id, name),
        rooms:rooms(count),
        streets:house_schema_streets(count)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Transform data to match expected format
    const transformedData = schemas?.map(schema => ({
      ...schema,
      room_count: schema.rooms?.[0]?.count || 0,
      street_count: schema.streets?.[0]?.count || 0
    })) || []

    return NextResponse.json(transformedData)
  } catch (error: any) {
    console.error('Error fetching house schemas:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch house schemas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseAdmin()
    const body = await request.json()

    const { data, error } = await supabase
      .from('house_schemas')
      .insert([{
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
      }])
      .select()
      .single()

    if (error) throw error

    // If street_ids provided, create junction table entries
    if (body.street_ids && Array.isArray(body.street_ids) && body.street_ids.length > 0) {
      const junctionInserts = body.street_ids.map((streetId: string) => ({
        house_schema_id: data.id,
        street_id: streetId
      }))

      const { error: junctionError } = await supabase
        .from('house_schema_streets')
        .insert(junctionInserts)

      if (junctionError) throw junctionError
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error creating house schema:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create house schema' },
      { status: 500 }
    )
  }
}
