import Link from 'next/link'
import { createSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface DashboardStats {
  totalBuilders: number
  totalSchemas: number
  verifiedSchemas: number
  totalRooms: number
  unverifiedSchemas: number
}

interface RecentSchema {
  id: string
  model_name: string
  updated_at: string
  builder: {
    name: string
  }
}

async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const supabase = createSupabaseAdmin()
    
    // Fetch all statistics in parallel
    const [
      { count: totalBuilders },
      { count: totalSchemas },
      { count: verifiedSchemas },
      { count: totalRooms },
      { count: unverifiedSchemas }
    ] = await Promise.all([
      supabase.from('builders').select('*', { count: 'exact', head: true }),
      supabase.from('house_schemas').select('*', { count: 'exact', head: true }),
      supabase.from('house_schemas').select('*', { count: 'exact', head: true }).eq('verified', true),
      supabase.from('rooms').select('*', { count: 'exact', head: true }),
      supabase.from('house_schemas').select('*', { count: 'exact', head: true }).eq('verified', false)
    ])

    return {
      totalBuilders: totalBuilders || 0,
      totalSchemas: totalSchemas || 0,
      verifiedSchemas: verifiedSchemas || 0,
      totalRooms: totalRooms || 0,
      unverifiedSchemas: unverifiedSchemas || 0
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      totalBuilders: 0,
      totalSchemas: 0,
      verifiedSchemas: 0,
      totalRooms: 0,
      unverifiedSchemas: 0
    }
  }
}

async function getRecentActivity(): Promise<RecentSchema[]> {
  try {
    const supabase = createSupabaseAdmin()
    
    const { data, error } = await supabase
      .from('house_schemas')
      .select(`
        id,
        model_name,
        updated_at,
        builders:builder_id (
          name
        )
      `)
      .order('updated_at', { ascending: false })
      .limit(10)

    if (error) throw error

    return (data || []).map((item: any) => ({
      id: item.id,
      model_name: item.model_name,
      updated_at: item.updated_at,
      builder: {
        name: item.builders?.[0]?.name || item.builders?.name || 'Unknown Builder'
      }
    }))
  } catch (error) {
    console.error('Error fetching recent activity:', error)
    return []
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
    Math.round((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    'day'
  )
}

export default async function DashboardPage() {
  const [stats, recentActivity] = await Promise.all([
    getDashboardStats(),
    getRecentActivity()
  ])

  const statCards = [
    {
      title: 'Total Builders',
      value: stats.totalBuilders,
      icon: '🏗️',
      color: 'text-[#087F8C]',
      bgColor: 'bg-[#087F8C]/10'
    },
    {
      title: 'House Schemas',
      value: stats.totalSchemas,
      icon: '🏠',
      color: 'text-[#024059]',
      bgColor: 'bg-[#024059]/10'
    },
    {
      title: 'Verified Schemas',
      value: stats.verifiedSchemas,
      icon: '✅',
      color: 'text-[#10B981]',
      bgColor: 'bg-[#10B981]/10'
    },
    {
      title: 'Total Rooms',
      value: stats.totalRooms,
      icon: '🚪',
      color: 'text-[#087F8C]',
      bgColor: 'bg-[#087F8C]/10'
    },
    {
      title: 'Needs Verification',
      value: stats.unverifiedSchemas,
      icon: '⚠️',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A]">Dashboard</h1>
          <p className="mt-2 text-gray-600">Overview of your Refittr admin panel</p>
        </div>
        
        {/* Quick Action Buttons */}
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
          <Link
            href="/dashboard/builders/new"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#087F8C] hover:bg-[#087F8C]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#087F8C] transition-colors"
          >
            <span className="mr-2">+</span>
            Add New Builder
          </Link>
          <Link
            href="/dashboard/schemas/new"
            className="inline-flex items-center justify-center px-4 py-2 border border-[#087F8C] rounded-md shadow-sm text-sm font-medium text-[#087F8C] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#087F8C] transition-colors"
          >
            <span className="mr-2">+</span>
            Add New House Schema
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((card) => (
          <div key={card.title} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className={`rounded-lg p-2 ${card.bgColor}`}>
                <span className="text-2xl">{card.icon}</span>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-[#0F172A]">Recent Activity</h2>
              <p className="text-sm text-gray-600 mt-1">Latest house schema updates</p>
            </div>
            <div className="divide-y divide-gray-200">
              {recentActivity.length > 0 ? (
                recentActivity.map((schema) => (
                  <Link
                    key={schema.id}
                    href={`/schemas/${schema.id}`}
                    className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#0F172A]">
                          {schema.model_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          by {schema.builder.name}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(schema.updated_at)}
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-gray-500">
                  No recent activity found
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-[#0F172A] mb-4">Quick Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Verification Rate</span>
                <span className="text-sm font-medium text-[#10B981]">
                  {stats.totalSchemas > 0 
                    ? `${Math.round((stats.verifiedSchemas / stats.totalSchemas) * 100)}%`
                    : '0%'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg. Rooms per Schema</span>
                <span className="text-sm font-medium text-[#087F8C]">
                  {stats.totalSchemas > 0 
                    ? Math.round((stats.totalRooms / stats.totalSchemas) * 10) / 10
                    : '0'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending Reviews</span>
                <span className={`text-sm font-medium ${stats.unverifiedSchemas > 0 ? 'text-orange-500' : 'text-[#10B981]'}`}>
                  {stats.unverifiedSchemas}
                </span>
              </div>
            </div>
          </div>

          {stats.unverifiedSchemas > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-orange-500 text-lg mr-2">⚠️</span>
                <div>
                  <h4 className="text-sm font-medium text-orange-800">
                    Attention Required
                  </h4>
                  <p className="text-sm text-orange-700 mt-1">
                    {stats.unverifiedSchemas} house schema{stats.unverifiedSchemas !== 1 ? 's' : ''} need{stats.unverifiedSchemas === 1 ? 's' : ''} verification
                  </p>
                  <Link
                    href="/dashboard/schemas?verified=false"
                    className="text-sm text-orange-800 underline hover:text-orange-900 mt-2 inline-block"
                  >
                    Review now →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}