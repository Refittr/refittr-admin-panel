'use client'

import { useState } from 'react'
import { Development } from '@/lib/supabase'
import Link from 'next/link'

interface DevelopmentsClientComponentProps {
  initialDevelopments: Development[]
}

export default function DevelopmentsClientComponent({ initialDevelopments }: DevelopmentsClientComponentProps) {
  const [developments, setDevelopments] = useState<Development[]>(initialDevelopments)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredDevelopments = developments.filter(dev =>
    dev.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex-1 max-w-lg">
            <input
              type="text"
              placeholder="Search developments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#087F8C] focus:ring-[#087F8C] sm:text-sm"
            />
          </div>
          <Link
            href="/dashboard/developments/new"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#087F8C] hover:bg-[#087F8C]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#087F8C] transition-colors"
          >
            + New Development
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
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
            {filteredDevelopments.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-sm text-gray-500">
                  {searchTerm ? 'No developments found matching your search.' : 'No developments yet. Create your first one!'}
                </td>
              </tr>
            ) : (
              filteredDevelopments.map((development) => (
                <tr key={development.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-[#0F172A]">{development.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(development.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/dashboard/developments/${development.id}`}
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
          Showing {filteredDevelopments.length} of {developments.length} development{developments.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  )
}
