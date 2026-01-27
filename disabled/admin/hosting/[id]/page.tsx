'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Plus, X, GripVertical } from 'lucide-react'
import Link from 'next/link'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Sortable Feature Item Component
function SortableFeatureItem({ id, feature, onRemove }: { id: string; feature: string; onRemove: () => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-2 bg-secondary px-3 py-2 rounded-lg"
        >
            <button
                type="button"
                className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
                {...attributes}
                {...listeners}
            >
                <GripVertical className="w-4 h-4" />
            </button>
            <span className="flex-1 text-sm text-foreground">{feature}</span>
            <button
                type="button"
                onClick={onRemove}
                className="text-red-500 hover:text-red-600"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    )
}

export default function EditHostingPlanPage() {
    const router = useRouter()
    const params = useParams()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        type: 'shared' as 'shared' | 'vps' | 'dedicated',
        storage_gb: 10,
        bandwidth_text: 'Unlimited',
        price: 1000,
        price_yearly: 10000,
        features: [] as string[],
        is_active: true
    })
    const [newFeature, setNewFeature] = useState('')

    // Drag and drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    useEffect(() => {
        const fetchPlan = async () => {
            if (!params?.id) return

            const { data, error } = await supabase
                .from('hosting_plans')
                .select('*')
                .eq('id', params.id)
                .single()

            if (error) {
                console.error('Error fetching plan:', error)
                alert('Failed to load plan')
                router.push('/admin/hosting')
                return
            }

            if (data) {
                setFormData({
                    name: data.name,
                    slug: data.slug,
                    type: data.type || 'shared',
                    storage_gb: data.storage_gb,
                    bandwidth_text: data.bandwidth_text,
                    price: data.price,
                    price_yearly: data.price_yearly || (data.price * 10),
                    features: data.features || [],
                    is_active: data.is_active
                })
            }
            setLoading(false)
        }

        fetchPlan()
    }, [params?.id])

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            setFormData(prev => {
                const oldIndex = prev.features.findIndex((_, i) => i.toString() === active.id)
                const newIndex = prev.features.findIndex((_, i) => i.toString() === over.id)

                return {
                    ...prev,
                    features: arrayMove(prev.features, oldIndex, newIndex)
                }
            })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const { error } = await supabase
                .from('hosting_plans')
                .update({
                    name: formData.name,
                    slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
                    type: formData.type,
                    storage_gb: formData.storage_gb,
                    bandwidth_text: formData.bandwidth_text,
                    price: formData.price,
                    price_yearly: formData.price_yearly,
                    features: formData.features,
                    is_active: formData.is_active
                })
                .eq('id', params?.id)

            if (error) {
                console.error('Error updating hosting plan:', error)
                alert('Failed to update hosting plan: ' + error.message)
                return
            }

            alert('Hosting plan updated successfully!')
            router.push('/admin/hosting')
        } catch (error) {
            console.error('Error:', error)
            alert('An error occurred while updating the plan')
        } finally {
            setSubmitting(false)
        }
    }

    const addFeature = () => {
        if (newFeature.trim()) {
            setFormData(prev => ({
                ...prev,
                features: [...prev.features, newFeature.trim()]
            }))
            setNewFeature('')
        }
    }

    const removeFeature = (index: number) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }))
    }

    if (loading) {
        return (
            <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <Link
                    href="/admin/hosting"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Hosting Plans
                </Link>
                <h1 className="text-3xl font-bold text-foreground mb-2">Edit Hosting Plan</h1>
                <p className="text-muted-foreground">Update hosting plan details</p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-2xl">
                {/* Plan Type */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-foreground mb-3">
                        Hosting Type
                    </label>
                    <div className="flex gap-4">
                        {['shared', 'vps', 'dedicated'].map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, type: type as any }))}
                                className={`flex-1 p-3 rounded-lg border-2 text-center transition-all capitalize ${formData.type === type
                                    ? 'border-primary bg-primary/5 text-primary'
                                    : 'border-border hover:border-primary/50 text-muted-foreground'
                                    }`}
                            >
                                <div className="font-bold">{type}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Plan Name */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-foreground mb-2">
                        Plan Name *
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g., Starter Plan, Professional Plan"
                    />
                </div>

                {/* Slug */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-foreground mb-2">
                        Slug (auto-generated if empty)
                    </label>
                    <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g., starter-plan"
                    />
                </div>

                {/* Storage */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-foreground mb-2">
                        Storage (GB) *
                    </label>
                    <input
                        type="number"
                        required
                        min="1"
                        value={formData.storage_gb}
                        onChange={(e) => setFormData(prev => ({ ...prev, storage_gb: parseInt(e.target.value) }))}
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                {/* Bandwidth */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-foreground mb-2">
                        Bandwidth *
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.bandwidth_text}
                        onChange={(e) => setFormData(prev => ({ ...prev, bandwidth_text: e.target.value }))}
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g., Unlimited, 100 GB/month"
                    />
                </div>

                {/* Price */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Monthly Price (रू) *
                        </label>
                        <input
                            type="number"
                            required
                            min="0"
                            value={formData.price}
                            onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) }))}
                            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Yearly Price (रू) *
                        </label>
                        <input
                            type="number"
                            required
                            min="0"
                            value={formData.price_yearly}
                            onChange={(e) => setFormData(prev => ({ ...prev, price_yearly: parseInt(e.target.value) }))}
                            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>

                {/* Features */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-foreground mb-2">
                        Features (drag to reorder)
                    </label>
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={formData.features.map((_, i) => i.toString())}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-2 mb-3">
                                {formData.features.map((feature, index) => (
                                    <SortableFeatureItem
                                        key={index}
                                        id={index.toString()}
                                        feature={feature}
                                        onRemove={() => removeFeature(index)}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newFeature}
                            onChange={(e) => setNewFeature(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                            className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Add a feature..."
                        />
                        <button
                            type="button"
                            onClick={addFeature}
                            className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Active Status */}
                <div className="mb-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.is_active}
                            onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                            className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-2 focus:ring-primary"
                        />
                        <span className="text-sm text-foreground">Active (visible to users)</span>
                    </label>
                </div>

                {/* Submit */}
                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {submitting ? 'Saving...' : 'Save Changes'}
                    </button>
                    <Link
                        href="/admin/hosting"
                        className="px-6 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    )
}
