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

export default async function SchemasPage({ searchParams }: SchemasPageProps) {
  const schemas = await getSchemas()
  const builders = await getBuilders()
  const params = await searchParams

  const currentPage = parseInt(params?.page || '1')
  const pageSize = 10
  const totalPages = Math.ceil(schemas.length / pageSize)

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
          totalCount={schemas.length}
          totalPages={totalPages}
          currentPage={currentPage}
          initialFilters={{
            search: params?.search || '',
            builder: params?.builder || '',
            bedrooms: params?.bedrooms || 'all',
            propertyType: params?.propertyType || 'all',
            unverified: params?.unverified === 'true',
            sortBy: params?.sortBy || 'created_at',
            sortOrder: params?.sortOrder || 'desc'
          }}
        />
      </Suspense>
    </div>
  )
}