'use client';

import { useState } from 'react';

interface UploadedFile {
    key: string;
    url: string;
    size: number;
    contentType: string;
    originalName: string;
}

interface FileUploadProps {
    onUploadComplete?: (file: UploadedFile) => void;
    onUploadError?: (error: string) => void;
    acceptedTypes?: string[];
    maxSizeMB?: number;
}

export default function FileUpload({
    onUploadComplete,
    onUploadError,
    acceptedTypes = ['image/*', '.pdf', '.txt', '.csv'],
    maxSizeMB = 10,
}: FileUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Reset state
        setError(null);
        setUploadedFile(null);
        setProgress(0);

        // Validate file size
        if (file.size > maxSizeMB * 1024 * 1024) {
            const errorMsg = `File size exceeds ${maxSizeMB}MB limit`;
            setError(errorMsg);
            onUploadError?.(errorMsg);
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
            setUploadedFile(data.file);
            setProgress(100);
            onUploadComplete?.(data.file);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Upload failed';
            setError(errorMsg);
            onUploadError?.(errorMsg);
        } finally {
            setUploading(false);
        }
    };

    const handleCopyUrl = () => {
        if (uploadedFile?.url) {
            navigator.clipboard.writeText(uploadedFile.url);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="space-y-4">
                <div>
                    <label
                        htmlFor="file-upload"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                        Upload File
                    </label>
                    <input
                        id="file-upload"
                        type="file"
                        onChange={handleFileChange}
                        accept={acceptedTypes.join(',')}
                        disabled={uploading}
                        className="block w-full text-sm text-gray-900 dark:text-gray-100 
                     border border-gray-300 dark:border-gray-600 rounded-lg 
                     cursor-pointer bg-gray-50 dark:bg-gray-700 
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Maximum file size: {maxSizeMB}MB
                    </p>
                </div>

                {uploading && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span>Uploading...</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                {uploadedFile && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg space-y-3">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                                    Upload successful!
                                </p>
                                <p className="text-xs text-green-600 dark:text-green-400 mt-1 truncate">
                                    {uploadedFile.originalName}
                                </p>
                                <p className="text-xs text-green-600 dark:text-green-400">
                                    Size: {(uploadedFile.size / 1024).toFixed(2)} KB
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleCopyUrl}
                                className="px-3 py-1.5 text-xs font-medium text-green-700 dark:text-green-300 
                         bg-green-100 dark:bg-green-900/40 rounded hover:bg-green-200 
                         dark:hover:bg-green-900/60 transition-colors"
                            >
                                Copy URL
                            </button>
                            <a
                                href={uploadedFile.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 text-xs font-medium text-green-700 dark:text-green-300 
                         bg-green-100 dark:bg-green-900/40 rounded hover:bg-green-200 
                         dark:hover:bg-green-900/60 transition-colors"
                            >
                                View File
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
