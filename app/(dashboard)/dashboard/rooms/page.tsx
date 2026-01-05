import { createSupabaseAdmin } from '@/lib/supabase'
import RoomsClientComponent from './RoomsClientComponent'

export const dynamic = 'force-dynamic'

export default async function RoomsPage() {
  const supabase = createSupabaseAdmin()
  
  let rooms = []
  let schemas = []
  
  try {
    const [roomsData, schemasData] = await Promise.all([
      supabase
        .from('rooms')
        .select(`
          *,
          house_schemas!house_schema_id(
            id,
            model_name,
            builders!builder_id(name)
          )
        `)
        .order('created_at', { ascending: false }),
      supabase
        .from('house_schemas')
        .select('id, model_name, builders!builder_id(name)')
        .order('model_name', { ascending: true })
    ])
    
    if (roomsData.error) throw roomsData.error
    if (schemasData.error) throw schemasData.error
    
    rooms = roomsData.data || []
    schemas = schemasData.data || []
  } catch (error) {
    console.error('Error fetching data:', error)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#0F172A]">Rooms</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage rooms for house schemas
        </p>
      </div>

      <RoomsClientComponent initialRooms={rooms || []} schemas={schemas || []} />
    </div>
  )
}
