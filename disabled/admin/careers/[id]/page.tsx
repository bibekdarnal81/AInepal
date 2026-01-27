'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { RichTextEditor } from '@/components/rich-text-editor'
import { AccordionItem } from '@/components/accordion'

export default function EditCareerPage() {
    const params = useParams()
    const id = params.id as string
    const router = useRouter()
    const supabase = createClient()

    const [title, setTitle] = useState('')
    const [slug, setSlug] = useState('')
    const [location, setLocation] = useState('')
    const [employmentType, setEmploymentType] = useState('')
    const [department, setDepartment] = useState('')
    const [experience, setExperience] = useState('')
    const [description, setDescription] = useState('')
    const [requirements, setRequirements] = useState('')
    const [applyUrl, setApplyUrl] = useState('')
    const [displayOrder, setDisplayOrder] = useState('0')
    const [isPublished, setIsPublished] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [deleteConfirm, setDeleteConfirm] = useState(false)

    useEffect(() => {
        const fetchCareer = async () => {
            const { data, error } = await supabase
                .from('careers')
                .select('*')
                .eq('id', id)
                .single()

            if (error || !data) {
                router.push('/admin/careers')
                return
            }

            setTitle(data.title || '')
            setSlug(data.slug || '')
            setLocation(data.location || '')
            setEmploymentType(data.employment_type || '')
            setDepartment(data.department || '')
            setExperience(data.experience || '')
            setDescription(data.description || '')
            setRequirements(data.requirements || '')
            setApplyUrl(data.apply_url || '')
            setDisplayOrder(data.display_order?.toString() || '0')
            setIsPublished(!!data.is_published)
            setLoading(false)
        }

        fetchCareer()
    }, [id, router, supabase])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSaving(true)

        const { error: updateError } = await supabase
            .from('careers')
            .update({
                title: title.trim(),
                slug: slug.trim(),
                location: location.trim() || null,
                employment_type: employmentType.trim() || null,
                department: department.trim() || null,
                experience: experience.trim() || null,
                description: description.trim() || null,
                requirements: requirements.trim() || null,
                apply_url: applyUrl.trim() || null,
                display_order: parseInt(displayOrder) || 0,
                is_published: isPublished,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)

        if (updateError) {
            setError(updateError.message)
            setSaving(false)
        } else {
            router.push('/admin/careers')
        }
    }

    const handleDelete = async () => {
        const { error } = await supabase
            .from('careers')
            .delete()
            .eq('id', id)

        if (!error) {
            router.push('/admin/careers')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/careers" className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Edit Role</h1>
                        <p className="text-muted-foreground mt-1">Update job opening details</p>
                    </div>
                </div>
                <button
                    onClick={() => setDeleteConfirm(true)}
                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                    <Trash2 className="h-5 w-5" />
                </button>
            </div>

            {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-sm text-red-500">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-2">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-2">Slug</label>
                            <input
                                type="text"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Location</label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Employment Type</label>
                            <input
                                type="text"
                                value={employmentType}
                                onChange={(e) => setEmploymentType(e.target.value)}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Department</label>
                            <input
                                type="text"
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Experience</label>
                            <input
                                type="text"
                                value={experience}
                                onChange={(e) => setExperience(e.target.value)}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <AccordionItem title="Role Description" defaultOpen={true}>
                                <RichTextEditor
                                    content={description}
                                    onChange={setDescription}
                                    placeholder="Describe the role and responsibilities..."
                                    minHeight="250px"
                                />
                            </AccordionItem>
                        </div>

                        <div className="md:col-span-2">
                            <AccordionItem title="Requirements" defaultOpen={false}>
                                <RichTextEditor
                                    content={requirements}
                                    onChange={setRequirements}
                                    placeholder="List requirements and qualifications..."
                                    minHeight="200px"
                                />
                            </AccordionItem>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-2">Apply URL</label>
                            <input
                                type="url"
                                value={applyUrl}
                                onChange={(e) => setApplyUrl(e.target.value)}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Display Order</label>
                            <input
                                type="number"
                                value={displayOrder}
                                onChange={(e) => setDisplayOrder(e.target.value)}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={isPublished}
                                onChange={(e) => setIsPublished(e.target.checked)}
                                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-2 focus:ring-primary"
                            />
                            <span className="text-sm text-foreground">Published</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Link
                        href="/admin/careers"
                        className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        <Save className="h-4 w-4" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>

            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-xl border border-border p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold text-foreground mb-2">Delete Role</h3>
                        <p className="text-muted-foreground mb-6">
                            Are you sure you want to delete this role? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteConfirm(false)}
                                className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
