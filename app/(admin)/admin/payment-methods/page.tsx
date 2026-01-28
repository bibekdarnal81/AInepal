'use client'

import React, { useEffect, useState } from 'react'
import { Plus, Loader2, CreditCard, X, ToggleLeft, ToggleRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ThumbnailUpload from '@/components/thumbnail-upload'

interface PaymentMethod {
    id: string; name: string; type: string; qrImageUrl?: string; accountName: string
    accountNumber: string; bankName?: string; instructions?: string; isActive: boolean
}

const initialForm = { name: '', type: 'esewa', qrImageUrl: '', accountName: '', accountNumber: '', bankName: '', instructions: '', isActive: true }

export default function AdminPaymentMethodsPage() {
    const [methods, setMethods] = useState<PaymentMethod[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState(initialForm)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState<string | null>(null)
    const [apiModalOpen, setApiModalOpen] = useState(false)
    const [apiConfig, setApiConfig] = useState({ merchantId: '', secret: '', environment: 'test', enabled: false })
    const [apiSaving, setApiSaving] = useState(false)

    const fetchData = async () => {
        setLoading(true)
        try {
            const [methodsRes, configRes] = await Promise.all([
                fetch('/api/admin/payment-methods'),
                fetch('/api/admin/payment-config')
            ])

            if (methodsRes.ok) {
                const data = await methodsRes.json()
                setMethods(data.paymentMethods)
            }

            if (configRes.ok) {
                const data = await configRes.json()
                if (data.payment) setApiConfig(data.payment)
            }
        }
        catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    useEffect(() => { fetchData() }, [])

    const openCreate = () => { setFormData(initialForm); setIsEditing(false); setEditingId(null); setIsModalOpen(true) }
    const openEdit = (m: PaymentMethod) => { setFormData({ name: m.name, type: m.type, qrImageUrl: m.qrImageUrl || '', accountName: m.accountName, accountNumber: m.accountNumber, bankName: m.bankName || '', instructions: m.instructions || '', isActive: m.isActive }); setIsEditing(true); setEditingId(m.id); setIsModalOpen(true) }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true)
        try {
            const payload = { ...(isEditing && { id: editingId }), ...formData }
            const res = await fetch('/api/admin/payment-methods', { method: isEditing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
            if (res.ok) { setIsModalOpen(false); fetchData() } else { const d = await res.json(); alert(d.error) }
        } catch (e) { console.error(e) }
        finally { setSaving(false) }
    }

    const handleApiSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setApiSaving(true)
        try {
            const res = await fetch('/api/admin/payment-config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(apiConfig) })
            if (res.ok) { setApiModalOpen(false); fetchData(); alert('API Configuration Saved') } else { const d = await res.json(); alert(d.error) }
        } catch (e) { console.error(e) }
        finally { setApiSaving(false) }
    }

    const handleDelete = async (id: string) => { if (!confirm('Delete?')) return; setDeleting(id); try { await fetch(`/api/admin/payment-methods?id=${id}`, { method: 'DELETE' }); fetchData() } catch (e) { console.error(e) } finally { setDeleting(null) } }

    const toggleActive = async (id: string, isActive: boolean) => { try { await fetch('/api/admin/payment-methods', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, isActive: !isActive }) }); fetchData() } catch (e) { console.error(e) } }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div><h1 className="text-3xl font-bold">Payment Methods</h1><p className="text-muted-foreground mt-1">Manage payment options</p></div>
                <div className="flex gap-3">
                    <button onClick={() => setApiModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/90 border border-border">Configure API</button>
                    <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"><Plus className="h-4 w-4" /> Add Method</button>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
                {loading ? <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : methods.length === 0 ? (
                    <div className="flex flex-col items-center py-20"><CreditCard className="h-12 w-12 text-muted-foreground mb-4" /><h3 className="text-lg font-medium">No payment methods</h3><button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg mt-4"><Plus className="h-4 w-4" /> Add</button></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                        {methods.map(m => (
                            <div key={m.id} className={`bg-secondary/20 border rounded-lg p-4 ${m.isActive ? 'border-primary/50' : 'border-border opacity-60'}`}>
                                <div className="flex items-start justify-between mb-3">
                                    <div><h3 className="font-medium">{m.name}</h3><span className="text-xs text-muted-foreground capitalize">{m.type.replace('_', ' ')}</span></div>
                                    <button onClick={() => toggleActive(m.id, m.isActive)} className={m.isActive ? 'text-primary' : 'text-muted-foreground'}>{m.isActive ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6" />}</button>
                                </div>
                                <div className="text-sm space-y-1 mb-4">
                                    <p><span className="text-muted-foreground">Account:</span> {m.accountName}</p>
                                    <p><span className="text-muted-foreground">Number:</span> {m.accountNumber}</p>
                                    {m.bankName && <p><span className="text-muted-foreground">Bank:</span> {m.bankName}</p>}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openEdit(m)} className="flex-1 px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-lg text-sm">Edit</button>
                                    <button onClick={() => handleDelete(m.id)} disabled={deleting === m.id} className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm">{deleting === m.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <AnimatePresence>{isModalOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()} className="bg-card border border-border rounded-xl shadow-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-border"><h2 className="text-xl font-semibold">{isEditing ? 'Edit' : 'Add New'} Payment Method</h2><button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-secondary rounded-lg"><X className="h-5 w-5" /></button></div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-4">
                                    <div><label className="block text-sm font-medium mb-1.5 text-muted-foreground">Method Name</label><input type="text" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} required placeholder="e.g. eSewa" className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg outline-none focus:border-primary/50" /></div>
                                    <div><label className="block text-sm font-medium mb-1.5 text-muted-foreground">Type</label><select value={formData.type} onChange={e => setFormData(p => ({ ...p, type: e.target.value }))} className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg outline-none focus:border-primary/50"><option value="esewa">eSewa</option><option value="khalti">Khalti</option><option value="bank_transfer">Bank Transfer</option></select></div>
                                    <div><label className="block text-sm font-medium mb-1.5 text-muted-foreground">Account Name</label><input type="text" value={formData.accountName} onChange={e => setFormData(p => ({ ...p, accountName: e.target.value }))} required className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg outline-none focus:border-primary/50" /></div>
                                    <div><label className="block text-sm font-medium mb-1.5 text-muted-foreground">Account Number</label><input type="text" value={formData.accountNumber} onChange={e => setFormData(p => ({ ...p, accountNumber: e.target.value }))} required className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg outline-none focus:border-primary/50" /></div>
                                    <div><label className="block text-sm font-medium mb-1.5 text-muted-foreground">Bank Name</label><input type="text" value={formData.bankName} onChange={e => setFormData(p => ({ ...p, bankName: e.target.value }))} className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg outline-none focus:border-primary/50" /></div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <ThumbnailUpload
                                            currentUrl={formData.qrImageUrl}
                                            onUploadComplete={url => setFormData(p => ({ ...p, qrImageUrl: url }))}
                                            label="QR Code Image"
                                            description="Click to upload QR"
                                        />
                                    </div>
                                    <div><label className="block text-sm font-medium mb-1.5 text-muted-foreground">Instructions</label><textarea value={formData.instructions} onChange={e => setFormData(p => ({ ...p, instructions: e.target.value }))} rows={4} placeholder="Add payment instructions..." className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg resize-none outline-none focus:border-primary/50" /></div>
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={formData.isActive} onChange={e => setFormData(p => ({ ...p, isActive: e.target.checked }))} className="h-4 w-4 bg-primary rounded border-border" /><span className="text-sm font-medium">Active Payment Method</span></label>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-6 border-t border-border">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-foreground font-medium hover:bg-secondary rounded-lg transition-colors">Cancel</button>
                                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-8 py-2 bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50">
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                    {isEditing ? 'Save Changes' : 'Save Method'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}</AnimatePresence>

            <AnimatePresence>{apiModalOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setApiModalOpen(false)}>
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()} className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md max-h-[95vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-border"><h2 className="text-xl font-semibold">eSewa API Configuration</h2><button onClick={() => setApiModalOpen(false)} className="p-2 hover:bg-secondary rounded-lg"><X className="h-5 w-5" /></button></div>
                        <form onSubmit={handleApiSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Environment</label>
                                <select value={apiConfig.environment} onChange={e => setApiConfig(p => ({ ...p, environment: e.target.value }))} className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg outline-none focus:border-primary/50">
                                    <option value="test">Test Mode (Sandbox)</option>
                                    <option value="live">Live Mode</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Merchant ID (Scd)</label>
                                <input type="text" value={apiConfig.merchantId} onChange={e => setApiConfig(p => ({ ...p, merchantId: e.target.value.trim() }))} placeholder="e.g. EPAYTEST" className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg outline-none focus:border-primary/50" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Secret Key / Signature</label>
                                <input type="password" value={apiConfig.secret} onChange={e => setApiConfig(p => ({ ...p, secret: e.target.value.trim() }))} placeholder="Enter secret key if applicable" className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg outline-none focus:border-primary/50" />
                                <p className="text-xs text-muted-foreground mt-1">Leave empty if using standard eSewa (only needed for hashing)</p>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer p-4 border border-border rounded-lg bg-secondary/20">
                                <input type="checkbox" checked={apiConfig.enabled} onChange={e => setApiConfig(p => ({ ...p, enabled: e.target.checked }))} className="h-4 w-4 bg-primary rounded border-border" />
                                <span className="text-sm font-medium">Enable eSewa API Integration</span>
                            </label>

                            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-4">
                                <button type="button" onClick={() => setApiModalOpen(false)} className="px-4 py-2 text-foreground font-medium hover:bg-secondary rounded-lg">Cancel</button>
                                <button type="submit" disabled={apiSaving} className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50">
                                    {apiSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                    Save Config
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}</AnimatePresence>
        </div>
    )
}
