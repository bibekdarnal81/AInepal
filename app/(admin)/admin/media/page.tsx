'use client'

import React, { useEffect, useState, useRef } from 'react'
import {
    Image as ImageIcon,
    Upload,
    Trash2,
    Search,
    Loader2,
    Copy,
    Check,
    ExternalLink,
    Grid,
    List,
    Filter
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface R2File {
    key: string
    url: string
    size?: number
    lastModified?: string
    contentType?: string
}

export default function MediaPage() {
    const [files, setFiles] = useState<R2File[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [selectedKeys, setSelectedKeys] = useState<string[]>([])
    const [isSelecting, setIsSelecting] = useState(false)
    const [copyingKey, setCopyingKey] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const fetchFiles = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/files')
            const data = await res.json()
            if (res.ok) {
                // Filter for images only
                const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif']
                const filteredFiles = (data.files || []).filter((f: R2File) => {
                    const ext = f.key.split('.').pop()?.toLowerCase()
                    return ext && imageExtensions.includes(ext)
                })
                setFiles(filteredFiles)
            }
        } catch (e) {
            console.error('Error fetching files:', e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchFiles()
    }, [])

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', 'media')

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })
            if (res.ok) {
                fetchFiles()
            }
        } catch (e) {
            console.error('Upload failed:', e)
        } finally {
            setUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const handleDelete = async (key: string) => {
        if (!confirm('Are you sure you want to delete this image?')) return

        try {
            const res = await fetch('/api/files', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key })
            })
            if (res.ok) {
                setFiles(files.filter(f => f.key !== key))
                setSelectedKeys(selectedKeys.filter(k => k !== key))
            }
        } catch (e) {
            console.error('Delete failed:', e)
        }
    }

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedKeys.length} images?`)) return

        setLoading(true)
        try {
            const res = await fetch('/api/files', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keys: selectedKeys })
            })
            if (res.ok) {
                setFiles(files.filter(f => !selectedKeys.includes(f.key)))
                setSelectedKeys([])
                setIsSelecting(false)
            }
        } catch (e) {
            console.error('Bulk delete failed:', e)
        } finally {
            setLoading(false)
        }
    }

    const toggleSelect = (key: string) => {
        if (selectedKeys.includes(key)) {
            setSelectedKeys(selectedKeys.filter(k => k !== key))
        } else {
            setSelectedKeys([...selectedKeys, key])
        }
    }

    const toggleAll = () => {
        if (selectedKeys.length === filteredFiles.length) {
            setSelectedKeys([])
        } else {
            setSelectedKeys(filteredFiles.map(f => f.key))
        }
    }

    const copyToClipboard = (url: string, key: string) => {
        navigator.clipboard.writeText(url)
        setCopyingKey(key)
        setTimeout(() => setCopyingKey(null), 2000)
    }

    const filteredFiles = files.filter(f =>
        f.key.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
                    <p className="text-muted-foreground mt-1">Manage and browse your uploaded images</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            setIsSelecting(!isSelecting)
                            if (isSelecting) setSelectedKeys([])
                        }}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${isSelecting ? 'bg-secondary text-foreground' : 'bg-background border border-border hover:bg-secondary/50'}`}
                    >
                        {isSelecting ? 'Cancel Selection' : 'Select Multiple'}
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleUpload}
                        className="hidden"
                        accept="image/*"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        Upload Image
                    </button>
                </div>
            </div>

            {isSelecting && selectedKeys.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-card border border-border shadow-2xl rounded-2xl p-4 flex items-center gap-6 min-w-[400px]"
                >
                    <div className="flex flex-col">
                        <span className="text-sm font-bold">{selectedKeys.length} images selected</span>
                        <span className="text-xs text-muted-foreground">Select icons to perform actions</span>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleAll}
                            className="text-sm font-medium hover:text-primary transition-colors"
                        >
                            {selectedKeys.length === filteredFiles.length ? 'Deselect All' : 'Select All'}
                        </button>
                        <button
                            onClick={handleBulkDelete}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete Selected
                        </button>
                    </div>
                </motion.div>
            )}

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border flex flex-col md:flex-row gap-4 justify-between bg-secondary/10">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search images..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2 bg-background p-1 rounded-lg border border-border">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-secondary text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <Grid className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-secondary text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <List className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                            <p className="text-muted-foreground font-medium">Loading your media...</p>
                        </div>
                    ) : filteredFiles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="h-20 w-20 bg-secondary rounded-full flex items-center justify-center mb-4">
                                <ImageIcon className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">No images found</h3>
                            <p className="text-muted-foreground max-w-xs mx-auto">
                                {searchQuery ? `No images matching "${searchQuery}"` : "Try uploading some images to your library."}
                            </p>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            <AnimatePresence mode="popLayout">
                                {filteredFiles.map((file) => (
                                    <motion.div
                                        key={file.key}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        onClick={() => isSelecting && toggleSelect(file.key)}
                                        className={`group relative aspect-square bg-secondary/30 rounded-xl overflow-hidden border transition-all flex flex-col cursor-pointer ${selectedKeys.includes(file.key) ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'}`}
                                    >
                                        <div className="relative flex-1 overflow-hidden group">
                                            <img
                                                src={file.url}
                                                alt={file.key}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />

                                            {isSelecting && (
                                                <div className="absolute top-2 left-2 z-10">
                                                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${selectedKeys.includes(file.key) ? 'bg-primary border-primary text-primary-foreground' : 'bg-white/20 border-white/50 backdrop-blur-sm'}`}>
                                                        {selectedKeys.includes(file.key) && <Check className="h-3.5 w-3.5" />}
                                                    </div>
                                                </div>
                                            )}

                                            {!isSelecting && (
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => copyToClipboard(file.url, file.key)}
                                                        className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-all"
                                                        title="Copy URL"
                                                    >
                                                        {copyingKey === file.key ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                                                    </button>
                                                    <a
                                                        href={file.url}
                                                        target="_blank"
                                                        className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-all"
                                                        title="Open in new tab"
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                    </a>
                                                    <button
                                                        onClick={() => handleDelete(file.key)}
                                                        className="p-2 bg-red-500/20 hover:bg-red-500/60 rounded-full text-white backdrop-blur-sm transition-all"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-2 bg-card text-[10px] font-medium truncate border-t border-border">
                                            {file.key.split('/').pop()}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="pb-3 font-semibold">Preview</th>
                                        <th className="pb-3 font-semibold">Filename</th>
                                        <th className="pb-3 font-semibold">Type</th>
                                        <th className="pb-3 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredFiles.map((file) => (
                                        <tr
                                            key={file.key}
                                            onClick={() => isSelecting && toggleSelect(file.key)}
                                            className={`group hover:bg-secondary/20 transition-colors cursor-pointer ${selectedKeys.includes(file.key) ? 'bg-primary/5' : ''}`}
                                        >
                                            <td className="py-3">
                                                <div className="flex items-center gap-3">
                                                    {isSelecting && (
                                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${selectedKeys.includes(file.key) ? 'bg-primary border-primary text-primary-foreground' : 'bg-background border-border'}`}>
                                                            {selectedKeys.includes(file.key) && <Check className="h-3 w-3" />}
                                                        </div>
                                                    )}
                                                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-secondary border border-border shrink-0">
                                                        <img src={file.url} alt="" className="h-full w-full object-cover" />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 font-medium truncate max-w-[200px]">
                                                {file.key.split('/').pop()}
                                            </td>
                                            <td className="py-3 text-muted-foreground">
                                                {file.key.split('.').pop()?.toUpperCase()}
                                            </td>
                                            <td className="py-3 text-right">
                                                {!isSelecting && (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); copyToClipboard(file.url, file.key) }}
                                                            className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground hover:text-primary transition-all"
                                                            title="Copy URL"
                                                        >
                                                            {copyingKey === file.key ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(file.key) }}
                                                            className="p-1.5 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500 transition-all"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
