'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Trash2, Pencil, Plus, ShoppingBag, X, Search, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { RichTextEditor } from '@/components/rich-text-editor'
import ThumbnailUpload from '@/components/thumbnail-upload'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface BundleOffer {
    id: string
    name: string
    description: string
    hosting_type: string
    price: number
    discount_percent: number
    poster_url?: string
    is_active: boolean
    show_on_home: boolean
}

interface Item {
    id: string
    title?: string // Projects, Services
    name?: string // Hosting Plans
    domain_name?: string // Domains
    image?: string
}

interface SelectedItem {
    id: string
    type: string
    name: string
}

export default function BundleOffersAdmin() {
    const supabase = createClient()
    const [offers, setOffers] = useState<BundleOffer[]>([])
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState({
        name: '',
        description: '',
        hosting_type: '',
        target_id: '',
        price: '',
        discount_percent: '',
        poster_url: '',
        is_active: true,
        show_on_home: false
    })
    const [editingId, setEditingId] = useState<string | null>(null)

    const [items, setItems] = useState<Item[]>([])
    const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([])
    const [loadingItems, setLoadingItems] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [isFormOpen, setIsFormOpen] = useState(false)

    const fetchOffers = async () => {
        const { data, error } = await supabase.from('bundle_offers').select('*').order('created_at', { ascending: false })
        if (error) {
            console.error(error)
        } else if (data) {
            setOffers(data as BundleOffer[])
        }
        setLoading(false)
    }

    const editOffer = async (offer: BundleOffer) => {
        setEditingId(offer.id)
        setForm({
            name: offer.name,
            description: offer.description,
            hosting_type: offer.hosting_type,
            target_id: '',
            price: offer.price.toString(),
            discount_percent: offer.discount_percent.toString(),
            poster_url: offer.poster_url || '',
            is_active: offer.is_active,
            show_on_home: offer.show_on_home ?? false
        })

        // Fetch items
        const { data: items, error } = await supabase
            .from('bundle_items')
            .select(`
                *,
                hosting_plans (id, name),
                projects (id, title),
                services (id, title),
                domains (id, domain_name)
            `)
            .eq('bundle_id', offer.id)

        if (items) {
            const mappedItems: SelectedItem[] = items.map((item: any) => {
                if (item.hosting_plans) return { id: item.hosting_plans.id, type: 'hosting', name: item.hosting_plans.name }
                if (item.projects) return { id: item.projects.id, type: 'project', name: item.projects.title }
                if (item.services) return { id: item.services.id, type: 'service', name: item.services.title }
                if (item.domains) return { id: item.domains.id, type: 'domain', name: item.domains.domain_name }
                return null
            }).filter(Boolean) as SelectedItem[]
            setSelectedItems(mappedItems)
        }

        setIsFormOpen(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const cancelEdit = () => {
        setEditingId(null)
        setForm({ name: '', description: '', hosting_type: '', target_id: '', price: '', discount_percent: '', poster_url: '', is_active: true, show_on_home: false })
        setSelectedItems([])
        setError('')
        setSuccess('')
        setIsFormOpen(false)
    }

    const deleteOffer = async (id: string) => {
        if (!confirm('Are you sure you want to delete this offer?')) return

        const { error } = await supabase.from('bundle_offers').delete().eq('id', id)
        if (error) {
            setError(error.message)
        } else {
            setSuccess('Offer deleted successfully')
            fetchOffers()
        }
    }

    useEffect(() => {
        fetchOffers()
    }, [])

    useEffect(() => {
        const fetchItems = async () => {
            if (!form.hosting_type) {
                setItems([])
                return
            }

            setLoadingItems(true)
            let tableName = ''
            let selectQuery = 'id, title'

            switch (form.hosting_type) {
                case 'project':
                    tableName = 'projects'
                    break
                case 'service':
                    tableName = 'services'
                    break
                case 'hosting':
                    tableName = 'hosting_plans'
                    selectQuery = 'id, name'
                    break
                case 'domain':
                    tableName = 'domains'
                    selectQuery = 'id, domain_name'
                    break
                default:
                    setItems([])
                    setLoadingItems(false)
                    return
            }

            const { data, error } = await supabase.from(tableName).select(selectQuery)
            if (error) {
                console.error('Error fetching items:', error)
            } else if (data) {
                setItems(data as any[])
            }
            setLoadingItems(false)
        }

        fetchItems()
    }, [form.hosting_type])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target
        const checked = (e.target as HTMLInputElement).checked

        if (name === 'target_id') {
            const selectedItem = items.find(i => i.id === value)
            if (selectedItem) {
                const newItem: SelectedItem = {
                    id: value,
                    type: form.hosting_type,
                    name: selectedItem.title || selectedItem.name || selectedItem.domain_name || 'Unknown'
                }
                if (!selectedItems.some(i => i.id === value)) {
                    setSelectedItems(prev => [...prev, newItem])
                }
                setForm(prev => ({ ...prev, target_id: '' }))
            }
        } else {
            setForm(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }))
        }
    }

    const removeSelectedItem = (id: string) => {
        setSelectedItems(prev => prev.filter(i => i.id !== id))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        if (selectedItems.length === 0) {
            setError('Please select at least one item for the bundle.')
            return
        }

        const payload = {
            name: form.name,
            description: form.description,
            hosting_type: 'bundle',
            price: Number(form.price),
            discount_percent: Number(form.discount_percent),
            poster_url: form.poster_url,
            is_active: form.is_active,
            show_on_home: form.show_on_home
        }

        let offerId = editingId

        if (editingId) {
            const { error: updateError } = await supabase
                .from('bundle_offers')
                .update(payload)
                .eq('id', editingId)

            if (updateError) {
                setError(updateError.message)
                return
            }

            const { error: deleteItemsError } = await supabase
                .from('bundle_items')
                .delete()
                .eq('bundle_id', editingId)

            if (deleteItemsError) {
                console.error('Error clearing old items:', deleteItemsError)
            }
        } else {
            const { data: offerData, error: offerError } = await supabase
                .from('bundle_offers')
                .insert([payload])
                .select()
                .single()

            if (offerError) {
                setError(offerError.message)
                return
            }
            offerId = offerData.id
        }

        if (offerId) {
            const itemsPayload = selectedItems.map(item => ({
                bundle_id: offerId,
                ...(item.type === 'hosting' ? { hosting_plan_id: item.id } : {}),
                ...(item.type === 'project' ? { project_id: item.id } : {}),
                ...(item.type === 'service' ? { service_id: item.id } : {}),
                ...(item.type === 'domain' ? { domain_id: item.id } : {}),
            }))

            if (itemsPayload.length > 0) {
                const { error: itemsError } = await supabase.from('bundle_items').insert(itemsPayload)
                if (itemsError) {
                    console.error('Error inserting bundle items:', itemsError)
                    setError(`Offer ${editingId ? 'updated' : 'created'} but items failed: ${itemsError.message}`)
                    return
                }
            }

            setSuccess(`Bundle offer ${editingId ? 'updated' : 'created'} successfully`)
            fetchOffers()
            cancelEdit()
        }
    }


    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Bundle Offers</h1>
                    <p className="text-zinc-400 mt-1">Manage special deals and product bundles</p>
                </div>
                {!isFormOpen && (
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Create New Bundle
                    </button>
                )}
            </div>

            <AnimatePresence>
                {isFormOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-zinc-900/50 backdrop-blur-md rounded-3xl border border-white/5 p-6 md:p-8"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                {editingId ? <Pencil className="h-5 w-5 text-blue-400" /> : <Plus className="h-5 w-5 text-green-400" />}
                                {editingId ? 'Edit Bundle' : 'Create New Bundle'}
                            </h2>
                            <button onClick={cancelEdit} className="p-2 text-zinc-400 hover:text-white bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-400">Bundle Name</label>
                                        <input
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            required
                                            placeholder="e.g. Starter Pack Special"
                                            className="w-full px-4 py-3 bg-zinc-900/50 border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-400">Price</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">रू</span>
                                                <input
                                                    name="price"
                                                    type="number"
                                                    value={form.price}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full pl-10 pr-4 py-3 bg-zinc-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-400">Discount %</label>
                                            <div className="relative">
                                                <input
                                                    name="discount_percent"
                                                    type="number"
                                                    value={form.discount_percent}
                                                    onChange={handleChange}
                                                    className="w-full pl-4 pr-10 py-3 bg-zinc-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-zinc-900/50 rounded-xl border border-white/5 space-y-4">
                                        <h3 className="text-sm font-bold text-white mb-2">Bundle Contents</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <select
                                                    name="hosting_type"
                                                    value={form.hosting_type}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500/50"
                                                >
                                                    <option value="" disabled>Add Type...</option>
                                                    <option value="service" className="bg-zinc-900">Service</option>
                                                    <option value="hosting" className="bg-zinc-900">Hosting Plan</option>
                                                    <option value="domain" className="bg-zinc-900">Domain</option>
                                                    <option value="project" className="bg-zinc-900">Project</option>
                                                </select>
                                            </div>
                                            <div>
                                                <select
                                                    name="target_id"
                                                    value={form.target_id}
                                                    onChange={handleChange}
                                                    disabled={!form.hosting_type || loadingItems}
                                                    className="w-full px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <option value="" disabled>
                                                        {loadingItems ? 'Loading...' : 'Select Item...'}
                                                    </option>
                                                    {items.map(item => (
                                                        <option key={item.id} value={item.id} className="bg-zinc-900">
                                                            {item.title || item.name || item.domain_name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Selected Items Chips */}
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {selectedItems.length === 0 ? (
                                                <p className="text-xs text-zinc-600 italic">No items added yet</p>
                                            ) : (
                                                selectedItems.map(item => (
                                                    <div key={item.id} className="flex items-center gap-2 pl-3 pr-2 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-md group">
                                                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">{item.type}</span>
                                                        <span className="text-sm text-zinc-300 max-w-[150px] truncate">{item.name}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeSelectedItem(item.id)}
                                                            className="p-0.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-8">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${form.is_active ? 'bg-green-500 border-green-500' : 'border-zinc-600 group-hover:border-zinc-500'}`}>
                                                {form.is_active && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                                            </div>
                                            <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="hidden" />
                                            <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">Active Status</span>
                                        </label>

                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${form.show_on_home ? 'bg-blue-500 border-blue-500' : 'border-zinc-600 group-hover:border-zinc-500'}`}>
                                                {form.show_on_home && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                                            </div>
                                            <input type="checkbox" name="show_on_home" checked={form.show_on_home} onChange={handleChange} className="hidden" />
                                            <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">Show on Home</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-400">Description</label>
                                        <div className="bg-zinc-900/50 rounded-xl border border-white/10 overflow-hidden min-h-[200px]">
                                            <RichTextEditor
                                                content={form.description}
                                                onChange={(content) => setForm(prev => ({ ...prev, description: content }))}
                                                className="prose-invert"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-400">Cover Image</label>
                                        <div className="bg-zinc-900/50 rounded-xl border border-white/10 p-4">
                                            <ThumbnailUpload
                                                label=""
                                                currentUrl={form.poster_url}
                                                onUploadComplete={(url) => setForm(prev => ({ ...prev, poster_url: url }))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/5 flex gap-4 justify-end">
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="px-6 py-2.5 rounded-xl font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                >
                                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {editingId ? 'Update Offer' : 'Create Offer'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-4">
                {success && (
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                        <p>{success}</p>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 rounded-full border-t-2 border-r-2 border-blue-500 animate-spin"></div>
                    </div>
                ) : offers.length === 0 ? (
                    <div className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-white/5 border-dashed">
                        <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mx-auto mb-4">
                            <ShoppingBag className="h-8 w-8 text-zinc-600" />
                        </div>
                        <h3 className="text-white font-bold mb-1">No Offers Found</h3>
                        <p className="text-zinc-500 text-sm">Create your first bundle offer to get started.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {offers.map(offer => (
                            <motion.div
                                layout
                                key={offer.id}
                                className="bg-zinc-900/40 backdrop-blur-sm rounded-2xl border border-white/5 hover:border-white/10 transition-all overflow-hidden group flex flex-col"
                            >
                                <div className="aspect-[16/9] relative bg-zinc-800 overflow-hidden">
                                    {offer.poster_url ? (
                                        <img
                                            src={offer.poster_url}
                                            alt={offer.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ShoppingBag className="h-12 w-12 text-zinc-700" />
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 flex gap-2">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${offer.is_active ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                                            {offer.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    {offer.discount_percent > 0 && (
                                        <div className="absolute bottom-3 right-3">
                                            <span className="px-3 py-1 rounded-full bg-red-600 shadow-lg text-white text-xs font-bold">
                                                -{offer.discount_percent}% OFF
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex-1 mb-6">
                                        <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{offer.name}</h3>
                                        <div className="flex items-baseline gap-2 mb-4">
                                            <span className="text-2xl font-bold text-blue-400">
                                                <span className="text-sm align-top mr-0.5">रू</span>
                                                {offer.price.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="prose prose-sm prose-invert line-clamp-2 text-zinc-400 text-sm">
                                            <div dangerouslySetInnerHTML={{ __html: offer.description }} />
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => editOffer(offer)}
                                            className="p-2 rounded-lg text-blue-400 hover:text-white hover:bg-blue-600 transition-colors"
                                            title="Edit"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteOffer(offer.id)}
                                            className="p-2 rounded-lg text-red-400 hover:text-white hover:bg-red-600 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
