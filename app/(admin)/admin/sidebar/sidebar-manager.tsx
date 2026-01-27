"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Save, Eye, EyeOff, MessageSquare, Image, Video, Headphones } from "lucide-react"

interface SidebarItem {
    key: string
    label: string
    href: string
    icon: string
    visible: boolean
    order: number
}

// Icon map for rendering
const iconMap: Record<string, React.ReactNode> = {
    MessageSquare: <MessageSquare className="w-5 h-5" />,
    Image: <Image className="w-5 h-5" />,
    Video: <Video className="w-5 h-5" />,
    Headphones: <Headphones className="w-5 h-5" />,
}

export function SidebarManager({ initialItems }: { initialItems: SidebarItem[] }) {
    const router = useRouter()
    const [items, setItems] = useState<SidebarItem[]>(
        [...initialItems].sort((a, b) => a.order - b.order)
    )
    const [loading, setLoading] = useState(false)
    const [saved, setSaved] = useState(false)

    const toggleVisibility = (key: string) => {
        setItems(prev => 
            prev.map(item => 
                item.key === key ? { ...item, visible: !item.visible } : item
            )
        )
        setSaved(false)
    }

    const moveItem = (index: number, direction: 'up' | 'down') => {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === items.length - 1)
        ) {
            return
        }

        const newItems = [...items]
        const targetIndex = direction === 'up' ? index - 1 : index + 1
        
        // Swap items
        ;[newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]]
        
        // Update order values
        newItems.forEach((item, i) => {
            item.order = i
        })

        setItems(newItems)
        setSaved(false)
    }

    const handleSave = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/sidebar', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sidebarItems: items })
            })

            if (!res.ok) throw new Error('Failed to save')

            setSaved(true)
            router.refresh()
            
            // Auto-hide success message
            setTimeout(() => setSaved(false), 3000)
        } catch {
            alert('Error saving sidebar settings')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Info Card */}
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                    Toggle visibility to show/hide menu items in the user sidebar. Hidden items will not be accessible to users.
                </p>
            </div>

            {/* Items List */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-4 border-b border-border bg-secondary/30">
                    <h3 className="font-semibold">Sidebar Menu Items</h3>
                </div>
                <div className="divide-y divide-border">
                    {items.map((item, index) => (
                        <div 
                            key={item.key}
                            className={`flex items-center gap-4 p-4 transition-colors ${!item.visible ? 'bg-red-50/50 dark:bg-red-950/20' : ''}`}
                        >
                            {/* Drag Handle */}
                            <div className="flex flex-col gap-1">
                                <button 
                                    onClick={() => moveItem(index, 'up')}
                                    disabled={index === 0}
                                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                    </svg>
                                </button>
                                <button 
                                    onClick={() => moveItem(index, 'down')}
                                    disabled={index === items.length - 1}
                                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            </div>

                            {/* Icon */}
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.visible ? 'bg-primary/10 text-primary' : 'bg-gray-200 dark:bg-gray-800 text-gray-400'}`}>
                                {iconMap[item.icon] || <MessageSquare className="w-5 h-5" />}
                            </div>

                            {/* Label & Href */}
                            <div className="flex-1">
                                <p className={`font-medium ${!item.visible ? 'line-through text-muted-foreground' : ''}`}>
                                    {item.label}
                                </p>
                                <p className="text-xs text-muted-foreground">{item.href}</p>
                            </div>

                            {/* Status Badge */}
                            <span className={`text-xs font-medium px-2 py-1 rounded ${item.visible ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                                {item.visible ? 'Visible' : 'Hidden'}
                            </span>

                            {/* Toggle Button */}
                            <button
                                onClick={() => toggleVisibility(item.key)}
                                className={`p-2 rounded-lg transition-colors ${item.visible 
                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50' 
                                    : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                                }`}
                                title={item.visible ? 'Hide this item' : 'Show this item'}
                            >
                                {item.visible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-4">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
                >
                    {loading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            Save Changes
                        </>
                    )}
                </button>
                {saved && (
                    <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                        ✓ Settings saved successfully!
                    </span>
                )}
            </div>
        </div>
    )
}
