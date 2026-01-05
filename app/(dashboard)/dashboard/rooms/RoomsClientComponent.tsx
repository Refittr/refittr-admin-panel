'use client'

import { useState } from 'react'
import { Room } from '@/lib/supabase'

interface RoomWithSchema extends Room {
  house_schemas?: {
    id: string
    model_name: string
    builders?: {
      name: string
    }
  }
}

interface Schema {
  id: string
  model_name: string
  builders?: {
    name: string
  }
}

interface RoomsClientComponentProps {
  initialRooms: RoomWithSchema[]
  schemas: Schema[]
}

export default function RoomsClientComponent({ initialRooms, schemas }: RoomsClientComponentProps) {
  const [rooms, setRooms] = useState(initialRooms)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingRoom, setEditingRoom] = useState<RoomWithSchema | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    house_schema_id: '',
    room_name: '',
    room_type: 'bedroom',
    floor_level: 0,
    length_cm: '',
    width_cm: '',
    height_cm: '240',
    dimensions_need_verification: false,
    verification_reason: '',
    notes: ''
  })

  const filteredRooms = rooms.filter(room => {
    const schemaName = room.house_schemas?.model_name || ''
    const builderName = room.house_schemas?.builders?.name || ''
    const search = searchTerm.toLowerCase()
    
    return (
      room.room_name.toLowerCase().includes(search) ||
      room.room_type.toLowerCase().includes(search) ||
      schemaName.toLowerCase().includes(search) ||
      builderName.toLowerCase().includes(search)
    )
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const lengthCm = parseInt(formData.length_cm as string)
      const widthCm = parseInt(formData.width_cm as string)
      const heightCm = parseInt(formData.height_cm as string)
      
      const payload = {
        house_schema_id: formData.house_schema_id,
        room_name: formData.room_name,
        room_type: formData.room_type,
        floor_level: formData.floor_level,
        length_cm: lengthCm,
        width_cm: widthCm,
        height_cm: heightCm,
        dimensions_need_verification: formData.dimensions_need_verification,
        verification_reason: formData.dimensions_need_verification ? formData.verification_reason : null,
        notes: formData.notes || null
      }

      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error('Failed to create room')

      window.location.reload()
    } catch (error) {
      console.error('Error creating room:', error)
      alert('Failed to create room')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (room: RoomWithSchema) => {
    setEditingRoom(room)
    setFormData({
      house_schema_id: room.house_schema_id,
      room_name: room.room_name,
      room_type: room.room_type,
      floor_level: room.floor_level,
      length_cm: room.length_cm.toString(),
      width_cm: room.width_cm.toString(),
      height_cm: room.height_cm.toString(),
      dimensions_need_verification: (room as any).dimensions_need_verification || false,
      verification_reason: (room as any).verification_reason || '',
      notes: room.notes || ''
    })
    setShowEditModal(true)
  }
      height_cm: room.height_cm.toString(),
      dimensions_need_verification: (room as any).dimensions_need_verification || false,
      verification_reason: (room as any).verification_reason || '',
      notes: room.notes || ''
    })
    setShowEditModal(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRoom) return
    
    setIsSubmitting(true)

    try {
      const lengthCm = parseInt(formData.length_cm as string)
      const widthCm = parseInt(formData.width_cm as string)
      const heightCm = parseInt(formData.height_cm as string)
      
      const payload = {
        house_schema_id: formData.house_schema_id,
        room_name: formData.room_name,
        room_type: formData.room_type,
        floor_level: formData.floor_level,
        length_cm: lengthCm,
        width_cm: widthCm,
        height_cm: heightCm,
        dimensions_need_verification: formData.dimensions_need_verification,
        verification_reason: formData.dimensions_need_verification ? formData.verification_reason : null,
        notes: formData.notes || null
      }

      const response = await fetch(`/api/rooms/${editingRoom.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error('Failed to update room')

      window.location.reload()
    } catch (error) {
      console.error('Error updating room:', error)
      alert('Failed to update room')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return

    try {
      const response = await fetch(`/api/rooms/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete room')

      setRooms(rooms.filter(r => r.id !== id))
    } catch (error) {
      console.error('Error deleting room:', error)
      alert('Failed to delete room')
    }
  }

  return (
    <>
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex-1 max-w-lg">
              <input
                type="text"
                placeholder="Search rooms, schemas, or builders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#087F8C] focus:ring-[#087F8C] sm:text-sm"
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#087F8C] hover:bg-[#087F8C]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#087F8C] transition-colors"
            >
              + Add Room
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schema
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dimensions
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Floor Area
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRooms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                    {searchTerm ? 'No rooms found matching your search.' : 'No rooms yet. Add your first one!'}
                  </td>
                </tr>
              ) : (
                filteredRooms.map((room) => (
                  <tr key={room.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-[#0F172A] flex items-center">
                        {room.room_name}
                        {(room as any).dimensions_need_verification && (
                          <span 
                            className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800" 
                            title={(room as any).verification_reason || "Dimensions need verification"}
                          >
                            ⚠️
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">Floor {room.floor_level}</div>
                      {(room as any).dimensions_need_verification && (room as any).verification_reason && (
                        <div className="text-xs text-yellow-700 mt-1">⚠️ {(room as any).verification_reason}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 capitalize">{room.room_type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{room.house_schemas?.model_name || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{room.house_schemas?.builders?.name || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {(room.length_cm / 100).toFixed(2)}m × {(room.width_cm / 100).toFixed(2)}m × {(room.height_cm / 100).toFixed(2)}m
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{room.floor_area_sqm.toFixed(2)} m²</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(room)}
                        className="text-[#087F8C] hover:text-[#087F8C]/80 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(room.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-500">
            Showing {filteredRooms.length} of {rooms.length} room{rooms.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Add/Edit Room Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-[#0F172A] mb-4">
                {showEditModal ? 'Edit Room' : 'Add Room'}
              </h2>
              
              <form onSubmit={showEditModal ? handleUpdate : handleSubmit} className="space-y-4">
                {/* Schema Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    House Schema *
                  </label>
                  <select
                    value={formData.house_schema_id}
                    onChange={(e) => setFormData({ ...formData, house_schema_id: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#087F8C]"
                  >
                    <option value="">Select a schema</option>
                    {schemas.map((schema) => (
                      <option key={schema.id} value={schema.id}>
                        {schema.model_name} ({schema.builders?.name || 'Unknown Builder'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Room Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Name *
                  </label>
                  <input
                    type="text"
                    value={formData.room_name}
                    onChange={(e) => setFormData({ ...formData, room_name: e.target.value })}
                    required
                    placeholder="e.g., Master Bedroom"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#087F8C]"
                  />
                </div>

                {/* Room Type & Floor */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Room Type *
                    </label>
                    <select
                      value={formData.room_type}
                      onChange={(e) => setFormData({ ...formData, room_type: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#087F8C]"
                    >
                      <option value="bedroom">Bedroom</option>
                      <option value="bathroom">Bathroom</option>
                      <option value="living">Living Room</option>
                      <option value="dining">Dining Room</option>
                      <option value="kitchen">Kitchen</option>
                      <option value="kitchen/dining">Kitchen/Dining</option>
                      <option value="hallway">Hallway</option>
                      <option value="utility">Utility</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Floor Level *
                    </label>
                    <input
                      type="number"
                      value={formData.floor_level}
                      onChange={(e) => setFormData({ ...formData, floor_level: parseInt(e.target.value) })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#087F8C]"
                    />
                  </div>
                </div>

                {/* Dimensions */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Length (cm) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.length_cm}
                      onChange={(e) => setFormData({ ...formData, length_cm: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#087F8C]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Width (cm) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.width_cm}
                      onChange={(e) => setFormData({ ...formData, width_cm: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#087F8C]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Height (cm) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.height_cm}
                      onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#087F8C]"
                    />
                  </div>
                </div>

                {/* Dimensions Verification Flag */}
                <div className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <input
                    type="checkbox"
                    id="dimensions_need_verification"
                    checked={formData.dimensions_need_verification}
                    onChange={(e) => setFormData({ ...formData, dimensions_need_verification: e.target.checked })}
                    className="h-4 w-4 text-[#087F8C] focus:ring-[#087F8C] border-gray-300 rounded mt-0.5"
                  />
                  <div className="flex-1">
                    <label htmlFor="dimensions_need_verification" className="text-sm font-medium text-gray-900 cursor-pointer">
                      Dimensions need verification
                    </label>
                    <p className="text-xs text-gray-600 mt-1">
                      Check this if dimensions exclude fixtures (e.g., fitted wardrobes) or need verification before matching
                    </p>
                    
                    {formData.dimensions_need_verification && (
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Reason for verification
                        </label>
                        <input
                          type="text"
                          value={formData.verification_reason}
                          onChange={(e) => setFormData({ ...formData, verification_reason: e.target.value })}
                          placeholder="e.g., Excludes fitted wardrobes"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#087F8C] text-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#087F8C]"
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      setShowEditModal(false)
                      setEditingRoom(null)
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-[#087F8C] text-white rounded-md text-sm font-medium hover:bg-[#087F8C]/90 disabled:opacity-50"
                  >
                    {isSubmitting 
                      ? (showEditModal ? 'Updating...' : 'Adding...') 
                      : (showEditModal ? 'Update Room' : 'Add Room')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
