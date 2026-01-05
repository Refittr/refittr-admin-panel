'use client'

import { useState } from 'react'
import { Street } from '@/lib/supabase'
import Link from 'next/link'

interface StreetsClientComponentProps {
  initialStreets: (Street & { developments?: { name: string } })[]
}

export default function StreetsClientComponent({ initialStreets }: StreetsClientComponentProps) {
  const [streets, setStreets] = useState(initialStreets)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredStreets = streets.filter(street =>
    street.street_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    street.developments?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex-1 max-w-lg">
            <input
              type="text"
              placeholder="Search streets or developments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#087F8C] focus:ring-[#087F8C] sm:text-sm"
            />
          </div>
          <Link
            href="/dashboard/streets/new"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#087F8C] hover:bg-[#087F8C]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#087F8C] transition-colors"
          >
            + New Street
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Street Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Development
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStreets.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
                  {searchTerm ? 'No streets found matching your search.' : 'No streets yet. Create your first one!'}
                </td>
              </tr>
            ) : (
              filteredStreets.map((street) => (
                <tr key={street.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-[#0F172A]">{street.street_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{street.developments?.name || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(street.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/dashboard/streets/${street.id}`}
                      className="text-[#087F8C] hover:text-[#087F8C]/80 mr-4"
                    >
                      Edit
                    </Link>
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
          Showing {filteredStreets.length} of {streets.length} street{streets.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  )
}
