'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '../../../components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card'
import { CheckCircle, XCircle, Trash2, Pencil } from 'lucide-react'
import { RichTextEditor } from '@/components/rich-text-editor'
import ThumbnailUpload from '@/components/thumbnail-upload'

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

    const fetchOffers = async () => {
        const { data, error } = await supabase.from('bundle_offers').select('*')
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
            hosting_type: offer.hosting_type, // This might be 'bundle' if generic, or specific type if used that way
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

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const cancelEdit = () => {
        setEditingId(null)
        setForm({ name: '', description: '', hosting_type: '', target_id: '', price: '', discount_percent: '', poster_url: '', is_active: true, show_on_home: false })
        setSelectedItems([])
        setError('')
        setSuccess('')
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
            let selectQuery = 'id, title' // Default for projects/services

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
                // Prevent duplicates
                if (!selectedItems.some(i => i.id === value)) {
                    setSelectedItems(prev => [...prev, newItem])
                }
                // Reset selection
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
            hosting_type: 'bundle', // Or keep form.hosting_type if it acts as a category
            price: Number(form.price),
            discount_percent: Number(form.discount_percent),
            poster_url: form.poster_url,
            is_active: form.is_active,
            show_on_home: form.show_on_home
        }


        let offerId = editingId

        if (editingId) {
            // Update existing offer
            const { error: updateError } = await supabase
                .from('bundle_offers')
                .update(payload)
                .eq('id', editingId)

            if (updateError) {
                setError(updateError.message)
                return
            }

            // Delete existing items to replace them
            const { error: deleteItemsError } = await supabase
                .from('bundle_items')
                .delete()
                .eq('bundle_id', editingId)

            if (deleteItemsError) {
                console.error('Error clearing old items:', deleteItemsError)
            }
        } else {
            // Insert new offer
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
            // Insert bundle items
            const itemsPayload = selectedItems.map(item => ({
                bundle_id: offerId,
                // Dynamically assign correct column based on type
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
            cancelEdit() // Reset form
        }
    }


    return (
        <div className="p-8 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700">
            <h1 className="text-3xl font-bold text-foreground mb-6">Bundle Offers – Admin</h1>
            {error && (
                <div className="flex items-center text-red-500 mb-4">
                    <XCircle className="h-5 w-5 mr-2" /> {error}
                </div>
            )}
            {success && (
                <div className="flex items-center text-green-500 mb-4">
                    <CheckCircle className="h-5 w-5 mr-2" /> {success}
                </div>
            )}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <Input name="name" placeholder="Offer Name" value={form.name} onChange={handleChange} required />
                <select
                    name="hosting_type"
                    value={form.hosting_type}
                    onChange={handleChange}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <option value="" disabled>Select Type</option>
                    <option value="service">Service</option>
                    <option value="hosting">Hosting</option>
                    <option value="domain">Domain</option>
                    <option value="project">Project</option>
                </select>

                <select
                    name="target_id"
                    value={form.target_id}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!form.hosting_type || loadingItems}
                >
                    <option value="" disabled>Select Item to Add</option>
                    {items.map(item => (
                        <option key={item.id} value={item.id}>
                            {item.title || item.name || item.domain_name}
                        </option>
                    ))}
                </select>

                {/* Selected Items List */}
                {selectedItems.length > 0 && (
                    <div className="col-span-1 md:col-span-2 space-y-2 mt-2">
                        <p className="text-sm font-medium text-foreground">Selected Items:</p>
                        <div className="flex flex-wrap gap-2">
                            {selectedItems.map(item => (
                                <div key={item.id} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">
                                    <span className="capitalize text-xs font-bold opacity-70">{item.type}:</span>
                                    <span>{item.name}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeSelectedItem(item.id)}
                                        className="ml-1 text-red-500 hover:text-red-700 font-bold"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <Input name="price" placeholder="Price" type="number" value={form.price} onChange={handleChange} required />
                <Input name="discount_percent" placeholder="Discount %" type="number" value={form.discount_percent} onChange={handleChange} />

                <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <RichTextEditor
                        content={form.description}
                        onChange={(content) => setForm(prev => ({ ...prev, description: content }))}
                    />
                </div>

                <div className="col-span-2">
                    <ThumbnailUpload
                        label="Offer Poster"
                        currentUrl={form.poster_url}
                        onUploadComplete={(url) => setForm(prev => ({ ...prev, poster_url: url }))}
                    />
                </div>
                <div className="flex gap-6 mb-4">
                    <label className="flex items-center space-x-2">
                        <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
                        <span className="text-foreground">Active</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input type="checkbox" name="show_on_home" checked={form.show_on_home} onChange={handleChange} />
                        <span className="text-foreground">Show on Home</span>
                    </label>
                </div>
                <div className="col-span-2 flex gap-4">
                    <Button type="submit" className="flex-1">
                        {editingId ? 'Update Bundle Offer' : 'Create Bundle Offer'}
                    </Button>
                    {editingId && (
                        <Button type="button" variant="secondary" onClick={cancelEdit} className="bg-gray-600 hover:bg-gray-500 text-white">
                            Cancel
                        </Button>
                    )}
                </div>
            </form>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Existing Offers</h2>
            {loading ? (
                <p className="text-muted-foreground">Loading…</p>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {offers.map(offer => (
                        <Card key={offer.id}>
                            <CardHeader>
                                <CardTitle>{offer.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {offer.poster_url && (
                                    <img src={offer.poster_url} alt={offer.name} className="w-full h-40 object-cover rounded-md mb-4" />
                                )}
                                <div className="prose prose-sm dark:prose-invert mb-2" dangerouslySetInnerHTML={{ __html: offer.description }} />
                                <p>Type: {offer.hosting_type}</p>
                                <p>Price: रू {offer.price}</p>
                                <p>Discount: {offer.discount_percent}%</p>
                                <p>Status: {offer.is_active ? 'Active' : 'Inactive'}</p>
                            </CardContent>
                            <div className="p-6 pt-0 flex justify-end">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => editOffer(offer)}
                                    className="text-blue-500 hover:text-blue-600 hover:bg-blue-100 mr-2"
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteOffer(offer.id)}
                                    className="text-red-500 hover:text-red-600 hover:bg-red-100"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div >
    )
}

