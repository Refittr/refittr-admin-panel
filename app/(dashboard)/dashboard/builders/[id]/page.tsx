'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Builder } from '@/lib/supabase'

interface FormData {
  name: string
  notes: string
  logo_url: string | null
}

interface FormErrors {
  name?: string
  logo?: string
  submit?: string
  notes?: string
}

export default function EditBuilderPage() {
  const router = useRouter()
  const params = useParams()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const builderId = params.id as string
  
  const [builder, setBuilder] = useState<Builder | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    notes: '',
    logo_url: null
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    fetchBuilder()
  }, [builderId])

  const fetchBuilder = async () => {
    try {
      const { data, error } = await supabase
        .from('builders')
        .select('*')
        .eq('id', builderId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          setNotFound(true)
        } else {
          throw error
        }
        return
      }

      setBuilder(data)
      setFormData({
        name: data.name,
        notes: data.notes || '',
        logo_url: data.logo_url
      })
    } catch (error) {
      console.error('Error fetching builder:', error)
      setNotFound(true)
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Builder name is required'
    } else if (formData.name.length > 100) {
      newErrors.name = 'Builder name must be 100 characters or less'
    }

    if (formData.notes.length > 500) {
      newErrors.name = 'Notes must be 500 characters or less'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, logo: 'Please select an image file' }))
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, logo: 'Image must be smaller than 5MB' }))
      return
    }

    setSelectedFile(file)
    setErrors(prev => ({ ...prev, logo: undefined }))

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const deleteOldLogo = async (logoUrl: string | null) => {
    if (!logoUrl) return

    try {
      // Extract file path from URL
      const url = new URL(logoUrl)
      const pathParts = url.pathname.split('/')
      const bucketIndex = pathParts.findIndex(part => part === 'builder-logos')
      
      if (bucketIndex !== -1) {
        const filePath = pathParts.slice(bucketIndex + 1).join('/')
        await supabase.storage
          .from('builder-logos')
          .remove([filePath])
      }
    } catch (error) {
      console.error('Error deleting old logo:', error)
    }
  }

  const uploadLogo = async (file: File): Promise<string | null> => {
    setIsUploadingLogo(true)
    setUploadProgress(0)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`
      const filePath = `builder-logos/${fileName}`

      const { data, error } = await supabase.storage
        .from('builder-logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('builder-logos')
        .getPublicUrl(data.path)

      setUploadProgress(100)
      return urlData.publicUrl
    } catch (error) {
      console.error('Error uploading logo:', error)
      setErrors(prev => ({ ...prev, logo: 'Failed to upload logo. Please try again.' }))
      return null
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !builder) return

    setIsSubmitting(true)
    setErrors(prev => ({ ...prev, submit: undefined }))

    try {
      let logoUrl = formData.logo_url

      // Handle logo upload/replacement
      if (selectedFile) {
        // Delete old logo if it exists
        if (builder.logo_url) {
          await deleteOldLogo(builder.logo_url)
        }
        
        // Upload new logo
        logoUrl = await uploadLogo(selectedFile)
        if (!logoUrl) {
          setIsSubmitting(false)
          return
        }
      }

      // Update builder in database
      const { error } = await supabase
        .from('builders')
        .update({
          name: formData.name.trim(),
          notes: formData.notes.trim() || null,
          logo_url: logoUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', builderId)

      if (error) throw error

      setSuccessMessage('Builder updated successfully!')
      
      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.push('/builders')
      }, 1500)

    } catch (error) {
      console.error('Error updating builder:', error)
      setErrors(prev => ({ 
        ...prev, 
        submit: 'Failed to update builder. Please try again.' 
      }))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!builder) return

    setIsDeleting(true)

    try {
      // Delete logo from storage if it exists
      if (builder.logo_url) {
        await deleteOldLogo(builder.logo_url)
      }

      // Delete builder from database
      const { error } = await supabase
        .from('builders')
        .delete()
        .eq('id', builderId)

      if (error) throw error

      setSuccessMessage('Builder deleted successfully!')
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/builders')
      }, 1000)

    } catch (error) {
      console.error('Error deleting builder:', error)
      setErrors(prev => ({ 
        ...prev, 
        submit: 'Failed to delete builder. Please try again.' 
      }))
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const clearLogo = () => {
    setSelectedFile(null)
    setLogoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getCurrentLogo = () => {
    if (logoPreview) return logoPreview
    return formData.logo_url
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin mx-auto h-8 w-8 border-b-2 border-[#087F8C] mb-4"></div>
          <p className="text-gray-600">Loading builder...</p>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-xl font-medium text-[#0F172A] mb-2">
            Builder Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The builder you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href="/builders"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#087F8C] hover:bg-[#087F8C]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#087F8C] transition-colors"
          >
            Back to Builders
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0F172A]">Edit Builder</h1>
        <p className="mt-2 text-gray-600">
          Update {builder?.name} information
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-green-500 text-lg mr-2">✅</span>
            <p className="text-green-800">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        {/* Builder Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[#0F172A] mb-2">
            Builder Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            maxLength={100}
            className={`block w-full rounded-md shadow-sm focus:ring-[#087F8C] focus:border-[#087F8C] sm:text-sm ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter builder name..."
          />
          <div className="mt-1 flex justify-between">
            {errors.name ? (
              <p className="text-sm text-red-600">{errors.name}</p>
            ) : (
              <div></div>
            )}
            <p className="text-sm text-gray-500">
              {formData.name.length}/100
            </p>
          </div>
        </div>

        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-[#0F172A] mb-2">
            Logo
          </label>
          
          {getCurrentLogo() ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <img
                  src={getCurrentLogo() || ''}
                  alt="Builder logo"
                  className="h-20 w-20 rounded-lg object-cover border border-gray-300"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#0F172A]">
                    {selectedFile ? selectedFile.name : 'Current logo'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'Existing logo'}
                  </p>
                </div>
                <div className="flex space-x-2">
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={clearLogo}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove New
                    </button>
                  )}
                  <label
                    htmlFor="logo"
                    className="cursor-pointer text-[#087F8C] hover:text-[#087F8C]/80 text-sm font-medium"
                  >
                    Change
                  </label>
                </div>
              </div>
              
              {isUploadingLogo && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#087F8C] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-[#087F8C] transition-colors">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="logo"
                      className="relative cursor-pointer rounded-md font-medium text-[#087F8C] hover:text-[#087F8C]/80"
                    >
                      <span>Upload a logo</span>
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 5MB</p>
                </div>
              </div>
            </div>
          )}
          
          <input
            id="logo"
            ref={fileInputRef}
            name="logo"
            type="file"
            className="sr-only"
            accept="image/*"
            onChange={handleFileSelect}
          />
          
          {errors.logo && (
            <p className="mt-1 text-sm text-red-600">{errors.logo}</p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-[#0F172A] mb-2">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            rows={4}
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            maxLength={500}
            className={`block w-full rounded-md shadow-sm focus:ring-[#087F8C] focus:border-[#087F8C] sm:text-sm ${
              errors.notes ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Add any additional notes about this builder..."
          />
          <div className="mt-1 flex justify-between">
            {errors.notes ? (
              <p className="text-sm text-red-600">{errors.notes}</p>
            ) : (
              <div></div>
            )}
            <p className="text-sm text-gray-500">
              {formData.notes.length}/500
            </p>
          </div>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-red-500 text-lg mr-2">❌</span>
              <p className="text-red-800">{errors.submit}</p>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:space-x-3 space-y-3 sm:space-y-0 pt-6 border-t border-gray-200">
          {/* Delete Button */}
          <button
            type="button"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isDeleting || isSubmitting}
            className="inline-flex justify-center py-2 px-4 border border-red-300 rounded-md shadow-sm bg-white text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Delete Builder
          </button>

          {/* Main Actions */}
          <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
            <Link
              href="/builders"
              className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#087F8C] transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || isUploadingLogo}
              className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#087F8C] hover:bg-[#087F8C]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#087F8C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Updating Builder...
                </div>
              ) : (
                'Update Builder'
              )}
            </button>
          </div>
        </div>
      </form>

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
                Are you sure you want to delete <strong>{builder?.name}</strong>? This action cannot be undone and will also delete the associated logo.
              </p>
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </div>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}