'use client';

import { useState, FormEvent } from 'react';
import { Loader2, CheckCircle2, Send, Mail, Phone, Globe, DollarSign, Briefcase, User, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BookDemoFormProps {
    onSuccess?: () => void;
    className?: string;
}

const SERVICE_OPTIONS = [
    'Website Design & Development',
    'Custom CMS Website',
    'eCommerce Website',
    'Custom Web Application',
    'Mobile Applications',
    'Search Engine Optimisation (SEO)',
    'Social Media Marketing',
    'Website Maintenance',
    'Branding',
    'Web Hosting',
    'Others'
];

const BUDGET_RANGES = [
    'NPR 50,000/- to NPR 90,000/-',
    'NPR 1,00,000/- to NPR 3,00,000/-',
    'NPR 3,00,000/- to NPR 5,00,000/-',
    'NPR 5,00,000/- to NPR 10,00,000/-',
    'Above NPR 10,00,000/-',
    'Undisclosed'
];

export function BookDemoForm({ onSuccess, className = '' }: BookDemoFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        contactMethod: 'email' as 'email' | 'phone',
        services: [] as string[],
        budget: '',
        website: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Basic validation
        if (formData.services.length === 0) {
            setError('Please select at least one service.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    services: formData.services,
                    contact_method: formData.contactMethod,
                    subject: `Demo Request: ${formData.company || formData.name}`
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSubmitted(true);
                // Reset form
                setFormData({
                    name: '',
                    company: '',
                    email: '',
                    phone: '',
                    contactMethod: 'email',
                    services: [],
                    budget: '',
                    website: '',
                    message: ''
                });
                if (onSuccess) {
                    setTimeout(() => onSuccess(), 2000);
                }
            } else {
                setError(data.error || 'Failed to submit request.');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleServiceChange = (service: string) => {
        setFormData(prev => {
            const services = prev.services.includes(service)
                ? prev.services.filter(s => s !== service)
                : [...prev.services, service];
            return { ...prev, services };
        });
    };

    if (submitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`text-center py-16 px-6 bg-card border border-border rounded-xl shadow-sm ${className}`}
            >
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <CheckCircle2 className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">Request Received!</h3>
                <p className="text-muted-foreground text-lg max-w-md mx-auto">
                    Thanks for your interest. We'll be in touch shortly to schedule your demo.
                </p>
                <button
                    onClick={() => setSubmitted(false)}
                    className="mt-8 text-primary font-medium hover:underline"
                >
                    Send another request
                </button>
            </motion.div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={`space-y-8 ${className}`}>
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 rounded-xl text-sm font-medium flex items-center gap-2"
                >
                    <div className="w-1 h-1 rounded-full bg-current" />
                    {error}
                </motion.div>
            )}

            {/* Personal Details Section */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                    About You
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5 group">
                        <label htmlFor="name" className="text-sm font-medium text-foreground ml-1">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <User className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                required
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 bg-secondary/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-background outline-none transition-all placeholder:text-muted-foreground/50"
                                placeholder="Your Name"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5 group">
                        <label htmlFor="company" className="text-sm font-medium text-foreground ml-1">
                            Company Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Building2 className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                required
                                type="text"
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 bg-secondary/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-background outline-none transition-all placeholder:text-muted-foreground/50"
                                placeholder="Company Ltd."
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5 group">
                        <label htmlFor="email" className="text-sm font-medium text-foreground ml-1">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                required
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 bg-secondary/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-background outline-none transition-all placeholder:text-muted-foreground/50"
                                placeholder="name@company.com"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5 group">
                        <label htmlFor="phone" className="text-sm font-medium text-foreground ml-1">
                            Phone Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                required
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 bg-secondary/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-background outline-none transition-all placeholder:text-muted-foreground/50"
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-2">
                    <label className="text-sm font-medium text-foreground ml-1 mb-2 block">
                        Preferred Contact Method <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <div
                            onClick={() => setFormData(prev => ({ ...prev, contactMethod: 'email' }))}
                            className={`cursor-pointer border rounded-xl p-3 flex items-center justify-center gap-2 transition-all ${formData.contactMethod === 'email'
                                ? 'bg-primary/5 border-primary text-primary'
                                : 'bg-secondary/30 border-border hover:border-primary/50 text-muted-foreground'
                                }`}
                        >
                            <Mail className="h-4 w-4" />
                            <span className="font-medium text-sm">Email</span>
                        </div>
                        <div
                            onClick={() => setFormData(prev => ({ ...prev, contactMethod: 'phone' }))}
                            className={`cursor-pointer border rounded-xl p-3 flex items-center justify-center gap-2 transition-all ${formData.contactMethod === 'phone'
                                ? 'bg-primary/5 border-primary text-primary'
                                : 'bg-secondary/30 border-border hover:border-primary/50 text-muted-foreground'
                                }`}
                        >
                            <Phone className="h-4 w-4" />
                            <span className="font-medium text-sm">Phone Call</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-px bg-border/50" />

            {/* Project Details Section */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                    Project Details
                </h3>

                <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground ml-1 block">
                        Interested Services <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {SERVICE_OPTIONS.map((service) => (
                            <div
                                key={service}
                                onClick={() => handleServiceChange(service)}
                                className={`cursor-pointer border rounded-lg px-4 py-3 flex items-center gap-3 transition-all ${formData.services.includes(service)
                                    ? 'bg-primary border-primary text-primary-foreground shadow-sm'
                                    : 'bg-secondary/30 border-border hover:border-primary/50 text-muted-foreground hover:bg-secondary/50'
                                    }`}
                            >
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${formData.services.includes(service)
                                    ? 'bg-white border-white text-primary'
                                    : 'border-muted-foreground/50'
                                    }`}>
                                    {formData.services.includes(service) && <CheckCircle2 className="h-3 w-3" />}
                                </div>
                                <span className="text-sm font-medium">{service}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                    <div className="space-y-1.5 group">
                        <label htmlFor="budget" className="text-sm font-medium text-foreground ml-1">
                            Estimated Budget <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <DollarSign className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <select
                                required
                                name="budget"
                                value={formData.budget}
                                onChange={handleChange}
                                className="w-full pl-10 pr-10 py-3 bg-secondary/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-background outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option value="" disabled>Select Range</option>
                                {BUDGET_RANGES.map(range => (
                                    <option key={range} value={range}>{range}</option>
                                ))}
                            </select>
                            <div className="absolute right-3.5 top-3.5 pointer-events-none">
                                <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-1.5 group">
                        <label htmlFor="website" className="text-sm font-medium text-foreground ml-1">
                            Current Website
                        </label>
                        <div className="relative">
                            <Globe className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 bg-secondary/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-background outline-none transition-all placeholder:text-muted-foreground/50"
                                placeholder="www.example.com"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-1.5 pt-2">
                    <label htmlFor="message" className="text-sm font-medium text-foreground ml-1">
                        Project Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        required
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-3 bg-secondary/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-background outline-none transition-all resize-none placeholder:text-muted-foreground/50"
                        placeholder="Tell us about your goals, target audience, and main requirements..."
                    />
                </div>
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 px-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-bold text-lg rounded-xl transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                >
                    {loading ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                        <>
                            Submit Demo Request
                            <Send className="h-5 w-5" />
                        </>
                    )}
                </button>
                <p className="text-xs text-center text-muted-foreground mt-4">
                    By submitting this form, you agree to our privacy policy. We'll never share your data.
                </p>
            </div>
        </form>
    );
}
