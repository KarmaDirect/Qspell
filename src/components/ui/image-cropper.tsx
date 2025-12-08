'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Loader2, ZoomOut, RotateCw, Move } from 'lucide-react'

interface ImageCropperProps {
  image: string
  aspectRatio: number
  onCropComplete: (croppedImage: Blob) => void
  onCancel: () => void
}

export function ImageCropper({ image, aspectRatio, onCropComplete, onCancel }: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [loading, setLoading] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 })
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })

  // Update container size
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setContainerSize({ width: rect.width, height: rect.height })
      }
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // Handle image load
  const handleImageLoad = () => {
    if (imgRef.current) {
      setImageSize({
        width: imgRef.current.naturalWidth,
        height: imgRef.current.naturalHeight
      })
      setImageLoaded(true)
    }
  }

  // Calculate crop area dimensions
  const getCropArea = useCallback(() => {
    const maxWidth = containerSize.width * 0.8
    const maxHeight = containerSize.height * 0.8
    
    let cropWidth, cropHeight
    
    if (maxWidth / aspectRatio <= maxHeight) {
      cropWidth = maxWidth
      cropHeight = maxWidth / aspectRatio
    } else {
      cropHeight = maxHeight
      cropWidth = maxHeight * aspectRatio
    }
    
    return {
      width: cropWidth,
      height: cropHeight,
      x: (containerSize.width - cropWidth) / 2,
      y: (containerSize.height - cropHeight) / 2
    }
  }, [containerSize, aspectRatio])

  // Handle mouse/touch events
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    setIsDragging(true)
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    setDragStart({ x: clientX - position.x, y: clientY - position.y })
  }

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return
    e.preventDefault()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    setPosition({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    })
  }, [isDragging, dragStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('touchmove', handleMouseMove, { passive: false })
    document.addEventListener('touchend', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleMouseMove)
      document.removeEventListener('touchend', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  // Crop the image
  const handleCrop = async () => {
    if (!imgRef.current || !canvasRef.current) {
      console.error('Image or canvas not ready')
      return
    }
    
    setLoading(true)
    
    try {
      const img = imgRef.current
      const cropArea = getCropArea()
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        throw new Error('No canvas context')
      }

      // Output dimensions based on aspect ratio
      const outputWidth = aspectRatio >= 1 ? 1200 : 800
      const outputHeight = Math.round(outputWidth / aspectRatio)
      
      canvas.width = outputWidth
      canvas.height = outputHeight

      // Clear canvas with black background
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, outputWidth, outputHeight)

      // Calculate the displayed image size
      const displayScale = zoom * 0.5
      const displayWidth = imageSize.width * displayScale
      const displayHeight = imageSize.height * displayScale

      // Calculate the source area from the original image
      // The crop area in container coordinates
      const cropCenterX = cropArea.x + cropArea.width / 2
      const cropCenterY = cropArea.y + cropArea.height / 2
      
      // Image center in container coordinates
      const imgCenterX = containerSize.width / 2 + position.x
      const imgCenterY = containerSize.height / 2 + position.y

      // Offset from image center to crop center in container coordinates
      const offsetX = cropCenterX - imgCenterX
      const offsetY = cropCenterY - imgCenterY

      // Convert to original image coordinates
      const srcCenterX = imageSize.width / 2 + (offsetX / displayScale)
      const srcCenterY = imageSize.height / 2 + (offsetY / displayScale)
      
      // Source dimensions
      const srcWidth = cropArea.width / displayScale
      const srcHeight = cropArea.height / displayScale

      // Source rectangle
      const srcX = srcCenterX - srcWidth / 2
      const srcY = srcCenterY - srcHeight / 2

      // Apply rotation
      ctx.save()
      ctx.translate(outputWidth / 2, outputHeight / 2)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.translate(-outputWidth / 2, -outputHeight / 2)
      
      // Draw the cropped portion
      ctx.drawImage(
        img,
        Math.max(0, srcX),
        Math.max(0, srcY),
        Math.min(srcWidth, imageSize.width),
        Math.min(srcHeight, imageSize.height),
        0,
        0,
        outputWidth,
        outputHeight
      )
      
      ctx.restore()

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            console.log('Crop successful, blob size:', blob.size)
            onCropComplete(blob)
          } else {
            console.error('Failed to create blob')
            setLoading(false)
          }
        },
        'image/jpeg',
        0.92
      )
    } catch (error) {
      console.error('Crop error:', error)
      setLoading(false)
    }
  }

  const cropArea = getCropArea()

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Crop Area */}
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-hidden cursor-move select-none"
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        {/* Image */}
        <div
          className="absolute"
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${zoom * 0.5})`,
            transformOrigin: 'center center'
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            ref={imgRef}
            src={image} 
            alt="Crop preview" 
            className="max-w-none"
            draggable={false}
            onLoad={handleImageLoad}
            crossOrigin="anonymous"
          />
        </div>
        
        {/* Overlay with crop hole */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top overlay */}
          <div 
            className="absolute left-0 right-0 top-0 bg-black/70"
            style={{ height: cropArea.y }}
          />
          {/* Bottom overlay */}
          <div 
            className="absolute left-0 right-0 bottom-0 bg-black/70"
            style={{ height: Math.max(0, containerSize.height - cropArea.y - cropArea.height) }}
          />
          {/* Left overlay */}
          <div 
            className="absolute left-0 bg-black/70"
            style={{ 
              top: cropArea.y, 
              width: cropArea.x, 
              height: cropArea.height 
            }}
          />
          {/* Right overlay */}
          <div 
            className="absolute right-0 bg-black/70"
            style={{ 
              top: cropArea.y, 
              width: Math.max(0, containerSize.width - cropArea.x - cropArea.width), 
              height: cropArea.height 
            }}
          />
          {/* Crop border */}
          <div 
            className="absolute border-2 border-[#c8ff00]"
            style={{
              left: cropArea.x,
              top: cropArea.y,
              width: cropArea.width,
              height: cropArea.height
            }}
          >
            {/* Grid lines */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="border border-[#c8ff00]/30" />
              ))}
            </div>
          </div>
        </div>

        {/* Drag indicator */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#141414] px-4 py-2 rounded-full flex items-center gap-2 text-sm text-[#888]">
          <Move className="h-4 w-4" />
          Glissez pour repositionner
        </div>
      </div>

      {/* Controls */}
      <div className="bg-[#141414] border-t border-[#1a1a1a] p-6 space-y-4">
        {/* Zoom Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-white">
            <label className="flex items-center gap-2">
              <ZoomOut className="h-4 w-4 text-[#666]" />
              Zoom
            </label>
            <span className="text-[#666]">{Math.round(zoom * 100)}%</span>
          </div>
          <Slider
            value={[zoom]}
            min={0.5}
            max={3}
            step={0.1}
            onValueChange={([value]) => setZoom(value)}
          />
        </div>

        {/* Rotation Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-white">
            <label className="flex items-center gap-2">
              <RotateCw className="h-4 w-4 text-[#666]" />
              Rotation
            </label>
            <span className="text-[#666]">{rotation}°</span>
          </div>
          <Slider
            value={[rotation]}
            min={0}
            max={360}
            step={1}
            onValueChange={([value]) => setRotation(value)}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 border-[#1a1a1a] text-[#888] hover:text-white hover:bg-[#1a1a1a]"
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleCrop}
            disabled={loading || !imageLoaded}
            className="flex-1 bg-[#c8ff00] text-black hover:bg-[#b8ef00] font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Traitement...
              </>
            ) : (
              'Valider'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
