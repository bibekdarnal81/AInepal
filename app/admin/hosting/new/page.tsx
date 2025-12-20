'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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

const PLAN_CATEGORIES = [
    { value: 'starter', label: 'Starter', description: 'Perfect for small websites and blogs' },
    { value: 'professional', label: 'Professional', description: 'For growing businesses' },
    { value: 'business', label: 'Business', description: 'Enterprise-grade hosting' },
    { value: 'custom', label: 'Custom', description: 'Custom hosting solution' }
]

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

export default function NewHostingPlanPage() {
    const router = useRouter()
    const supabase = createClient()

    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        category: 'starter',
        storage_gb: 10,
        bandwidth_text: 'Unlimited',
        price: 1000,
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
        setLoading(true)

        try {
            const { error } = await supabase
                .from('hosting_plans')
                .insert({
                    name: formData.name,
                    slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
                    storage_gb: formData.storage_gb,
                    bandwidth_text: formData.bandwidth_text,
                    price: formData.price,
                    features: formData.features,
                    is_active: formData.is_active
                })

            if (error) {
                console.error('Error creating hosting plan:', error)
                alert('Failed to create hosting plan: ' + error.message)
                return
            }

            alert('Hosting plan created successfully!')
            router.push('/admin/hosting')
        } catch (error) {
            console.error('Error:', error)
            alert('An error occurred while creating the plan')
        } finally {
            setLoading(false)
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

    const applyCategory = (category: string) => {
        // Pre-fill based on category
        switch (category) {
            case 'starter':
                setFormData(prev => ({
                    ...prev,
                    category,
                    storage_gb: 10,
                    bandwidth_text: 'Unlimited',
                    price: 1000,
                    features: [
                        '1 Website',
                        '10 GB SSD Storage',
                        'Unlimited Bandwidth',
                        'Free SSL Certificate',
                        '99.9% Uptime Guarantee'
                    ]
                }))
                break
            case 'professional':
                setFormData(prev => ({
                    ...prev,
                    category,
                    storage_gb: 50,
                    bandwidth_text: 'Unlimited',
                    price: 2500,
                    features: [
                        '10 Websites',
                        '50 GB SSD Storage',
                        'Unlimited Bandwidth',
                        'Free SSL Certificates',
                        '99.9% Uptime Guarantee',
                        'Daily Backups',
                        'Priority Support'
                    ]
                }))
                break
            case 'business':
                setFormData(prev => ({
                    ...prev,
                    category,
                    storage_gb: 200,
                    bandwidth_text: 'Unlimited',
                    price: 5000,
                    features: [
                        'Unlimited Websites',
                        '200 GB SSD Storage',
                        'Unlimited Bandwidth',
                        'Free SSL Certificates',
                        '99.99% Uptime SLA',
                        'Hourly Backups',
                        '24/7 Priority Support',
                        'CDN Integration',
                        'Advanced Security'
                    ]
                }))
                break
            default:
                setFormData(prev => ({ ...prev, category }))
        }
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
                <h1 className="text-3xl font-bold text-foreground mb-2">Create Hosting Plan</h1>
                <p className="text-muted-foreground">Add a new hosting plan with features and pricing</p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-2xl">
                {/* Category Selection */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-foreground mb-3">
                        Plan Category
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        {PLAN_CATEGORIES.map((category) => (
                            <button
                                key={category.value}
                                type="button"
                                onClick={() => applyCategory(category.value)}
                                className={`p-4 rounded-lg border-2 text-left transition-all ${formData.category === category.value
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'
                                    }`}
                            >
                                <div className="font-medium text-foreground">{category.label}</div>
                                <div className="text-sm text-muted-foreground mt-1">{category.description}</div>
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
                <div className="mb-6">
                    <label className="block text-sm font-medium text-foreground mb-2">
                        Price (रू/month) *
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
                        disabled={loading}
                        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Hosting Plan'}
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
