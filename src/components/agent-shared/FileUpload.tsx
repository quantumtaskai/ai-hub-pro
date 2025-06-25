'use client'

import { useRef, useState } from 'react'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  acceptedTypes?: string
  maxSize?: number // in MB
  placeholder?: string
  icon?: string
}

export default function FileUpload({ 
  onFileSelect, 
  acceptedTypes = "*", 
  maxSize = 10,
  placeholder = "Click to upload or drag and drop",
  icon = "📄"
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileSelect = (file: File) => {
    if (maxSize && file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`)
      return
    }

    setSelectedFile(file)
    onFileSelect(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          border: `2px dashed ${isDragging ? '#3b82f6' : '#d1d5db'}`,
          borderRadius: '12px',
          padding: '32px',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragging ? '#eff6ff' : '#f9fafb',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{
          fontSize: '48px',
          marginBottom: '12px'
        }}>
          {icon}
        </div>
        
        {selectedFile ? (
          <div>
            <p style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '4px'
            }}>
              {selectedFile.name}
            </p>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '12px'
            }}>
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setSelectedFile(null)
                if (fileInputRef.current) {
                  fileInputRef.current.value = ''
                }
              }}
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Remove
            </button>
          </div>
        ) : (
          <div>
            <p style={{
              fontSize: '16px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              {placeholder}
            </p>
            <p style={{
              fontSize: '14px',
              color: '#6b7280'
            }}>
              Maximum file size: {maxSize}MB
            </p>
            {acceptedTypes !== "*" && (
              <p style={{
                fontSize: '12px',
                color: '#9ca3af',
                marginTop: '4px'
              }}>
                Accepted types: {acceptedTypes}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}