'use client';

import { useState } from 'react';
import { Upload, X, Check } from 'lucide-react';

interface ThumbnailUploadProps {
    currentUrl?: string;
    onUploadComplete: (url: string) => void;
    label?: string;
    description?: string;
}

export default function ThumbnailUpload({
    currentUrl,
    onUploadComplete,
    label = 'Thumbnail',
    description = 'Upload image (max 10MB, formats: JPEG, PNG, WebP, GIF)',
}: ThumbnailUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [thumbnailUrl, setThumbnailUrl] = useState(currentUrl || '');
    const [error, setError] = useState<string | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Reset states
        setError(null);
        setUploadSuccess(false);

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            setError('Please upload a valid image file (JPEG, PNG, WebP, or GIF)');
            return;
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('File size must be less than 10MB');
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }

            const data = await response.json();
            setThumbnailUrl(data.file.url);
            onUploadComplete(data.file.url);
            setUploadSuccess(true);

            // Reset success message after 3 seconds
            setTimeout(() => setUploadSuccess(false), 3000);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Upload failed';
            setError(errorMsg);
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setThumbnailUrl('');
        onUploadComplete('');
        setUploadSuccess(false);
        setError(null);
    };

    const handleManualInput = (url: string) => {
        setThumbnailUrl(url);
        onUploadComplete(url);
        setError(null);
        setUploadSuccess(false);
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                    {label}
                </label>
                <p className="text-xs text-muted-foreground mb-3">{description}</p>

                {/* File Upload Button */}
                <div className="flex gap-3">
                    <label
                        htmlFor="thumbnail-upload"
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${uploading
                                ? 'bg-secondary text-muted-foreground cursor-wait'
                                : 'bg-primary text-primary-foreground hover:bg-primary/90'
                            }`}
                    >
                        {uploading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="h-4 w-4" />
                                Upload Image
                            </>
                        )}
                    </label>
                    <input
                        id="thumbnail-upload"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="hidden"
                    />

                    {thumbnailUrl && (
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="inline-flex items-center gap-2 px-4 py-2 text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-lg font-medium transition-colors"
                        >
                            <X className="h-4 w-4" />
                            Remove
                        </button>
                    )}
                </div>

                {/* Success Message */}
                {uploadSuccess && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-green-500">
                        <Check className="h-4 w-4" />
                        Image uploaded successfully!
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}
            </div>

            {/* Manual URL Input */}
            <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                    Or enter URL manually
                </label>
                <input
                    type="url"
                    value={thumbnailUrl}
                    onChange={(e) => handleManualInput(e.target.value)}
                    className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://example.com/image.jpg"
                />
            </div>

            {/* Preview */}
            {thumbnailUrl && (
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        Preview
                    </label>
                    <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden border border-border bg-secondary">
                        <img
                            src={thumbnailUrl}
                            alt="Thumbnail preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = '';
                                (e.target as HTMLImageElement).alt = 'Image failed to load';
                                setError('Failed to load image. Please check the URL.');
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
