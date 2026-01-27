'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import Link from 'next/link'
import ThumbnailUpload from '@/components/thumbnail-upload'
import { RichTextEditor } from '@/components/rich-text-editor'
import { AccordionItem } from '@/components/accordion'

export default function EditServicePage() {
    const params = useParams()
    const id = params.id as string

    const [title, setTitle] = useState('')
    const [slug, setSlug] = useState('')
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState('0')
    const [currency, setCurrency] = useState('USD')
    const [iconName, setIconName] = useState('')
    const [category, setCategory] = useState('')
    const [customCategory, setCustomCategory] = useState('')
    const [subcategory, setSubcategory] = useState('')
    const [customSubcategory, setCustomSubcategory] = useState('')
    const [thumbnailUrl, setThumbnailUrl] = useState('')
    const [features, setFeatures] = useState('')
    const [displayOrder, setDisplayOrder] = useState('0')
    const [isFeatured, setIsFeatured] = useState(false)
    const [isPublished, setIsPublished] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [deleteConfirm, setDeleteConfirm] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const fetchService = async () => {
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .eq('id', id)
                .single()

            if (error || !data) {
                router.push('/admin/services')
            } else {
                setTitle(data.title)
                setSlug(data.slug)
                setDescription(data.description || '')
                setPrice(data.price?.toString() || '0')
                setCurrency(data.currency || 'USD')
                setIconName(data.icon_name || '')
                setCategory(data.category || '')
                setSubcategory(data.subcategory || '')
                setThumbnailUrl(data.thumbnail_url || '')
                setFeatures(data.features?.join('\n') || '')
                setDisplayOrder(data.display_order?.toString() || '0')
                setIsFeatured(data.is_featured)
                setIsPublished(data.is_published)
            }
            setLoading(false)
        }
        fetchService()
    }, [id, router, supabase])

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value
        setCategory(value)
        setSubcategory('') // Reset subcategory when category changes
        if (value !== 'Custom') {
            setCustomCategory('') // Clear custom category if not 'Custom'
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSaving(true)

        const featuresArray = features.split('\n').map(f => f.trim()).filter(Boolean)

        const { error: updateError } = await supabase
            .from('services')
            .update({
                title: title.trim(),
                slug: slug.trim(),
                description: description.trim() || null,
                price: parseFloat(price) || 0,
                currency,
                icon_name: iconName.trim() || null,
                category: (category === 'Custom' ? customCategory : category).trim() || null,
                subcategory: (subcategory === 'Custom' ? customSubcategory : subcategory).trim() || null,
                thumbnail_url: thumbnailUrl.trim() || null,
                features: featuresArray,
                display_order: parseInt(displayOrder) || 0,
                is_featured: isFeatured,
                is_published: isPublished,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)

        if (updateError) {
            setError(updateError.message)
            setSaving(false)
        } else {
            router.push('/admin/services')
        }
    }

    const handleDelete = async () => {
        const { error } = await supabase
            .from('services')
            .delete()
            .eq('id', id)

        if (!error) {
            router.push('/admin/services')
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
                    <Link href="/admin/services" className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Edit Service</h1>
                        <p className="text-muted-foreground mt-1">Update service details</p>
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


                        <div className="md:col-span-2">
                            <AccordionItem title="Description" defaultOpen={true}>
                                <RichTextEditor
                                    content={description}
                                    onChange={setDescription}
                                    placeholder="Write your service description here..."
                                    minHeight="250px"
                                />
                            </AccordionItem>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Price</label>
                            <input
                                type="number"
                                step="0.01"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Currency</label>
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                                <option value="NPR">NPR (Rs)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Icon Name</label>
                            <input
                                type="text"
                                value={iconName}
                                onChange={(e) => setIconName(e.target.value)}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="ShoppingCart, Code, Smartphone, etc."
                            />
                            <p className="text-xs text-muted-foreground mt-1">Lucide icon name</p>
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

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Category *</label>
                            <select
                                value={category}
                                onChange={handleCategoryChange}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            >
                                <option value="">Select a category</option>
                                <option value="Web Development">Web Development</option>
                                <option value="Mobile Development">Mobile Development</option>
                                <option value="SEO Optimization">SEO Optimization</option>
                                <option value="Social Media Marketing">Social Media Marketing</option>
                                <option value="Content Marketing">Content Marketing</option>
                                <option value="E-Commerce">E-Commerce</option>
                                <option value="Graphic Design">Graphic Design</option>
                                <option value="UI/UX Design">UI/UX Design</option>
                                <option value="Branding">Branding</option>
                                <option value="Consulting">Consulting</option>
                                <option value="Maintenance & Support">Maintenance & Support</option>
                                <option value="Custom">+ Add Custom Category</option>
                            </select>
                        </div>

                        {category === 'Custom' && (
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Custom Category *</label>
                                <input
                                    type="text"
                                    value={customCategory}
                                    onChange={(e) => setCustomCategory(e.target.value)}
                                    className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Enter your custom category"
                                    required
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Subcategory</label>
                            <select
                                value={subcategory}
                                onChange={(e) => setSubcategory(e.target.value)}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                disabled={!category}
                            >
                                <option value="">Select a subcategory</option>
                                {category === 'Web Development' && (
                                    <>
                                        <option value="Full Stack Development">Full Stack Development</option>
                                        <option value="Frontend Development">Frontend Development</option>
                                        <option value="Backend Development">Backend Development</option>
                                        <option value="CMS Development">CMS Development</option>
                                        <option value="E-Commerce Development">E-Commerce Development</option>
                                    </>
                                )}
                                {category === 'Mobile Development' && (
                                    <>
                                        <option value="iOS Development">iOS Development</option>
                                        <option value="Android Development">Android Development</option>
                                        <option value="Cross-Platform">Cross-Platform</option>
                                        <option value="Progressive Web Apps">Progressive Web Apps</option>
                                    </>
                                )}
                                {category === 'SEO Optimization' && (
                                    <>
                                        <option value="On-Page SEO">On-Page SEO</option>
                                        <option value="Off-Page SEO">Off-Page SEO</option>
                                        <option value="Technical SEO">Technical SEO</option>
                                        <option value="Local SEO">Local SEO</option>
                                        <option value="SEO Audit">SEO Audit</option>
                                    </>
                                )}
                                {category === 'Social Media Marketing' && (
                                    <>
                                        <option value="Facebook Advertising">Facebook Advertising</option>
                                        <option value="Instagram Marketing">Instagram Marketing</option>
                                        <option value="LinkedIn Marketing">LinkedIn Marketing</option>
                                        <option value="Twitter Marketing">Twitter Marketing</option>
                                        <option value="TikTok Marketing">TikTok Marketing</option>
                                    </>
                                )}
                                {category === 'Content Marketing' && (
                                    <>
                                        <option value="Blog Writing">Blog Writing</option>
                                        <option value="Copywriting">Copywriting</option>
                                        <option value="Video Production">Video Production</option>
                                        <option value="Infographics">Infographics</option>
                                    </>
                                )}
                                {category === 'Graphic Design' && (
                                    <>
                                        <option value="Logo Design">Logo Design</option>
                                        <option value="Brochure Design">Brochure Design</option>
                                        <option value="Social Media Graphics">Social Media Graphics</option>
                                        <option value="Print Design">Print Design</option>
                                    </>
                                )}
                                {category === 'UI/UX Design' && (
                                    <>
                                        <option value="User Interface Design">User Interface Design</option>
                                        <option value="User Experience Design">User Experience Design</option>
                                        <option value="Wireframing">Wireframing</option>
                                        <option value="Prototyping">Prototyping</option>
                                    </>
                                )}
                                {category && (
                                    <option value="Custom">+ Add Custom Subcategory</option>
                                )}
                            </select>
                            {!category && (
                                <p className="text-xs text-muted-foreground mt-1">Select a category first</p>
                            )}
                        </div>

                        {subcategory === 'Custom' && (
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Custom Subcategory</label>
                                <input
                                    type="text"
                                    value={customSubcategory}
                                    onChange={(e) => setCustomSubcategory(e.target.value)}
                                    className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Enter your custom subcategory"
                                />
                            </div>
                        )}

                        <div className="md:col-span-2">
                            <ThumbnailUpload
                                currentUrl={thumbnailUrl}
                                onUploadComplete={(url) => setThumbnailUrl(url)}
                                label="Service Thumbnail"
                                description="Upload service image or provide URL (max 10MB)"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-2">Features (one per line)</label>
                            <textarea
                                value={features}
                                onChange={(e) => setFeatures(e.target.value)}
                                rows={6}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <p className="text-xs text-muted-foreground mt-1">Enter each feature on a new line</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setIsFeatured(!isFeatured)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isFeatured ? 'bg-primary' : 'bg-secondary'
                                    }`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isFeatured ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                            </button>
                            <label className="text-sm font-medium text-foreground">Featured</label>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setIsPublished(!isPublished)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPublished ? 'bg-primary' : 'bg-secondary'
                                    }`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPublished ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                            </button>
                            <label className="text-sm font-medium text-foreground">{isPublished ? 'Published' : 'Draft'}</label>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 justify-end">
                    <Link href="/admin/services" className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {saving ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        Save Changes
                    </button>
                </div>
            </form>

            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-xl border border-border p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold text-foreground mb-2">Delete Service</h3>
                        <p className="text-muted-foreground mb-6">
                            Are you sure you want to delete this service? This action cannot be undone.
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
