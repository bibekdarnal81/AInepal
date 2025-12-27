'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, Edit, Upload, Save, X, Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'

interface PaymentMethod {
    id: string
    name: string
    type: 'esewa' | 'khalti' | 'bank_transfer' | 'other'
    qr_image_url: string | null
    account_name: string | null
    account_number: string | null
    bank_name: string | null
    instructions: string | null
    is_active: boolean
}

export default function PaymentMethodsAdminPage() {
    const [methods, setMethods] = useState<PaymentMethod[]>([])
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [currentMethod, setCurrentMethod] = useState<Partial<PaymentMethod>>({
        type: 'bank_transfer',
        is_active: true
    })
    const [uploading, setUploading] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        fetchMethods()
    }, [])

    const fetchMethods = async () => {
        const { data, error } = await supabase
            .from('payment_methods')
            .select('*')
            .order('created_at', { ascending: false })

        if (!error && data) {
            setMethods(data as any)
        }
        setLoading(false)
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return

        setUploading(true)
        const file = e.target.files[0]
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('folder', 'qr-codes')

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (!response.ok) throw new Error(result.error)

            setCurrentMethod(prev => ({ ...prev, qr_image_url: result.url }))
        } catch (error) {
            alert('Error uploading image: ' + (error as any).message)
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const methodData = {
            name: currentMethod.name,
            type: currentMethod.type,
            qr_image_url: currentMethod.qr_image_url,
            account_name: currentMethod.account_name,
            account_number: currentMethod.account_number,
            bank_name: currentMethod.bank_name,
            instructions: currentMethod.instructions,
            is_active: currentMethod.is_active
        }

        let error
        if (currentMethod.id) {
            const { error: updateError } = await supabase
                .from('payment_methods')
                .update(methodData)
                .eq('id', currentMethod.id)
            error = updateError
        } else {
            const { error: insertError } = await supabase
                .from('payment_methods')
                .insert([methodData])
            error = insertError
        }

        if (error) {
            alert('Error saving payment method')
        } else {
            fetchMethods()
            setIsEditing(false)
            setCurrentMethod({ type: 'bank_transfer', is_active: true })
        }
    }

    const deleteMethod = async (id: string) => {
        if (!confirm('Are you sure?')) return

        const { error } = await supabase
            .from('payment_methods')
            .delete()
            .eq('id', id)

        if (!error) fetchMethods()
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                        Payment Methods
                    </h1>
                    <p className="text-muted-foreground">Manage payment gateways and QR codes</p>
                </div>
                <button
                    onClick={() => {
                        setCurrentMethod({ type: 'bank_transfer', is_active: true })
                        setIsEditing(true)
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Method
                </button>
            </div>

            {isEditing && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card w-full max-w-2xl rounded-xl border border-border shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-secondary/30">
                            <h2 className="text-xl font-bold">
                                {currentMethod.id ? 'Edit Payment Method' : 'Add New Payment Method'}
                            </h2>
                            <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-secondary rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Method Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={currentMethod.name || ''}
                                            onChange={e => setCurrentMethod(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border focus:ring-2 focus:ring-primary/50 outline-none"
                                            placeholder="e.g. eSewa"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Type</label>
                                        <select
                                            value={currentMethod.type}
                                            onChange={e => setCurrentMethod(prev => ({ ...prev, type: e.target.value as any }))}
                                            className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border focus:ring-2 focus:ring-primary/50 outline-none"
                                        >
                                            <option value="esewa">eSewa</option>
                                            <option value="khalti">Khalti</option>
                                            <option value="bank_transfer">Bank Transfer</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Account Name</label>
                                        <input
                                            type="text"
                                            value={currentMethod.account_name || ''}
                                            onChange={e => setCurrentMethod(prev => ({ ...prev, account_name: e.target.value }))}
                                            className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border focus:ring-2 focus:ring-primary/50 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Account Number</label>
                                        <input
                                            type="text"
                                            value={currentMethod.account_number || ''}
                                            onChange={e => setCurrentMethod(prev => ({ ...prev, account_number: e.target.value }))}
                                            className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border focus:ring-2 focus:ring-primary/50 outline-none"
                                        />
                                    </div>

                                    {currentMethod.type === 'bank_transfer' && (
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Bank Name</label>
                                            <input
                                                type="text"
                                                value={currentMethod.bank_name || ''}
                                                onChange={e => setCurrentMethod(prev => ({ ...prev, bank_name: e.target.value }))}
                                                className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border focus:ring-2 focus:ring-primary/50 outline-none"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">QR Code Image</label>
                                        <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:bg-secondary/30 transition-colors">
                                            {currentMethod.qr_image_url ? (
                                                <div className="relative aspect-square w-full max-w-[200px] mx-auto mb-2">
                                                    <Image
                                                        src={currentMethod.qr_image_url}
                                                        alt="QR Code"
                                                        fill
                                                        className="object-contain rounded-lg"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="py-8 text-muted-foreground">
                                                    <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                    <span className="text-sm">Click to upload QR</span>
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                            />
                                            {uploading && <p className="text-xs text-primary mt-2">Uploading...</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Instructions</label>
                                        <textarea
                                            rows={4}
                                            value={currentMethod.instructions || ''}
                                            onChange={e => setCurrentMethod(prev => ({ ...prev, instructions: e.target.value }))}
                                            className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                                            placeholder="Add payment instructions..."
                                        />
                                    </div>

                                    <div className="flex items-center gap-2 pt-4">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={currentMethod.is_active}
                                            onChange={e => setCurrentMethod(prev => ({ ...prev, is_active: e.target.checked }))}
                                            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                                        />
                                        <label htmlFor="is_active" className="text-sm font-medium">Active Payment Method</label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-border">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 rounded-lg hover:bg-secondary transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                                >
                                    Save Method
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {methods.map((method) => (
                    <div key={method.id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm group hover:shadow-md transition-all">
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${method.type === 'esewa' ? 'bg-green-500/10 text-green-500' :
                                    method.type === 'khalti' ? 'bg-purple-500/10 text-purple-500' :
                                        'bg-blue-500/10 text-blue-500'
                                    }`}>
                                    {method.type}
                                </span>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => {
                                            setCurrentMethod(method)
                                            setIsEditing(true)
                                        }}
                                        className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => deleteMethod(method.id)}
                                        className="p-1.5 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                                {method.qr_image_url ? (
                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-border bg-white flex-shrink-0">
                                        <Image src={method.qr_image_url} alt={method.name} fill className="object-contain" />
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 rounded-lg border border-border bg-secondary flex items-center justify-center flex-shrink-0">
                                        <span className="text-xs text-muted-foreground">No QR</span>
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-bold text-lg">{method.name}</h3>
                                    {method.account_number && (
                                        <p className="text-sm text-muted-foreground font-mono">{method.account_number}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-2">
                                {method.is_active ? (
                                    <span className="flex items-center gap-1.5 text-xs text-green-500 bg-green-500/5 px-2 py-1 rounded-full">
                                        <Eye className="w-3 h-3" /> Active
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                                        <EyeOff className="w-3 h-3" /> Inactive
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
