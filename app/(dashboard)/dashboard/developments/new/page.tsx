'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface FormData {
  name: string
  postcode_area: string
  development_type: string
  year_built: number | ''
  notes: string
}

export default function NewDevelopmentPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    name: '',
    postcode_area: '',
    development_type: '',
    year_built: '',
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validation
    if (!formData.name.trim()) {
      setError('Development name is required')
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        name: formData.name.trim(),
        postcode_area: formData.postcode_area.trim() || null,
        development_type: formData.development_type.trim() || null,
        year_built: formData.year_built ? parseInt(formData.year_built.toString()) : null,
        notes: formData.notes.trim() || null
      }

      const response = await fetch('/api/developments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create development')
      }

      router.push('/dashboard/developments')
    } catch (err) {
      console.error('Error creating development:', err)
      setError(err instanceof Error ? err.message : 'Failed to create development')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#0F172A]">New Development</h1>
        <p className="mt-2 text-sm text-gray-600">
          Add a new housing development to the database
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

        {/* Development Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[#0F172A] mb-2">
            Development Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#087F8C] focus:ring-[#087F8C] sm:text-sm"
            placeholder="e.g., Riverside Gardens"
          />
        </div>

        {/* Postcode Area */}
        <div>
          <label htmlFor="postcode_area" className="block text-sm font-medium text-[#0F172A] mb-2">
            Postcode Area
          </label>
          <input
            type="text"
            id="postcode_area"
            value={formData.postcode_area}
            onChange={(e) => setFormData(prev => ({ ...prev, postcode_area: e.target.value.toUpperCase() }))}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#087F8C] focus:ring-[#087F8C] sm:text-sm"
            placeholder="e.g., SW1A"
            maxLength={4}
          />
          <p className="mt-1 text-xs text-gray-500">First part of postcode (e.g., SW1A from SW1A 1AA)</p>
        </div>

        {/* Development Type */}
        <div>
          <label htmlFor="development_type" className="block text-sm font-medium text-[#0F172A] mb-2">
            Development Type
          </label>
          <input
            type="text"
            id="development_type"
            value={formData.development_type}
            onChange={(e) => setFormData(prev => ({ ...prev, development_type: e.target.value }))}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#087F8C] focus:ring-[#087F8C] sm:text-sm"
            placeholder="e.g., Residential Estate, Mixed Use"
          />
        </div>

        {/* Year Built */}
        <div>
          <label htmlFor="year_built" className="block text-sm font-medium text-[#0F172A] mb-2">
            Year Built
          </label>
          <input
            type="number"
            id="year_built"
            value={formData.year_built}
            onChange={(e) => setFormData(prev => ({ ...prev, year_built: e.target.value ? parseInt(e.target.value) : '' }))}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#087F8C] focus:ring-[#087F8C] sm:text-sm"
            placeholder="e.g., 2020"
            min="1800"
            max={new Date().getFullYear() + 5}
          />
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-[#0F172A] mb-2">
            Notes
          </label>
          <textarea
            id="notes"
            rows={4}
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#087F8C] focus:ring-[#087F8C] sm:text-sm"
            placeholder="Additional information about this development..."
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-between pt-4">
          <Link
            href="/dashboard/developments"
            className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#087F8C] transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#087F8C] hover:bg-[#087F8C]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#087F8C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Creating...' : 'Create Development'}
          </button>
        </div>
      </form>
    </div>
  )
}
