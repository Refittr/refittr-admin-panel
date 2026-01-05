'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { Builder } from '@/lib/supabase'

interface BuilderWithStats extends Builder {
  schema_count: number
}

interface BuildersClientComponentProps {
  builders: BuilderWithStats[]
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export default function BuildersClientComponent({ builders: initialBuilders }: BuildersClientComponentProps) {
  const [builders, setBuilders] = useState<BuilderWithStats[]>(initialBuilders)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  // Filter builders based on search query
  const filteredBuilders = useMemo(() => {
    if (!searchQuery.trim()) return builders
    
    return builders.filter(builder =>
      builder.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [builders, searchQuery])

  const showToast = (type: 'success' | 'error', message: string) => {
    setToastMessage({ type, message })
    setTimeout(() => setToastMessage(null), 5000)
  }

  const handleDelete = async (builderId: string) => {
    if (isDeleting) return

    setIsDeleting(builderId)
    
    try {
      const response = await fetch(`/api/builders/${builderId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete builder')
      }

      // Remove builder from local state
      setBuilders(prev => prev.filter(b => b.id !== builderId))
      showToast('success', 'Builder deleted successfully')
    } catch (error) {
      console.error('Error deleting builder:', error)
      showToast('error', 'Failed to delete builder. Please try again.')
    } finally {
      setIsDeleting(null)
      setShowDeleteDialog(null)
    }
  }

  const confirmDelete = (builder: BuilderWithStats) => {
    setShowDeleteDialog(builder.id)
  }

  if (builders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="text-6xl mb-4">🏗️</div>
        <h2 className="text-xl font-medium text-[#0F172A] mb-2">
          No builders yet
        </h2>
        <p className="text-gray-600 mb-6">
          Get started by adding your first construction company or home builder.
        </p>
        <Link
          href="/dashboard/builders/new"
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-[#087F8C] hover:bg-[#087F8C]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#087F8C] transition-colors"
        >
          <span className="mr-2">+</span>
          Add Your First Builder
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Search Box */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="max-w-md">
          <label htmlFor="search" className="block text-sm font-medium text-[#0F172A] mb-2">
            Search Builders
          </label>
          <div className="relative">
            <input
              type="text"
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by builder name..."
              className="block w-full pr-10 border-gray-300 rounded-md focus:ring-[#087F8C] focus:border-[#087F8C] sm:text-sm"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Builders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredBuilders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-[#0F172A] mb-2">
              No builders found
            </h3>
            <p className="text-gray-600">
              No builders match your search criteria. Try adjusting your search terms.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Builder
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    House Schemas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBuilders.map((builder) => (
                  <tr key={builder.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          {builder.logo_url ? (
                            <img
                              className="h-12 w-12 rounded-lg object-cover"
                              src={builder.logo_url}
                              alt={`${builder.name} logo`}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-[#087F8C]/10 flex items-center justify-center">
                              <span className="text-[#087F8C] font-medium text-lg">
                                {builder.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-[#0F172A]">
                            {builder.name}
                          </div>
                          {builder.notes && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {builder.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[#0F172A] font-medium">
                        {builder.schema_count}
                      </div>
                      <div className="text-sm text-gray-500">
                        {builder.schema_count === 1 ? 'schema' : 'schemas'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(builder.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/builders/${builder.id}`}
                          className="text-[#087F8C] hover:text-[#087F8C]/80 font-medium"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => confirmDelete(builder)}
                          disabled={isDeleting === builder.id}
                          className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                        >
                          {isDeleting === builder.id ? 'Deleting...' : 'Delete'}
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Builder</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete this builder? This action cannot be undone.
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