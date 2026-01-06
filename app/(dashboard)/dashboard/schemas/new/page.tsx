'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Builder, Street, Development } from '@/lib/supabase'

interface FormData {
  // Step 1: Basic Information
  builder_id: string
  model_name: string
  bedrooms: number | ''
  property_type: 'Detached' | 'Semi-detached' | 'Terraced' | 'Flat' | ''
  year_from: number | ''
  year_to: number | ''
  notes: string
  
  // Step 2: File Uploads (to be implemented)
  floor_plan_url: string | null
  exterior_photo_url: string | null
  spec_sheet_url: string | null
  
  // Step 3: Streets
  street_ids: string[]
  
  // Step 4: Review (to be implemented)
  verified: boolean
}

interface ValidationErrors {
  builder_id?: string
  model_name?: string
  bedrooms?: string
  property_type?: string
  year_from?: string
  year_to?: string
  floor_plan?: string
  exterior_photo?: string
  spec_sheet?: string
  streets?: string
}

const STEPS = [
  { number: 1, title: 'Basic Information' },
  { number: 2, title: 'File Uploads' },
  { number: 3, title: 'Link Streets' },
  { number: 4, title: 'Review & Submit' }
]

const PROPERTY_TYPES = ['Detached', 'Semi-detached', 'Terraced', 'Flat'] as const

export default function NewSchemaPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [builders, setBuilders] = useState<Builder[]>([])
  const [isLoadingBuilders, setIsLoadingBuilders] = useState(true)
  
  const [formData, setFormData] = useState<FormData>({
    builder_id: '',
    model_name: '',
    bedrooms: '',
    property_type: '',
    year_from: '',
    year_to: '',
    notes: '',
    floor_plan_url: null,
    exterior_photo_url: null,
    spec_sheet_url: null,
    street_ids: [],
    verified: false
  })
  
  const [errors, setErrors] = useState<ValidationErrors>({})
  
  // File upload state
  const [selectedFiles, setSelectedFiles] = useState<{
    floor_plan: File | null
    exterior_photo: File | null
    spec_sheet: File | null
  }>({
    floor_plan: null,
    exterior_photo: null,
    spec_sheet: null
  })
  const [floorPlanPreview, setFloorPlanPreview] = useState<string | null>(null)
  const [exteriorPhotoPreview, setExteriorPhotoPreview] = useState<string | null>(null)
  const [specSheetPreview, setSpecSheetPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  // Step 3: Streets state
  const [streetSearch, setStreetSearch] = useState('')
  const [searchResults, setSearchResults] = useState<Street[]>([])
  const [selectedStreets, setSelectedStreets] = useState<Street[]>([])
  
  // Step 4: Review & Submit state
  const [reviewConfirmed, setReviewConfirmed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [developments, setDevelopments] = useState<Development[]>([])
  const [showAddStreetForm, setShowAddStreetForm] = useState(false)
  const [showAddDevelopmentForm, setShowAddDevelopmentForm] = useState(false)
  const [isCreatingStreet, setIsCreatingStreet] = useState(false)
  const [isCreatingDevelopment, setIsCreatingDevelopment] = useState(false)
  const [newStreetData, setNewStreetData] = useState({
    street_name: '',
    postcode: '',
    postcode_area: '',
    development_id: ''
  })
  const [newDevelopmentData, setNewDevelopmentData] = useState({
    name: '',
    postcode_area: '',
    development_type: '',
    year_built: '' as number | '',
    notes: ''
  })
  
  // Step 4: Submit state

  useEffect(() => {
    fetchBuilders()
  }, [])

  useEffect(() => {
    if (currentStep === 3) {
      fetchDevelopments()
    }
  }, [currentStep])

  const fetchBuilders = async () => {
    try {
      const response = await fetch('/api/builders')
      if (!response.ok) throw new Error('Failed to fetch builders')
      const data = await response.json()
      setBuilders(data || [])
    } catch (error) {
      console.error('Error fetching builders:', error)
    } finally {
      setIsLoadingBuilders(false)
    }
  }

  const fetchDevelopments = async () => {
    try {
      const response = await fetch('/api/developments')
      if (!response.ok) throw new Error('Failed to fetch developments')
      const data = await response.json()
      setDevelopments(data || [])
    } catch (error) {
      console.error('Error fetching developments:', error)
    }
  }

  const searchStreets = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    try {
      const response = await fetch('/api/streets')
      if (!response.ok) throw new Error('Failed to fetch streets')
      const allStreets = await response.json()
      
      // Filter streets client-side - search by street name, postcode, or postcode area
      const filtered = allStreets.filter((street: Street) => 
        street.street_name.toLowerCase().includes(query.toLowerCase()) ||
        street.postcode_area.toLowerCase().includes(query.toLowerCase()) ||
        (street.postcode && street.postcode.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 20)
      
      setSearchResults(filtered)
    } catch (error) {
      console.error('Error searching streets:', error)
    }
  }

  const handleStreetSelect = (street: Street) => {
    if (!selectedStreets.find(s => s.id === street.id)) {
      const updated = [...selectedStreets, street]
      setSelectedStreets(updated)
      setFormData(prev => ({ ...prev, street_ids: updated.map(s => s.id) }))
      setErrors(prev => ({ ...prev, streets: undefined }))
    }
  }

  const handleStreetDeselect = (streetId: string) => {
    const updated = selectedStreets.filter(s => s.id !== streetId)
    setSelectedStreets(updated)
    setFormData(prev => ({ ...prev, street_ids: updated.map(s => s.id) }))
  }

  const handleSelectAllResults = () => {
    const newSelections = searchResults.filter(
      result => !selectedStreets.find(s => s.id === result.id)
    )
    const updated = [...selectedStreets, ...newSelections]
    setSelectedStreets(updated)
    setFormData(prev => ({ ...prev, street_ids: updated.map(s => s.id) }))
  }

  const createDevelopment = async () => {
    if (!newDevelopmentData.name.trim() || !newDevelopmentData.postcode_area.trim()) {
      return
    }

    setIsCreatingDevelopment(true)
    try {
      const response = await fetch('/api/developments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newDevelopmentData.name.trim(),
          postcode_area: newDevelopmentData.postcode_area.trim(),
          development_type: newDevelopmentData.development_type || null,
          builder_id: formData.builder_id,
          year_built: newDevelopmentData.year_built || null,
          notes: newDevelopmentData.notes.trim() || null
        })
      })

      if (!response.ok) throw new Error('Failed to create development')
      const data = await response.json()

      // Add to developments list and select it
      setDevelopments(prev => [...prev, data])
      setNewStreetData(prev => ({ ...prev, development_id: data.id }))
      setNewDevelopmentData({
        name: '',
        postcode_area: '',
        development_type: '',
        year_built: '',
        notes: ''
      })
      setShowAddDevelopmentForm(false)
    } catch (error) {
      console.error('Error creating development:', error)
    } finally {
      setIsCreatingDevelopment(false)
    }
  }

  const createStreet = async () => {
    if (!newStreetData.street_name.trim() || !newStreetData.postcode_area.trim()) {
      return
    }

    setIsCreatingStreet(true)
    try {
      const response = await fetch('/api/streets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          street_name: newStreetData.street_name.trim(),
          postcode: newStreetData.postcode.trim() || null,
          postcode_area: newStreetData.postcode_area.trim(),
          development_id: newStreetData.development_id || null
        })
      })

      if (!response.ok) throw new Error('Failed to create street')
      const data = await response.json()

      // Add to selected streets
      handleStreetSelect(data)
      setNewStreetData({
        street_name: '',
        postcode: '',
        postcode_area: '',
        development_id: ''
      })
      setShowAddStreetForm(false)
    } catch (error) {
      console.error('Error creating street:', error)
    } finally {
      setIsCreatingStreet(false)
    }
  }

  const validateStep1 = (): boolean => {
    const newErrors: ValidationErrors = {}

    if (!formData.builder_id) {
      newErrors.builder_id = 'Please select a builder'
    }

    if (!formData.model_name.trim()) {
      newErrors.model_name = 'Model name is required'
    } else if (formData.model_name.length > 100) {
      newErrors.model_name = 'Model name must be 100 characters or less'
    }

    if (!formData.bedrooms) {
      newErrors.bedrooms = 'Number of bedrooms is required'
    } else if (formData.bedrooms < 1 || formData.bedrooms > 10) {
      newErrors.bedrooms = 'Bedrooms must be between 1 and 10'
    }

    if (!formData.property_type) {
      newErrors.property_type = 'Please select a property type'
    }

    // Year validation
    if (formData.year_from && formData.year_to) {
      if (formData.year_to < formData.year_from) {
        newErrors.year_to = 'Year To must be greater than or equal to Year From'
      }
    }

    if (formData.year_from && (formData.year_from < 1900 || formData.year_from > 2030)) {
      newErrors.year_from = 'Year must be between 1900 and 2030'
    }

    if (formData.year_to && (formData.year_to < 1900 || formData.year_to > 2030)) {
      newErrors.year_to = 'Year must be between 1900 and 2030'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = (): boolean => {
    const newErrors: ValidationErrors = {}

    if (!selectedFiles.floor_plan) {
      newErrors.floor_plan = 'Floor plan is required'
    }

    if (!selectedFiles.exterior_photo) {
      newErrors.exterior_photo = 'Exterior photo is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = (): boolean => {
    const newErrors: ValidationErrors = {}

    if (selectedStreets.length === 0) {
      newErrors.streets = 'At least one street must be selected'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFileSelect = (type: 'floor_plan' | 'exterior_photo' | 'spec_sheet', file: File) => {
    // Validate file type
    if (type === 'floor_plan' || type === 'spec_sheet') {
      if (file.type !== 'application/pdf') {
        setErrors(prev => ({ ...prev, [type]: 'Please select a PDF file' }))
        return
      }
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        setErrors(prev => ({ ...prev, [type]: 'File must be smaller than 10MB' }))
        return
      }
    } else if (type === 'exterior_photo') {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, [type]: 'Please select a valid image file (JPG, PNG, or WebP)' }))
        return
      }
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        setErrors(prev => ({ ...prev, [type]: 'Image must be smaller than 5MB' }))
        return
      }
    }

    setSelectedFiles(prev => ({ ...prev, [type]: file }))
    setErrors(prev => ({ ...prev, [type]: undefined }))

    // Create preview for images
    if (type === 'exterior_photo') {
      const reader = new FileReader()
      reader.onload = (e) => {
        setExteriorPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFileRemove = (type: 'floor_plan' | 'exterior_photo' | 'spec_sheet') => {
    setSelectedFiles(prev => ({ ...prev, [type]: null }))
    if (type === 'exterior_photo') {
      setExteriorPhotoPreview(null)
    }
  }

  const uploadFile = async (file: File, bucket: string): Promise<string | null> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', bucket)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Upload failed')

      const data = await response.json()
      return data.url
    } catch (error) {
      console.error(`Error uploading to ${bucket}:`, error)
      return null
    }
  }

  const uploadAllFiles = async (): Promise<boolean> => {
    setIsUploading(true)
    setUploadProgress(0)

    try {
      const uploads: Promise<string | null>[] = []
      let completedUploads = 0
      const totalUploads = selectedFiles.spec_sheet ? 3 : 2

      // Upload floor plan
      if (selectedFiles.floor_plan) {
        const uploadPromise = uploadFile(selectedFiles.floor_plan, 'floor-plans').then(url => {
          completedUploads++
          setUploadProgress((completedUploads / totalUploads) * 100)
          return url
        })
        uploads.push(uploadPromise)
      }

      // Upload exterior photo
      if (selectedFiles.exterior_photo) {
        const uploadPromise = uploadFile(selectedFiles.exterior_photo, 'exterior-photos').then(url => {
          completedUploads++
          setUploadProgress((completedUploads / totalUploads) * 100)
          return url
        })
        uploads.push(uploadPromise)
      }

      // Upload spec sheet if provided
      if (selectedFiles.spec_sheet) {
        const uploadPromise = uploadFile(selectedFiles.spec_sheet, 'spec-sheets').then(url => {
          completedUploads++
          setUploadProgress((completedUploads / totalUploads) * 100)
          return url
        })
        uploads.push(uploadPromise)
      }

      const results = await Promise.all(uploads)

      // Check if any upload failed
      if (results.some(url => url === null)) {
        setErrors(prev => ({ ...prev, floor_plan: 'Failed to upload files. Please try again.' }))
        return false
      }

      // Store URLs in form data
      setFormData(prev => ({
        ...prev,
        floor_plan_url: results[0],
        exterior_photo_url: results[1],
        spec_sheet_url: selectedFiles.spec_sheet ? results[2] : null
      }))

      return true
    } catch (error) {
      console.error('Error uploading files:', error)
      setErrors(prev => ({ ...prev, floor_plan: 'Failed to upload files. Please try again.' }))
      return false
    } finally {
      setIsUploading(false)
    }
  }

  const handleNext = async () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2)
        setErrors({})
      }
    } else if (currentStep === 2) {
      if (validateStep2()) {
        const uploadSuccess = await uploadAllFiles()
        if (uploadSuccess) {
          setCurrentStep(3)
          setErrors({})
        }
      }
    } else if (currentStep === 3) {
      if (validateStep3()) {
        setCurrentStep(4)
        setErrors({})
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setErrors({})
    }
  }

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const getProgressPercentage = () => {
    return ((currentStep - 1) / (STEPS.length - 1)) * 100
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError('')

    try {
      // Create house schema via API
      const response = await fetch('/api/schemas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          builder_id: formData.builder_id,
          model_name: formData.model_name.trim(),
          bedrooms: formData.bedrooms,
          property_type: formData.property_type,
          year_from: formData.year_from || null,
          year_to: formData.year_to || null,
          floor_plan_url: formData.floor_plan_url,
          exterior_photo_url: formData.exterior_photo_url,
          spec_sheet_url: formData.spec_sheet_url,
          verified: formData.verified,
          notes: formData.notes.trim() || null,
          street_ids: formData.street_ids
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create house schema')
      }

      const schemaData = await response.json()

      // Success! Redirect to the schemas list
      router.push('/dashboard/schemas')
    } catch (error: any) {
      console.error('Error creating house schema:', error)
      setSubmitError(error.message || 'Failed to create house schema. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getBuilderName = () => {
    const builder = builders.find(b => b.id === formData.builder_id)
    return builder?.name || 'Unknown'
  }

  const formatYearRange = () => {
    if (formData.year_from && formData.year_to) {
      return `${formData.year_from}-${formData.year_to}`
    } else if (formData.year_from) {
      return `${formData.year_from}+`
    }
    return 'Not specified'
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0F172A]">Add New House Schema</h1>
        <p className="mt-2 text-gray-600">
          Create a new house model with floor plans and room details
        </p>
      </div>

      {/* Step Indicator */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-medium text-[#0F172A]">
              Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}
            </h2>
            <span className="text-sm text-gray-500">
              {Math.round(getProgressPercentage())}% Complete
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#087F8C] h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>

        {/* Step Dots */}
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    currentStep > step.number
                      ? 'bg-[#10B981] text-white'
                      : currentStep === step.number
                      ? 'bg-[#087F8C] text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {currentStep > step.number ? '✓' : step.number}
                </div>
                <span className="text-xs text-gray-600 mt-1 hidden sm:block text-center">
                  {step.title}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div className={`h-1 flex-1 mx-2 ${
                  currentStep > step.number ? 'bg-[#10B981]' : 'bg-gray-300'
                }`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        {/* STEP 1: BASIC INFORMATION */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-[#0F172A] mb-4">
              House Schema Details
            </h3>

            {/* Builder Selection */}
            <div>
              <label htmlFor="builder_id" className="block text-sm font-medium text-[#0F172A] mb-2">
                Builder <span className="text-red-500">*</span>
              </label>
              {isLoadingBuilders ? (
                <div className="text-sm text-gray-500">Loading builders...</div>
              ) : (
                <select
                  id="builder_id"
                  value={formData.builder_id}
                  onChange={(e) => handleInputChange('builder_id', e.target.value)}
                  className={`block w-full rounded-md shadow-sm focus:ring-[#087F8C] focus:border-[#087F8C] sm:text-sm ${
                    errors.builder_id ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a builder...</option>
                  {builders.map(builder => (
                    <option key={builder.id} value={builder.id}>
                      {builder.name}
                    </option>
                  ))}
                </select>
              )}
              {errors.builder_id && (
                <p className="mt-1 text-sm text-red-600">{errors.builder_id}</p>
              )}
            </div>

            {/* Model Name */}
            <div>
              <label htmlFor="model_name" className="block text-sm font-medium text-[#0F172A] mb-2">
                Model Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="model_name"
                value={formData.model_name}
                onChange={(e) => handleInputChange('model_name', e.target.value)}
                maxLength={100}
                placeholder="e.g., Lakeside 3-Bed Semi"
                className={`block w-full rounded-md shadow-sm focus:ring-[#087F8C] focus:border-[#087F8C] sm:text-sm ${
                  errors.model_name ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              <div className="mt-1 flex justify-between">
                {errors.model_name ? (
                  <p className="text-sm text-red-600">{errors.model_name}</p>
                ) : (
                  <div></div>
                )}
                <p className="text-sm text-gray-500">
                  {formData.model_name.length}/100
                </p>
              </div>
            </div>

            {/* Bedrooms and Property Type (Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bedrooms */}
              <div>
                <label htmlFor="bedrooms" className="block text-sm font-medium text-[#0F172A] mb-2">
                  Bedrooms <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="bedrooms"
                  min="1"
                  max="10"
                  value={formData.bedrooms}
                  onChange={(e) => handleInputChange('bedrooms', e.target.value ? parseInt(e.target.value) : '')}
                  className={`block w-full rounded-md shadow-sm focus:ring-[#087F8C] focus:border-[#087F8C] sm:text-sm ${
                    errors.bedrooms ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.bedrooms && (
                  <p className="mt-1 text-sm text-red-600">{errors.bedrooms}</p>
                )}
              </div>

              {/* Property Type */}
              <div>
                <label htmlFor="property_type" className="block text-sm font-medium text-[#0F172A] mb-2">
                  Property Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="property_type"
                  value={formData.property_type}
                  onChange={(e) => handleInputChange('property_type', e.target.value)}
                  className={`block w-full rounded-md shadow-sm focus:ring-[#087F8C] focus:border-[#087F8C] sm:text-sm ${
                    errors.property_type ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select type...</option>
                  {PROPERTY_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.property_type && (
                  <p className="mt-1 text-sm text-red-600">{errors.property_type}</p>
                )}
              </div>
            </div>

            {/* Year Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Year From */}
              <div>
                <label htmlFor="year_from" className="block text-sm font-medium text-[#0F172A] mb-2">
                  Year From (Optional)
                </label>
                <input
                  type="number"
                  id="year_from"
                  min="1900"
                  max="2030"
                  value={formData.year_from}
                  onChange={(e) => handleInputChange('year_from', e.target.value ? parseInt(e.target.value) : '')}
                  placeholder="e.g., 2010"
                  className={`block w-full rounded-md shadow-sm focus:ring-[#087F8C] focus:border-[#087F8C] sm:text-sm ${
                    errors.year_from ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.year_from && (
                  <p className="mt-1 text-sm text-red-600">{errors.year_from}</p>
                )}
              </div>

              {/* Year To */}
              <div>
                <label htmlFor="year_to" className="block text-sm font-medium text-[#0F172A] mb-2">
                  Year To (Optional)
                </label>
                <input
                  type="number"
                  id="year_to"
                  min="1900"
                  max="2030"
                  value={formData.year_to}
                  onChange={(e) => handleInputChange('year_to', e.target.value ? parseInt(e.target.value) : '')}
                  placeholder="e.g., 2015"
                  className={`block w-full rounded-md shadow-sm focus:ring-[#087F8C] focus:border-[#087F8C] sm:text-sm ${
                    errors.year_to ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.year_to && (
                  <p className="mt-1 text-sm text-red-600">{errors.year_to}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Leave Year To empty if still being built
                </p>
              </div>
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
                maxLength={1000}
                placeholder="Add any additional notes about this house schema..."
                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#087F8C] focus:border-[#087F8C] sm:text-sm"
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.notes.length}/1000
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: FILE UPLOADS */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-[#0F172A] mb-4">
              Upload Documents and Images
            </h3>

            {/* Floor Plan Upload */}
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-2">
                Floor Plan (PDF) <span className="text-red-500">*</span>
              </label>
              {selectedFiles.floor_plan ? (
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">📄</div>
                      <div>
                        <p className="text-sm font-medium text-[#0F172A]">
                          {selectedFiles.floor_plan.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(selectedFiles.floor_plan.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleFileRemove('floor_plan')}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    const file = e.dataTransfer.files[0]
                    if (file) handleFileSelect('floor_plan', file)
                  }}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#087F8C] transition-colors cursor-pointer"
                >
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileSelect('floor_plan', file)
                    }}
                    className="hidden"
                    id="floor_plan"
                  />
                  <label htmlFor="floor_plan" className="cursor-pointer">
                    <div className="text-4xl mb-2">📄</div>
                    <p className="text-sm font-medium text-[#0F172A] mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF up to 10MB
                    </p>
                  </label>
                </div>
              )}
              {errors.floor_plan && (
                <p className="mt-1 text-sm text-red-600">{errors.floor_plan}</p>
              )}
            </div>

            {/* Exterior Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-2">
                Exterior Photo <span className="text-red-500">*</span>
              </label>
              {selectedFiles.exterior_photo ? (
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {exteriorPhotoPreview && (
                        <img
                          src={exteriorPhotoPreview}
                          alt="Exterior preview"
                          className="w-20 h-20 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium text-[#0F172A]">
                          {selectedFiles.exterior_photo.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(selectedFiles.exterior_photo.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleFileRemove('exterior_photo')}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    const file = e.dataTransfer.files[0]
                    if (file) handleFileSelect('exterior_photo', file)
                  }}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#087F8C] transition-colors cursor-pointer"
                >
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileSelect('exterior_photo', file)
                    }}
                    className="hidden"
                    id="exterior_photo"
                  />
                  <label htmlFor="exterior_photo" className="cursor-pointer">
                    <div className="text-4xl mb-2">🏠</div>
                    <p className="text-sm font-medium text-[#0F172A] mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      JPG, PNG, or WebP up to 5MB
                    </p>
                  </label>
                </div>
              )}
              {errors.exterior_photo && (
                <p className="mt-1 text-sm text-red-600">{errors.exterior_photo}</p>
              )}
            </div>

            {/* Spec Sheet Upload (Optional) */}
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-2">
                Spec Sheet (PDF or Image) - Optional
              </label>
              {selectedFiles.spec_sheet ? (
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">📋</div>
                      <div>
                        <p className="text-sm font-medium text-[#0F172A]">
                          {selectedFiles.spec_sheet.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(selectedFiles.spec_sheet.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleFileRemove('spec_sheet')}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    const file = e.dataTransfer.files[0]
                    if (file) handleFileSelect('spec_sheet', file)
                  }}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#087F8C] transition-colors cursor-pointer"
                >
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileSelect('spec_sheet', file)
                    }}
                    className="hidden"
                    id="spec_sheet"
                  />
                  <label htmlFor="spec_sheet" className="cursor-pointer">
                    <div className="text-4xl mb-2">📋</div>
                    <p className="text-sm font-medium text-[#0F172A] mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF or Image up to 10MB
                    </p>
                  </label>
                </div>
              )}
              {errors.spec_sheet && (
                <p className="mt-1 text-sm text-red-600">{errors.spec_sheet}</p>
              )}
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <svg className="animate-spin h-5 w-5 text-[#087F8C] mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm font-medium text-[#024059]">Uploading files...</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#087F8C] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {Math.round(uploadProgress)}% complete
                </p>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: LINK STREETS */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-[#0F172A] mb-4">
              Link Streets to House Schema
            </h3>

            {/* Selected Streets Count */}
            {selectedStreets.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-green-500 text-lg mr-2">✓</span>
                  <span className="text-sm font-medium text-green-800">
                    {selectedStreets.length} street{selectedStreets.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
              </div>
            )}

            {/* Search Existing Streets */}
            <div>
              <label htmlFor="street_search" className="block text-sm font-medium text-[#0F172A] mb-2">
                Search Existing Streets
              </label>
              <input
                type="text"
                id="street_search"
                value={streetSearch}
                onChange={(e) => setStreetSearch(e.target.value)}
                placeholder="Search by street name or postcode area..."
                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#087F8C] focus:border-[#087F8C] sm:text-sm"
              />
              
              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-3 border border-gray-300 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-300 flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                    </span>
                    <button
                      type="button"
                      onClick={handleSelectAllResults}
                      className="text-sm text-[#087F8C] hover:text-[#087F8C]/80 font-medium"
                    >
                      Select All Results
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {searchResults.map(street => {
                      const isSelected = selectedStreets.find(s => s.id === street.id)
                      return (
                        <div
                          key={street.id}
                          className="px-4 py-3 hover:bg-gray-50 border-b border-gray-200 last:border-b-0"
                        >
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!isSelected}
                              onChange={() => {
                                if (isSelected) {
                                  handleStreetDeselect(street.id)
                                } else {
                                  handleStreetSelect(street)
                                }
                              }}
                              className="h-4 w-4 text-[#087F8C] focus:ring-[#087F8C] border-gray-300 rounded"
                            />
                            <div className="ml-3 flex-1">
                              <p className="text-sm font-medium text-[#0F172A]">
                                {street.street_name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {street.postcode_area}
                                {street.developments && ` • ${street.developments.name}`}
                              </p>
                            </div>
                          </label>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Selected Streets List */}
            {selectedStreets.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-[#0F172A] mb-3">
                  Selected Streets ({selectedStreets.length})
                </h4>
                <div className="border border-gray-300 rounded-lg divide-y divide-gray-200">
                  {selectedStreets.map(street => (
                    <div key={street.id} className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#0F172A]">
                          {street.street_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {street.postcode_area}
                          {street.developments && ` • ${street.developments.name}`}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleStreetDeselect(street.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Street Button */}
            {!showAddStreetForm && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowAddStreetForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-[#087F8C] rounded-md shadow-sm text-sm font-medium text-[#087F8C] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#087F8C]"
                >
                  <span className="mr-2">+</span>
                  Add New Street
                </button>
              </div>
            )}

            {/* Add New Street Form */}
            {showAddStreetForm && (
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <h4 className="text-sm font-medium text-[#0F172A] mb-4">
                  Create New Street
                </h4>
                
                <div className="space-y-4">
                  {/* Street Name */}
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1">
                      Street Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newStreetData.street_name}
                      onChange={(e) => setNewStreetData(prev => ({ ...prev, street_name: e.target.value }))}
                      placeholder="e.g., Main Street"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#087F8C] focus:border-[#087F8C] sm:text-sm"
                    />
                  </div>

                  {/* Postcode Area and Full Postcode */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#0F172A] mb-1">
                        Postcode Area <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newStreetData.postcode_area}
                        onChange={(e) => {
                          const value = e.target.value.toUpperCase()
                          setNewStreetData(prev => ({ ...prev, postcode_area: value }))
                          setNewDevelopmentData(prev => ({ ...prev, postcode_area: value }))
                        }}
                        placeholder="e.g., L32"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#087F8C] focus:border-[#087F8C] sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#0F172A] mb-1">
                        Full Postcode (Optional)
                      </label>
                      <input
                        type="text"
                        value={newStreetData.postcode}
                        onChange={(e) => setNewStreetData(prev => ({ ...prev, postcode: e.target.value.toUpperCase() }))}
                        placeholder="e.g., L32 7XY"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#087F8C] focus:border-[#087F8C] sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Development Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1">
                      Development (Optional)
                    </label>
                    <select
                      value={newStreetData.development_id}
                      onChange={(e) => setNewStreetData(prev => ({ ...prev, development_id: e.target.value }))}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#087F8C] focus:border-[#087F8C] sm:text-sm"
                    >
                      <option value="">No development</option>
                      {developments.map(dev => (
                        <option key={dev.id} value={dev.id}>
                          {dev.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Add New Development Button */}
                  {!showAddDevelopmentForm && (
                    <button
                      type="button"
                      onClick={() => setShowAddDevelopmentForm(true)}
                      className="text-sm text-[#087F8C] hover:text-[#087F8C]/80 font-medium"
                    >
                      + Add New Development
                    </button>
                  )}

                  {/* Add New Development Form (Nested) */}
                  {showAddDevelopmentForm && (
                    <div className="border border-blue-300 rounded-lg p-4 bg-blue-50">
                      <h5 className="text-sm font-medium text-[#024059] mb-3">
                        Create New Development
                      </h5>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-[#024059] mb-1">
                            Development Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={newDevelopmentData.name}
                            onChange={(e) => setNewDevelopmentData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Riverside Park"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#087F8C] focus:border-[#087F8C] text-sm"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-[#024059] mb-1">
                              Postcode Area <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={newDevelopmentData.postcode_area}
                              onChange={(e) => setNewDevelopmentData(prev => ({ ...prev, postcode_area: e.target.value.toUpperCase() }))}
                              placeholder="e.g., L32"
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#087F8C] focus:border-[#087F8C] text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[#024059] mb-1">
                              Year Built
                            </label>
                            <input
                              type="number"
                              value={newDevelopmentData.year_built}
                              onChange={(e) => setNewDevelopmentData(prev => ({ ...prev, year_built: e.target.value ? parseInt(e.target.value) : '' }))}
                              placeholder="e.g., 2015"
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#087F8C] focus:border-[#087F8C] text-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-[#024059] mb-1">
                            Development Type
                          </label>
                          <select
                            value={newDevelopmentData.development_type}
                            onChange={(e) => setNewDevelopmentData(prev => ({ ...prev, development_type: e.target.value }))}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#087F8C] focus:border-[#087F8C] text-sm"
                          >
                            <option value="">Select type...</option>
                            <option value="private_development">Private Development</option>
                            <option value="council_estate">Council Estate</option>
                            <option value="housing_association">Housing Association</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-[#024059] mb-1">
                            Notes
                          </label>
                          <textarea
                            rows={2}
                            value={newDevelopmentData.notes}
                            onChange={(e) => setNewDevelopmentData(prev => ({ ...prev, notes: e.target.value }))}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#087F8C] focus:border-[#087F8C] text-sm"
                          />
                        </div>

                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => setShowAddDevelopmentForm(false)}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={createDevelopment}
                            disabled={isCreatingDevelopment || !newDevelopmentData.name || !newDevelopmentData.postcode_area}
                            className="flex-1 px-3 py-1.5 border border-transparent rounded text-sm font-medium text-white bg-[#087F8C] hover:bg-[#087F8C]/90 disabled:opacity-50"
                          >
                            {isCreatingDevelopment ? 'Creating...' : 'Create Development'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Street Form Actions */}
                  <div className="flex space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddStreetForm(false)
                        setNewStreetData({ street_name: '', postcode: '', postcode_area: '', development_id: '' })
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={createStreet}
                      disabled={isCreatingStreet || !newStreetData.street_name || !newStreetData.postcode_area}
                      className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-[#087F8C] hover:bg-[#087F8C]/90 disabled:opacity-50"
                    >
                      {isCreatingStreet ? 'Creating...' : 'Create Street'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Validation Error */}
            {errors.streets && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-red-500 text-lg mr-2">⚠️</span>
                  <p className="text-red-800">{errors.streets}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: REVIEW & SUBMIT */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Please review all information below before submitting. You can go back to any step to make changes.
              </p>
            </div>

            {/* Basic Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-[#0F172A]">Basic Information</h3>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-sm text-[#087F8C] hover:text-[#087F8C]/80 font-medium"
                >
                  Edit
                </button>
              </div>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Builder</dt>
                  <dd className="mt-1 text-sm text-[#0F172A]">{getBuilderName()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Model Name</dt>
                  <dd className="mt-1 text-sm text-[#0F172A]">{formData.model_name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Bedrooms</dt>
                  <dd className="mt-1 text-sm text-[#0F172A]">{formData.bedrooms}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Property Type</dt>
                  <dd className="mt-1 text-sm text-[#0F172A] capitalize">{formData.property_type}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Year Range</dt>
                  <dd className="mt-1 text-sm text-[#0F172A]">{formatYearRange()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Verified</dt>
                  <dd className="mt-1 text-sm text-[#0F172A]">
                    {formData.verified ? (
                      <span className="text-[#10B981]">Yes ✓</span>
                    ) : (
                      <span className="text-gray-500">No</span>
                    )}
                  </dd>
                </div>
                {formData.notes && (
                  <div className="md:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Notes</dt>
                    <dd className="mt-1 text-sm text-[#0F172A]">{formData.notes}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Files */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-[#0F172A]">Files</h3>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-sm text-[#087F8C] hover:text-[#087F8C]/80 font-medium"
                >
                  Edit
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0F172A]">Floor Plan</p>
                    <p className="text-sm text-gray-500 truncate">{formData.floor_plan_url?.split('/').pop() || 'Floor plan'}</p>
                    {formData.floor_plan_url && (
                      <a
                        href={formData.floor_plan_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#087F8C] hover:text-[#087F8C]/80"
                      >
                        View file →
                      </a>
                    )}
                  </div>
                </div>

                {formData.exterior_photo_url && (
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={formData.exterior_photo_url}
                          alt="Exterior"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0F172A]">Exterior Photo</p>
                      <p className="text-sm text-gray-500 truncate">{formData.exterior_photo_url.split('/').pop()}</p>
                      <a
                        href={formData.exterior_photo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#087F8C] hover:text-[#087F8C]/80"
                      >
                        View photo →
                      </a>
                    </div>
                  </div>
                )}

                {formData.spec_sheet_url && (
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0F172A]">Spec Sheet</p>
                      <p className="text-sm text-gray-500 truncate">{formData.spec_sheet_url.split('/').pop()}</p>
                      <a
                        href={formData.spec_sheet_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#087F8C] hover:text-[#087F8C]/80"
                      >
                        View file →
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Streets */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-[#0F172A]">Linked Streets</h3>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="text-sm text-[#087F8C] hover:text-[#087F8C]/80 font-medium"
                >
                  Edit
                </button>
              </div>
              {formData.street_ids.length > 0 ? (
                <div className="space-y-2">
                  {selectedStreets.map(street => (
  <div key={street.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
    <div>
      <span className="text-sm font-medium text-[#0F172A]">{street.street_name}</span>
      <span className="text-sm text-gray-500 ml-2">{street.postcode_area}</span>
    </div>
  </div>
))}
                  <p className="text-sm text-gray-500 mt-3">
                    {formData.street_ids.length} street{formData.street_ids.length !== 1 ? 's' : ''} selected
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No streets linked</p>
              )}
            </div>

            {/* Verification Checkbox */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reviewConfirmed}
                  onChange={(e) => setReviewConfirmed(e.target.checked)}
                  className="mt-0.5 h-5 w-5 text-[#087F8C] border-gray-300 rounded focus:ring-[#087F8C]"
                />
                <span className="text-sm text-[#0F172A]">
                  I have reviewed all the information above and confirm it is correct
                </span>
              </label>
            </div>

            {/* Submit Error */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{submitError}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!reviewConfirmed || isSubmitting}
                className="inline-flex justify-center items-center py-3 px-8 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-[#087F8C] hover:bg-[#087F8C]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#087F8C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating House Schema...
                  </>
                ) : (
                  'Create House Schema'
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row sm:justify-between space-y-3 sm:space-y-0">
        <Link
          href="/dashboard/schemas"
          className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#087F8C] transition-colors"
        >
          Cancel
        </Link>

        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#087F8C] transition-colors"
            >
              ← Back
            </button>
          )}
          
          {currentStep < STEPS.length && (
            <button
              type="button"
              onClick={handleNext}
              disabled={isUploading}
              className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#087F8C] hover:bg-[#087F8C]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#087F8C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUploading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </div>
              ) : (
                'Next →'
              )}
            </button>
          )}
          
          {currentStep === STEPS.length && (
            <button
              type="button"
              className="inline-flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#087F8C] hover:bg-[#087F8C]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#087F8C] transition-colors"
            >
              Submit House Schema
            </button>
          )}
        </div>
      </div>
    </div>
  )
}