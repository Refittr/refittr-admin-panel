'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import type { HouseSchema, Builder } from '@/lib/supabase'

interface SchemaWithBuilder extends HouseSchema {
  builder: Builder
  room_count: number
  street_count: number
}

interface SchemasClientComponentProps {
  schemas: SchemaWithBuilder[]
  builders: Builder[]
  totalCount: number
  totalPages: number
  currentPage: number
  initialFilters: {
    search: string
    builder: string
    bedrooms: string
    propertyType: string
    unverified: boolean
    sortBy: string
    sortOrder: string
  }
}

interface Filters {
  search: string
  builder: string
  bedrooms: string
  propertyType: string
  unverified: boolean
  sortBy: string
  sortOrder: string
  page?: string
}

const bedroomOptions = [
  { value: 'all', label: 'All Bedrooms' },
  { value: '2', label: '2 Bedrooms' },
  { value: '3', label: '3 Bedrooms' },
  { value: '4', label: '4 Bedrooms' },
  { value: '5+', label: '5+ Bedrooms' }
]

const propertyTypeOptions = [
  { value: 'all', label: 'All Property Types' },
  { value: 'Detached', label: 'Detached' },
  { value: 'Semi-detached', label: 'Semi-detached' },
  { value: 'Terraced', label: 'Terraced' },
  { value: 'Flat', label: 'Flat' }
]

const sortOptions = [
  { value: 'created_at', label: 'Created Date' },
  { value: 'model_name', label: 'Model Name' },
  { value: 'bedrooms', label: 'Bedrooms' },
  { value: 'verified', label: 'Verified Status' }
]

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function formatYearRange(yearFrom: number | null, yearTo: number | null): string {
  if (!yearFrom && !yearTo) return 'N/A'
  if (yearFrom && yearTo && yearFrom !== yearTo) {
    return `${yearFrom}-${yearTo}`
  }
  if (yearFrom && !yearTo) {
    return `${yearFrom}+`
  }
  if (!yearFrom && yearTo) {
    return `Up to ${yearTo}`
  }
  return yearFrom?.toString() || yearTo?.toString() || 'N/A'
}

export default function SchemasClientComponent({
  schemas: initialSchemas,
  builders,
  totalCount,
  totalPages,
  currentPage,
  initialFilters
}: SchemasClientComponentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [schemas, setSchemas] = useState<SchemaWithBuilder[]>(initialSchemas)
  const [filters, setFilters] = useState<Filters>(initialFilters)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  const showToast = (type: 'success' | 'error', message: string) => {
    setToastMessage({ type, message })
    setTimeout(() => setToastMessage(null), 5000)
  }

  const updateURL = (newFilters: Partial<Filters>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    Object.entries({ ...filters, ...newFilters }).forEach(([key, value]) => {
      if (value === '' || value === false || value === 'all') {
        params.delete(key)
      } else {
        params.set(key, value.toString())
      }
    })

    // Reset to page 1 when filters change (except for page navigation)
    if (!('page' in newFilters)) {
      params.delete('page')
    }

    router.push(`/schemas?${params.toString()}`)
  }

  const handleFilterChange = (key: keyof Filters, value: string | boolean) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    updateURL(newFilters)
  }

  const handleSort = (column: string) => {
    const newSortOrder = filters.sortBy === column && filters.sortOrder === 'asc' ? 'desc' : 'asc'
    const newFilters = { ...filters, sortBy: column, sortOrder: newSortOrder }
    setFilters(newFilters)
    updateURL(newFilters)
  }

  const handlePageChange = (page: number) => {
    updateURL({ page: page.toString() })
  }

  const handleDelete = async (schemaId: string) => {
    if (isDeleting) return

    setIsDeleting(schemaId)
    
    try {
      const response = await fetch(`/api/schemas/${schemaId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete schema')

      // Remove schema from local state
      setSchemas(prev => prev.filter(s => s.id !== schemaId))
      showToast('success', 'House schema deleted successfully')
    } catch (error) {
      console.error('Error deleting schema:', error)
      showToast('error', 'Failed to delete house schema. Please try again.')
    } finally {
      setIsDeleting(null)
      setShowDeleteDialog(null)
    }
  }

  const confirmDelete = (schema: SchemaWithBuilder) => {
    setShowDeleteDialog(schema.id)
  }

  const getSortIcon = (column: string) => {
    if (filters.sortBy !== column) return '↕️'
    return filters.sortOrder === 'asc' ? '↑' : '↓'
  }

  if (schemas.length === 0 && Object.values(filters).every(v => !v || v === 'all')) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="text-6xl mb-4">🏠</div>
        <h2 className="text-xl font-medium text-[#0F172A] mb-2">
          No house schemas yet
        </h2>
        <p className="text-gray-600 mb-6">
          Get started by adding your first house schema with floor plans and room details.
        </p>
        <Link
          href="/dashboard/schemas/new"
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-[#087F8C] hover:bg-[#087F8C]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#087F8C] transition-colors"
        >
          <span className="mr-2">+</span>
          Add Your First House Schema
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-[#0F172A] mb-2">
              Search Model
            </label>
            <input
              type="text"
              id="search"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search by model name..."
              className="block w-full border-gray-300 rounded-md focus:ring-[#087F8C] focus:border-[#087F8C] sm:text-sm"
            />
          </div>

          {/* Builder Filter */}
          <div>
            <label htmlFor="builder" className="block text-sm font-medium text-[#0F172A] mb-2">
              Builder
            </label>
            <select
              id="builder"
              value={filters.builder}
              onChange={(e) => handleFilterChange('builder', e.target.value)}
              className="block w-full border-gray-300 rounded-md focus:ring-[#087F8C] focus:border-[#087F8C] sm:text-sm"
            >
              <option value="">All Builders</option>
              {builders.map(builder => (
                <option key={builder.id} value={builder.id}>
                  {builder.name}
                </option>
              ))}
            </select>
          </div>

          {/* Bedrooms Filter */}
          <div>
            <label htmlFor="bedrooms" className="block text-sm font-medium text-[#0F172A] mb-2">
              Bedrooms
            </label>
            <select
              id="bedrooms"
              value={filters.bedrooms}
              onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
              className="block w-full border-gray-300 rounded-md focus:ring-[#087F8C] focus:border-[#087F8C] sm:text-sm"
            >
              {bedroomOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Property Type Filter */}
          <div>
            <label htmlFor="propertyType" className="block text-sm font-medium text-[#0F172A] mb-2">
              Property Type
            </label>
            <select
              id="propertyType"
              value={filters.propertyType}
              onChange={(e) => handleFilterChange('propertyType', e.target.value)}
              className="block w-full border-gray-300 rounded-md focus:ring-[#087F8C] focus:border-[#087F8C] sm:text-sm"
            >
              {propertyTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label htmlFor="sortBy" className="block text-sm font-medium text-[#0F172A] mb-2">
              Sort By
            </label>
            <div className="flex space-x-2">
              <select
                id="sortBy"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="block w-full border-gray-300 rounded-md focus:ring-[#087F8C] focus:border-[#087F8C] sm:text-sm"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                {filters.sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Additional Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="unverified"
              checked={filters.unverified}
              onChange={(e) => handleFilterChange('unverified', e.target.checked)}
              className="h-4 w-4 text-[#087F8C] focus:ring-[#087F8C] border-gray-300 rounded"
            />
            <label htmlFor="unverified" className="ml-2 text-sm text-gray-900">
              Show only unverified schemas
            </label>
          </div>
          <div className="text-sm text-gray-500 mt-2 sm:mt-0">
            {totalCount} schema{totalCount !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Schemas Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {schemas.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-[#0F172A] mb-2">
              No schemas found
            </h3>
            <p className="text-gray-600">
              No house schemas match your search criteria. Try adjusting your filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schema
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('model_name')}
                  >
                    Model {getSortIcon('model_name')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('bedrooms')}
                  >
                    Bedrooms {getSortIcon('bedrooms')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type & Year
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('verified')}
                  >
                    Status {getSortIcon('verified')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {schemas.map((schema) => (
                  <tr 
                    key={schema.id} 
                    className={`hover:bg-gray-50 ${!schema.verified ? 'bg-amber-50' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          {schema.exterior_photo_url ? (
                            <img
                              className="h-12 w-12 rounded-lg object-cover"
                              src={schema.exterior_photo_url}
                              alt={`${schema.model_name} exterior`}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 text-lg">🏠</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-[#0F172A]">
                            {schema.builder.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(schema.created_at)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-[#0F172A]">
                        {schema.model_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[#0F172A] font-medium">
                        {schema.bedrooms}
                      </div>
                      <div className="text-sm text-gray-500">
                        bedroom{schema.bedrooms !== 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[#0F172A] font-medium">
                        {schema.property_type}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatYearRange(schema.year_from, schema.year_to)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {schema.verified ? (
                          <>
                            <span className="text-green-500 text-lg mr-2">✅</span>
                            <span className="text-sm text-green-800 font-medium">Verified</span>
                          </>
                        ) : (
                          <>
                            <span className="text-red-500 text-lg mr-2">❌</span>
                            <span className="text-sm text-red-800 font-medium">Unverified</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[#0F172A]">
                        {schema.room_count} room{schema.room_count !== 1 ? 's' : ''}
                      </div>
                      <div className="text-sm text-gray-500">
                        {schema.street_count} street{schema.street_count !== 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/schemas/${schema.id}`}
                          className="text-[#024059] hover:text-[#024059]/80 font-medium"
                        >
                          View
                        </Link>
                        <Link
                          href={`/schemas/${schema.id}/edit`}
                          className="text-[#087F8C] hover:text-[#087F8C]/80 font-medium"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => confirmDelete(schema)}
                          disabled={isDeleting === schema.id}
                          className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                        >
                          {isDeleting === schema.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing page {currentPage} of {totalPages} ({totalCount} total schemas)
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <div className="flex space-x-1">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const page = Math.max(1, Math.min(currentPage - 2 + i, totalPages - 4 + i))
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 border rounded text-sm font-medium ${
                        page === currentPage
                          ? 'border-[#087F8C] bg-[#087F8C] text-white'
                          : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete House Schema</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete this house schema? This action cannot be undone and will also delete all associated room data.
              </p>
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={() => setShowDeleteDialog(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteDialog)}
                  disabled={isDeleting === showDeleteDialog}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isDeleting === showDeleteDialog ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Message */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
          toastMessage.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center">
            <span className="mr-2">
              {toastMessage.type === 'success' ? '✅' : '❌'}
            </span>
            {toastMessage.message}
          </div>
        </div>
      )}
    </>
  )
}