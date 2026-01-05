'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

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
  created_at: string
  builder?: { name: string }
  streets?: Array<{ street_id: string }>
}

export default function ViewSchemaPage() {
  const params = useParams()
  const router = useRouter()
  const schemaId = params.id as string
  
  const [schema, setSchema] = useState<Schema | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetchSchema()
  }, [schemaId])

  const fetchSchema = async () => {
    try {
      const response = await fetch(`/api/schemas/${schemaId}`)
      
      if (response.status === 404) {
        setNotFound(true)
        return
      }
      
      if (!response.ok) throw new Error('Failed to fetch schema')
      
      const data = await response.json()
      setSchema(data)
    } catch (error) {
      console.error('Error fetching schema:', error)
      setNotFound(true)
    } finally {
      setIsLoading(false)
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
        <p className="text-gray-600 mb-4">The schema you're looking for doesn't exist.</p>
        <Link
          href="/dashboard/schemas"
          className="text-[#087F8C] hover:text-[#087F8C]/80 font-medium"
        >
          ← Back to Schemas
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A]">{schema.model_name}</h1>
          <p className="text-gray-600 mt-1">
            {schema.builder?.name || 'Unknown Builder'}
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            href={`/dashboard/schemas/${schema.id}/edit`}
            className="px-4 py-2 bg-[#087F8C] text-white rounded-md hover:bg-[#087F8C]/90 transition-colors"
          >
            Edit
          </Link>
          <Link
            href="/dashboard/schemas"
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Back
          </Link>
        </div>
      </div>

      {/* Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Bedrooms</label>
            <p className="text-[#0F172A]">{schema.bedrooms}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Property Type</label>
            <p className="text-[#0F172A] capitalize">{schema.property_type}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Year Range</label>
            <p className="text-[#0F172A]">
              {schema.year_from && schema.year_to 
                ? `${schema.year_from}-${schema.year_to}`
                : schema.year_from 
                ? `${schema.year_from}+`
                : 'Not specified'}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Verified</label>
            <p className="text-[#0F172A]">
              {schema.verified ? (
                <span className="text-green-600">✓ Verified</span>
              ) : (
                <span className="text-gray-500">Not verified</span>
              )}
            </p>
          </div>
        </div>

        {schema.notes && (
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Notes</label>
            <p className="text-[#0F172A]">{schema.notes}</p>
          </div>
        )}

        {/* Files */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-[#0F172A] mb-4">Files</h3>
          <div className="space-y-3">
            {schema.floor_plan_url && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Floor Plan</label>
                <a 
                  href={schema.floor_plan_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#087F8C] hover:text-[#087F8C]/80"
                >
                  View Floor Plan →
                </a>
              </div>
            )}
            
            {schema.exterior_photo_url && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Exterior Photo</label>
                <a 
                  href={schema.exterior_photo_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#087F8C] hover:text-[#087F8C]/80"
                >
                  View Photo →
                </a>
              </div>
            )}
            
            {schema.spec_sheet_url && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Spec Sheet</label>
                <a 
                  href={schema.spec_sheet_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#087F8C] hover:text-[#087F8C]/80"
                >
                  View Spec Sheet →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
