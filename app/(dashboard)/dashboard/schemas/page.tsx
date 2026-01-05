import Link from 'next/link'
import { createSupabaseAdmin } from '@/lib/supabase'
import type { HouseSchema, Builder } from '@/lib/supabase'
import SchemasClientComponent from '@/app/(dashboard)/dashboard/schemas/SchemasClientComponent'
import { Suspense } from 'react'

interface SchemaWithBuilder extends HouseSchema {
  builder: Builder
  room_count: number
  street_count: number
}

interface SchemasPageProps {
  searchParams?: {
    page?: string
    search?: string
    builder?: string
    bedrooms?: string
    propertyType?: string
    unverified?: string
    sortBy?: string
    sortOrder?: string
  }
}

async function getSchemas(): Promise<SchemaWithBuilder[]> {
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

    return (schemas || []).map(schema => ({
      ...schema,
      room_count: schema.rooms?.[0]?.count || 0,
      street_count: schema.streets?.[0]?.count || 0
    }))
  } catch (error) {
    console.error('Error fetching schemas:', error)
    return []
  }
}

async function getBuilders(): Promise<Builder[]> {
  try {
    const supabase = createSupabaseAdmin()
    const { data, error } = await supabase
      .from('builders')
      .select('*')
      .order('name')

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching builders:', error)
    return []
  }
}
          name,
          logo_url
        ),
        rooms(count)
      `, { count: 'exact' })

    // Apply filters
    if (params.search) {
      query = query.ilike('model_name', `%${params.search}%`)
    }

    if (params.builder) {
      query = query.eq('builder_id', params.builder)
    }

    if (params.bedrooms && params.bedrooms !== 'all') {
      if (params.bedrooms === '5+') {
        query = query.gte('bedrooms', 5)
      } else {
        query = query.eq('bedrooms', parseInt(params.bedrooms))
      }
    }

    if (params.propertyType && params.propertyType !== 'all') {
      query = query.eq('property_type', params.propertyType)
    }

    if (params.unverified) {
      query = query.eq('verified', false)
    }

    // Apply sorting
    const sortColumn = params.sortBy || 'created_at'
    const sortOrder = params.sortOrder === 'asc' ? { ascending: true } : { ascending: false }
    query = query.order(sortColumn, sortOrder)

    // Apply pagination
    query = query.range(offset, offset + pageSize - 1)

    const { data, error, count } = await query

    if (error) throw error

    // Get all builders for filter dropdown
    const { data: builders, error: buildersError } = await supabase
  .from('builders')
  .select('*')
  .order('name')

    if (buildersError) throw buildersError

    // Transform the data
    const schemas: SchemaWithBuilder[] = (data || []).map((schema: any) => ({
      ...schema,
      builder: schema.builders,
      room_count: schema.rooms?.[0]?.count || 0,
      street_count: schema.streets?.[0]?.count || 0
    }))

    return {
      schemas,
      totalCount: count || 0,
      builders: builders || []
    }
  } catch (error) {
    console.error('Error fetching schemas:', error)
    return {
      schemas: [],
      totalCount: 0,
      builders: []
    }
  }
}

export default async function SchemasPage({ searchParams }: SchemasPageProps) {
  const schemas = await getSchemas()
  const builders = await getBuilders()

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A]">House Schemas</h1>
          <p className="mt-2 text-gray-600">
            Manage house models and floor plans
          </p>
        </div>
        <Link
          href="/dashboard/schemas/new"
          className="mt-4 sm:mt-0 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#087F8C] hover:bg-[#087F8C]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#087F8C] transition-colors"
        >
          <span className="mr-2">+</span>
          Add New House Schema
        </Link>
      </div>

      {/* Schemas List Component */}
      <Suspense fallback={<div>Loading...</div>}>
        <SchemasClientComponent 
          schemas={schemas}
          builders={builders}
        />
            bedrooms,
            propertyType,
            unverified,
            sortBy,
            sortOrder
      {/* Schemas List Component */}
      <Suspense fallback={<div>Loading...</div>}>
        <SchemasClientComponent 
          schemas={schemas}
          builders={builders}
        />
      </Suspense>
    </div>
  )
}