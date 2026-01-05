'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Schema {
  id: string
  builder_id: string
  model_name: string
  bedrooms: number
  property_type: string
  year_from: number | null
  year_to: number | null
  floor_plan_url: string
  exterior_photo_url: string | null
  spec_sheet_url: string | null
  verified: boolean
  notes: string | null
}

interface Builder {
  id: string
  name: string
}

export default function EditSchemaPage() {
  const params = useParams()
  const router = useRouter()
  const schemaId = params.id as string
  
  const [schema, setSchema] = useState<Schema | null>(null)
  const [builders, setBuilders] = useState<Builder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [notFound, setNotFound] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    builder_id: '',
    model_name: '',
    bedrooms: 3,
    property_type: 'house',
    year_from: '',
    year_to: '',
    verified: false,
    notes: ''
  })

  // File state
  const [floorPlanFile, setFloorPlanFile] = useState<File | null>(null)
  const [exteriorPhotoFile, setExteriorPhotoFile] = useState<File | null>(null)
  const [specSheetFile, setSpecSheetFile] = useState<File | null>(null)

  useEffect(() => {
    fetchData()
  }, [schemaId])

  const fetchData = async () => {
    try {
      // Fetch schema
      const schemaRes = await fetch(`/api/schemas/${schemaId}`)
      if (schemaRes.status === 404) {
        setNotFound(true)
        setIsLoading(false)
        return
      }
      if (!schemaRes.ok) throw new Error('Failed to fetch schema')
      const schemaData = await schemaRes.json()
      setSchema(schemaData)
      
      // Populate form
      setFormData({
        builder_id: schemaData.builder_id,
        model_name: schemaData.model_name,
        bedrooms: schemaData.bedrooms,
        property_type: schemaData.property_type,
        year_from: schemaData.year_from?.toString() || '',
        year_to: schemaData.year_to?.toString() || '',
        verified: schemaData.verified,
        notes: schemaData.notes || ''
      })

      // Fetch builders
      const buildersRes = await fetch('/api/builders')
      if (!buildersRes.ok) throw new Error('Failed to fetch builders')
      const buildersData = await buildersRes.json()
      setBuilders(buildersData)
      
    } catch (error) {
      console.error('Error fetching data:', error)
      setNotFound(true)
    } finally {
      setIsLoading(false)
    }
  }

  const uploadFile = async (file: File, bucket: string): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('bucket', bucket)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) throw new Error(`Failed to upload ${bucket}`)
    
    const data = await response.json()
    return data.url
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Upload new files if selected
      let floorPlanUrl = schema!.floor_plan_url
      let exteriorPhotoUrl = schema!.exterior_photo_url
      let specSheetUrl = schema!.spec_sheet_url

      if (floorPlanFile) {
        floorPlanUrl = await uploadFile(floorPlanFile, 'floor-plans')
      }

      if (exteriorPhotoFile) {
        exteriorPhotoUrl = await uploadFile(exteriorPhotoFile, 'exterior-photos')
      }

      if (specSheetFile) {
        specSheetUrl = await uploadFile(specSheetFile, 'spec-sheets')
      }

      const payload = {
        builder_id: formData.builder_id,
        model_name: formData.model_name,
        bedrooms: formData.bedrooms,
        property_type: formData.property_type,
        year_from: formData.year_from ? parseInt(formData.year_from) : null,
        year_to: formData.year_to ? parseInt(formData.year_to) : null,
        verified: formData.verified,
        notes: formData.notes || null,
        floor_plan_url: floorPlanUrl,
        exterior_photo_url: exteriorPhotoUrl,
        spec_sheet_url: specSheetUrl
      }

      const response = await fetch(`/api/schemas/${schemaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error('Failed to update schema')

      router.push(`/dashboard/schemas/${schemaId}`)
    } catch (error) {
      console.error('Error updating schema:', error)
      alert('Failed to update schema')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (notFound || !schema) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6">
        <h1 className="text-2xl font-bold text-[#0F172A] mb-4">Schema Not Found</h1>
        <p className="text-gray-600">The schema you're looking for doesn't exist.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#0F172A]">Edit Schema</h1>
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        {/* Builder */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Builder *
          </label>
          <select
            value={formData.builder_id}
            onChange={(e) => setFormData({ ...formData, builder_id: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#087F8C]"
          >
            <option value="">Select a builder</option>
            {builders.map((builder) => (
              <option key={builder.id} value={builder.id}>
                {builder.name}
              </option>
            ))}
          </select>
        </div>

        {/* Model Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Model Name *
          </label>
          <input
            type="text"
            value={formData.model_name}
            onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#087F8C]"
          />
        </div>

        {/* Bedrooms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bedrooms *
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={formData.bedrooms}
            onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#087F8C]"
          />
        </div>

        {/* Property Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Property Type *
          </label>
          <select
            value={formData.property_type}
            onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#087F8C]"
          >
            <option value="house">House</option>
            <option value="townhouse">Townhouse</option>
            <option value="duplex">Duplex</option>
          </select>
        </div>

        {/* Year Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year From
            </label>
            <input
              type="number"
              min="1900"
              max="2100"
              value={formData.year_from}
              onChange={(e) => setFormData({ ...formData, year_from: e.target.value })}
              placeholder="e.g., 2015"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#087F8C]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year To
            </label>
            <input
              type="number"
              min="1900"
              max="2100"
              value={formData.year_to}
              onChange={(e) => setFormData({ ...formData, year_to: e.target.value })}
              placeholder="e.g., 2020"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#087F8C]"
            />
          </div>
        </div>

        {/* Verified */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="verified"
            checked={formData.verified}
            onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
            className="h-4 w-4 text-[#087F8C] focus:ring-[#087F8C] border-gray-300 rounded"
          />
          <label htmlFor="verified" className="ml-2 text-sm text-gray-700">
            Verified
          </label>
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

        {/* File Uploads */}
        <div className="border-t pt-6 space-y-4">
          <h3 className="text-lg font-semibold text-[#0F172A]">Update Files</h3>
          
          {/* Floor Plan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Floor Plan {floorPlanFile ? '(New file selected)' : schema?.floor_plan_url ? '(Current file uploaded)' : ''}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFloorPlanFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#087F8C]"
            />
            {schema?.floor_plan_url && !floorPlanFile && (
              <a 
                href={schema.floor_plan_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-[#087F8C] hover:text-[#087F8C]/80 mt-1 inline-block"
              >
                View current floor plan →
              </a>
            )}
          </div>

          {/* Exterior Photo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Exterior Photo {exteriorPhotoFile ? '(New file selected)' : schema?.exterior_photo_url ? '(Current file uploaded)' : '(Optional)'}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setExteriorPhotoFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#087F8C]"
            />
            {schema?.exterior_photo_url && !exteriorPhotoFile && (
              <a 
                href={schema.exterior_photo_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-[#087F8C] hover:text-[#087F8C]/80 mt-1 inline-block"
              >
                View current photo →
              </a>
            )}
          </div>

          {/* Spec Sheet */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Spec Sheet {specSheetFile ? '(New file selected)' : schema?.spec_sheet_url ? '(Current file uploaded)' : '(Optional - PDF or Image)'}
            </label>
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => setSpecSheetFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#087F8C]"
            />
            {schema?.spec_sheet_url && !specSheetFile && (
              <a 
                href={schema.spec_sheet_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-[#087F8C] hover:text-[#087F8C]/80 mt-1 inline-block"
              >
                View current spec sheet →
              </a>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 bg-[#087F8C] text-white rounded-md hover:bg-[#087F8C]/90 transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
