'use client'

import { useState, FormEvent, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, CheckCircle2, Send, Calendar } from 'lucide-react'

interface BookDemoModalProps {
    isOpen: boolean
    onClose: () => void
}

export function BookDemoModal({ isOpen, onClose }: BookDemoModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: ''
    })
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState('')

    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    subject: `Demo Request from ${formData.company || formData.name}`
                }),
            })

            const data = await response.json()

            if (response.ok) {
                setSubmitted(true)
                setFormData({ name: '', email: '', phone: '', company: '', message: '' })
                // Close modal after success message shown
                setTimeout(() => {
                    setSubmitted(false)
                    onClose()
                }, 3000)
            } else {
                setError(data.error || 'Failed to submit request.')
            }
        } catch (err) {
            setError('An error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto grid place-items-center p-4"
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-border bg-muted/40">
                                <div>
                                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                                        <Calendar className="h-6 w-6 text-primary" />
                                        Book a Demo
                                    </h2>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        See how we can help your business grow.
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-muted rounded-full transition-colors"
                                >
                                    <X className="h-5 w-5 text-muted-foreground" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6">
                                {submitted ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="py-12 text-center"
                                    >
                                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle2 className="h-8 w-8" />
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground mb-2">Request Received!</h3>
                                        <p className="text-muted-foreground">
                                            We'll be in touch shortly to schedule your demo.
                                        </p>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {error && (
                                            <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm">
                                                {error}
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label htmlFor="name" className="text-sm font-medium text-foreground">
                                                    Name <span className="text-primary">*</span>
                                                </label>
                                                <input
                                                    required
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label htmlFor="company" className="text-sm font-medium text-foreground">
                                                    Company
                                                </label>
                                                <input
                                                    type="text"
                                                    name="company"
                                                    value={formData.company}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                    placeholder="Acme Inc."
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="email" className="text-sm font-medium text-foreground">
                                                Email <span className="text-primary">*</span>
                                            </label>
                                            <input
                                                required
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                placeholder="john@example.com"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="phone" className="text-sm font-medium text-foreground">
                                                Phone
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                placeholder="+1 (555) 000-0000"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="message" className="text-sm font-medium text-foreground">
                                                What are you looking for? <span className="text-primary">*</span>
                                            </label>
                                            <textarea
                                                required
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                rows={3}
                                                className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                                                placeholder="Tell us a bit about your project..."
                                            />
                                        </div>

                                        <div className="pt-2">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                            >
                                                {loading ? (
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                ) : (
                                                    <>
                                                        Request Demo
                                                        <Send className="h-4 w-4" />
                                                    </>
                                                )}
                                            </button>
                                            <p className="text-xs text-muted-foreground text-center mt-3">
                                                We'll typically respond within 24 hours.
                                            </p>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
