'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Development } from '@/lib/supabase'

interface FormData {
  street_name: string
  postcode: string
  postcode_area: string
  development_id: string
}

export default function NewStreetPage() {
  const router = useRouter()
  const [developments, setDevelopments] = useState<Development[]>([])
  const [isLoadingDevelopments, setIsLoadingDevelopments] = useState(true)
  const [formData, setFormData] = useState<FormData>({
    street_name: '',
    postcode: '',
    postcode_area: '',
    development_id: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDevelopments()
  }, [])

  const fetchDevelopments = async () => {
    try {
      const response = await fetch('/api/developments')
      if (!response.ok) throw new Error('Failed to fetch developments')
      const data = await response.json()
      setDevelopments(data || [])
    } catch (error) {
      console.error('Error fetching developments:', error)
    } finally {
      setIsLoadingDevelopments(false)
    }
  }

  const handlePostcodeChange = (postcode: string) => {
    setFormData(prev => {
      const uppercasePostcode = postcode.toUpperCase().trim()
      const postcodeArea = uppercasePostcode.split(' ')[0] || ''
      return {
        ...prev,
        postcode: uppercasePostcode,
        postcode_area: postcodeArea
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validation
    if (!formData.street_name.trim()) {
      setError('Street name is required')
      return
    }
    if (!formData.postcode.trim()) {
      setError('Postcode is required')
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        street_name: formData.street_name.trim(),
        postcode: formData.postcode.toUpperCase().trim(),
        postcode_area: formData.postcode_area.toUpperCase().trim(),
        development_id: formData.development_id || null
      }

      const response = await fetch('/api/streets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create street')
      }

      router.push('/dashboard/streets')
    } catch (err) {
      console.error('Error creating street:', err)
      setError(err instanceof Error ? err.message : 'Failed to create street')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#0F172A]">New Street</h1>
        <p className="mt-2 text-sm text-gray-600">
          Add a new street to the database
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Street Name */}
        <div>
          <label htmlFor="street_name" className="block text-sm font-medium text-[#0F172A] mb-2">
            Street Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="street_name"
            required
            value={formData.street_name}
            onChange={(e) => setFormData(prev => ({ ...prev, street_name: e.target.value }))}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#087F8C] focus:ring-[#087F8C] sm:text-sm"
            placeholder="e.g., High Street"
          />
        </div>

        {/* Postcode */}
        <div>
          <label htmlFor="postcode" className="block text-sm font-medium text-[#0F172A] mb-2">
            Postcode <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="postcode"
            required
            value={formData.postcode}
            onChange={(e) => handlePostcodeChange(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#087F8C] focus:ring-[#087F8C] sm:text-sm"
            placeholder="e.g., SW1A 1AA"
            maxLength={8}
          />
        </div>

        {/* Postcode Area (auto-populated) */}
        <div>
          <label htmlFor="postcode_area" className="block text-sm font-medium text-[#0F172A] mb-2">
            Postcode Area (Auto-populated)
          </label>
          <input
            type="text"
            id="postcode_area"
            value={formData.postcode_area}
            readOnly
            className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm cursor-not-allowed"
            placeholder="Will be extracted from postcode"
          />
          <p className="mt-1 text-xs text-gray-500">Automatically extracted from the full postcode</p>
        </div>

        {/* Development */}
        <div>
          <label htmlFor="development_id" className="block text-sm font-medium text-[#0F172A] mb-2">
            Development (Optional)
          </label>
          <select
            id="development_id"
            value={formData.development_id}
            onChange={(e) => setFormData(prev => ({ ...prev, development_id: e.target.value }))}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#087F8C] focus:ring-[#087F8C] sm:text-sm"
            disabled={isLoadingDevelopments}
          >
            <option value="">No development</option>
            {developments.map(dev => (
              <option key={dev.id} value={dev.id}>
                {dev.name}
              </option>
            ))}
          </select>
          {isLoadingDevelopments && (
            <p className="mt-1 text-xs text-gray-500">Loading developments...</p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-between pt-4">
          <Link
            href="/dashboard/streets"
            className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#087F8C] transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#087F8C] hover:bg-[#087F8C]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#087F8C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Creating...' : 'Create Street'}
          </button>
        </div>
      </form>
    </div>
  )
}
