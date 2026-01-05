import { createSupabaseAdmin } from '@/lib/supabase'
import DevelopmentsClientComponent from './DevelopmentsClientComponent'

export const dynamic = 'force-dynamic'

export default async function DevelopmentsPage() {
  const supabase = createSupabaseAdmin()
  
  let developments = []
  try {
    const { data, error } = await supabase
      .from('developments')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) throw error
    developments = data || []
  } catch (error) {
    console.error('Error fetching developments:', error)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#0F172A]">Developments</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage housing developments in the Refittr database
        </p>
      </div>

      <DevelopmentsClientComponent initialDevelopments={developments || []} />
    </div>
  )
}
