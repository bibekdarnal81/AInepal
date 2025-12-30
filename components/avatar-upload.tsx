'use client'

import { useState, useRef } from 'react'
import { Camera, Upload, X } from 'lucide-react'
import Image from 'next/image'

interface AvatarUploadProps {
    currentAvatarUrl: string
    onUploadComplete: (url: string) => void
    userId: string
}

export function AvatarUpload({ currentAvatarUrl, onUploadComplete, userId }: AvatarUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview] = useState(currentAvatarUrl)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file')
            return
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('Image must be less than 2MB')
            return
        }

        setUploading(true)

        try {
            // Create form data
            const formData = new FormData()
            formData.append('file', file)
            formData.append('userId', userId)
            if (currentAvatarUrl) {
                formData.append('oldAvatarUrl', currentAvatarUrl)
            }

            // Upload to R2 via API route
            const response = await fetch('/api/upload/avatar', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Upload failed')
            }

            const { url } = await response.json()

            // Update preview and notify parent
            setPreview(url)
            onUploadComplete(url)
        } catch (error: any) {
            console.error('Error uploading avatar:', error)
            alert(error.message || 'Error uploading image')
        } finally {
            setUploading(false)
        }
    }

    const handleRemoveAvatar = async () => {
        if (!currentAvatarUrl) return

        try {
            // Delete from R2 via API route
            const response = await fetch(`/api/upload/avatar?url=${encodeURIComponent(currentAvatarUrl)}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Delete failed')
            }

            setPreview('')
            onUploadComplete('')
        } catch (error: any) {
            console.error('Error removing avatar:', error)
            alert('Error removing image')
        }
    }

    return (
        <div className="flex items-center gap-6">
            <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center border-4 border-border">
                    {preview ? (
                        <Image
                            src={preview}
                            alt="Profile"
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <Camera className="w-10 h-10 text-white" />
                    )}
                </div>
                {preview && (
                    <button
                        onClick={handleRemoveAvatar}
                        className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
                        title="Remove avatar"
                        type="button"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="flex-1">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-secondary border border-border rounded-lg text-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50"
                >
                    {uploading ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
                            Uploading...
                        </>
                    ) : (
                        <>
                            <Upload className="w-4 h-4" />
                            Upload Photo
                        </>
                    )}
                </button>
                <p className="text-xs text-muted-foreground mt-2">
                    JPG, PNG or GIF. Max size 2MB.
                </p>
                <p className="text-xs text-muted-foreground">
                    Saved to Cloudflare R2 storage
                </p>
            </div>
        </div>
    )
}
