import { createSupabaseAdmin } from '@/lib/supabase'
import StreetsClientComponent from './StreetsClientComponent'

export default async function StreetsPage() {
  const supabase = createSupabaseAdmin()
  
  let streets = []
  try {
    const { data, error } = await supabase
      .from('streets')
      .select(`
        *,
        developments!development_id(name)
      `)
      .order('street_name', { ascending: true })
    
    if (error) throw error
    streets = data || []
  } catch (error) {
    console.error('Error fetching streets:', error)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#0F172A]">Streets</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage streets and their associated developments
        </p>
      </div>

      <StreetsClientComponent initialStreets={streets || []} />
    </div>
  )
}
