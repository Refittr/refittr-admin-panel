import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Builder } from '@/lib/supabase'
import BuildersClientComponent from '@/app/(dashboard)/dashboard/builders/BuildersClientComponent'

interface BuilderWithStats extends Builder {
  schema_count: number
}

async function getBuilders(): Promise<BuilderWithStats[]> {
  try {
    const { data, error } = await supabase
      .from('builders')
      .select(`
        *,
        house_schemas!builder_id(count)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data || []).map(builder => ({
      ...builder,
      schema_count: builder.house_schemas?.[0]?.count || 0
    }))
  } catch (error) {
    console.error('Error fetching builders:', error)
    throw new Error('Failed to fetch builders')
  }
}

export default async function BuildersPage() {
  try {
    const builders = await getBuilders()

    return (
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#0F172A]">Builders</h1>
            <p className="mt-2 text-gray-600">
              Manage construction companies and home builders
            </p>
          </div>
          <Link
            href="/builders/new"
            className="mt-4 sm:mt-0 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#087F8C] hover:bg-[#087F8C]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#087F8C] transition-colors"
          >
            <span className="mr-2">+</span>
            Add New Builder
          </Link>
        </div>

        {/* Builders List Component */}
        <BuildersClientComponent builders={builders} />
      </div>
    )
  } catch (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A]">Builders</h1>
          <p className="mt-2 text-gray-600">
            Manage construction companies and home builders
          </p>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h2 className="text-lg font-medium text-red-800 mb-2">
            Failed to Load Builders
          </h2>
          <p className="text-red-700 mb-4">
            There was an error loading the builders list. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }
}