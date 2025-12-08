'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImageCropper } from '@/components/ui/image-cropper'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface ImageUploadProps {
  value?: string | null
  onChange: (url: string) => void
  onRemove?: () => void
  disabled?: boolean
  aspectRatio?: 'square' | 'banner' | 'wide'
  maxSize?: number // in MB
  label?: string
  description?: string
  bucket: string
  path?: string
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled,
  aspectRatio = 'square',
  maxSize = 5,
  label,
  description,
  bucket,
  path = ''
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const aspectRatioClasses = {
    square: 'aspect-square',
    banner: 'aspect-[3/1]',
    wide: 'aspect-[16/9]'
  }

  const aspectRatioValues = {
    square: 1,
    banner: 3,
    wide: 16 / 9
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const uploadImage = async (fileOrBlob: File | Blob) => {
    setIsUploading(true)
    setError(null)

    try {
      // Validate file size
      if (fileOrBlob.size > maxSize * 1024 * 1024) {
        throw new Error(`L'image ne doit pas dépasser ${maxSize}MB`)
      }

      // Create a File from Blob if needed
      const file = fileOrBlob instanceof File 
        ? fileOrBlob 
        : new File([fileOrBlob], `upload-${Date.now()}.jpg`, { type: 'image/jpeg' })

      // Create form data
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', bucket)
      formData.append('path', path)

      // Upload to API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erreur lors de l\'upload' }))
        throw new Error(errorData.error || errorData.message || 'Erreur lors de l\'upload')
      }

      const data = await response.json()
      onChange(data.url)
      setImageToCrop(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'upload')
      console.error('Upload error:', err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleCropComplete = async (croppedBlob: Blob) => {
    await uploadImage(croppedBlob)
  }

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      const file = files[0]
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Le fichier doit être une image')
        return
      }

      // Create preview URL for cropping
      const reader = new FileReader()
      reader.onload = () => {
        setImageToCrop(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [disabled])

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Le fichier doit être une image')
        return
      }

      // Create preview URL for cropping
      const reader = new FileReader()
      reader.onload = () => {
        setImageToCrop(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemove = () => {
    if (onRemove) {
      onRemove()
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <>
      {/* Image Cropper Modal */}
      {imageToCrop && (
        <ImageCropper
          image={imageToCrop}
          aspectRatio={aspectRatioValues[aspectRatio]}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setImageToCrop(null)
            if (fileInputRef.current) {
              fileInputRef.current.value = ''
            }
          }}
        />
      )}

      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-white">{label}</label>
        )}
        {description && (
          <p className="text-xs text-[#666]">{description}</p>
        )}
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative overflow-hidden rounded-lg border-2 border-dashed transition-all',
          aspectRatioClasses[aspectRatio],
          isDragging && 'border-[#c8ff00] bg-[#c8ff00]/5',
          !isDragging && 'border-[#1a1a1a] hover:border-[#c8ff00]/50',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'cursor-pointer'
        )}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          disabled={disabled || isUploading}
          className="hidden"
        />

        {/* Preview Image */}
        {value && !isUploading && (
          <div className="relative w-full h-full">
            <Image
              src={value}
              alt="Preview"
              fill
              className="object-cover"
            />
            {!disabled && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 bg-red-500/90 hover:bg-red-600"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove()
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Upload State */}
        {!value && !isUploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
            <div className="w-12 h-12 rounded-full bg-[#c8ff00]/10 flex items-center justify-center">
              <Upload className="h-6 w-6 text-[#c8ff00]" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-white">
                Glissez une image ici
              </p>
              <p className="text-xs text-[#666] mt-1">
                ou cliquez pour parcourir
              </p>
              <p className="text-xs text-[#666] mt-1">
                Max {maxSize}MB
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isUploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#0a0a0a]/80">
            <Loader2 className="h-8 w-8 animate-spin text-[#c8ff00]" />
            <p className="text-sm text-white">Upload en cours...</p>
          </div>
        )}
      </div>

        {/* Error Message */}
        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
      </div>
    </>
  )
}

