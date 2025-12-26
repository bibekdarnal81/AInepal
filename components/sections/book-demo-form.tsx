'use client';

import { useState, FormEvent } from 'react';
import { Loader2, CheckCircle2, Send } from 'lucide-react';

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
    'Microsoft Products',
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
            <div className={`text-center py-8 ${className}`}>
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Request Received!</h3>
                <p className="text-muted-foreground">
                    We'll be in touch shortly to schedule your demo.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
            {error && (
                <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* Row 1: Name & Business */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-bold text-foreground">
                        Full Name (required) <span className="text-red-500">*</span>
                    </label>
                    <input
                        required
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50"
                        placeholder="Full Name"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="company" className="text-sm font-bold text-foreground">
                        Business Name (required) <span className="text-red-500">*</span>
                    </label>
                    <input
                        required
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50"
                        placeholder="Business Name"
                    />
                </div>
            </div>

            {/* Row 2: Email & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-bold text-foreground">
                        Email (required) <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-red-500 font-medium hidden">Please fill out this field.</p>
                    <input
                        required
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50"
                        placeholder="Email"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-bold text-foreground">
                        Phone/Mobile (required) <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-red-500 font-medium hidden">Please fill out this field.</p>
                    <input
                        required
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50"
                        placeholder="Phone/Mobile"
                    />
                </div>
            </div>

            {/* Contact Method */}
            <div className="space-y-3">
                <p className="text-xs text-red-500 font-medium hidden">Please fill out this field.</p>
                <label className="text-sm font-bold text-foreground block">
                    Which Contact Method Would You Prefer? (required) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="contactMethod"
                            value="email"
                            checked={formData.contactMethod === 'email'}
                            onChange={handleChange}
                            className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                        />
                        <span className="text-sm text-foreground">Email</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="contactMethod"
                            value="phone"
                            checked={formData.contactMethod === 'phone'}
                            onChange={handleChange}
                            className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                        />
                        <span className="text-sm text-foreground">Phone</span>
                    </label>
                </div>
            </div>

            {/* Services */}
            <div className="space-y-3">
                <label className="text-sm font-bold text-foreground block">
                    Select Relevant Services (required) <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {SERVICE_OPTIONS.map((service) => (
                        <label key={service} className="flex items-start gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.services.includes(service)}
                                onChange={() => handleServiceChange(service)}
                                className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                {service}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Row 3: Budget & Website */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label htmlFor="budget" className="text-sm font-bold text-foreground">
                        What is your estimated budget? (required) <span className="text-red-500">*</span>
                    </label>
                    <select
                        required
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
                    >
                        <option value="" disabled>Select Budget Range</option>
                        {BUDGET_RANGES.map(range => (
                            <option key={range} value={range}>{range}</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <label htmlFor="website" className="text-sm font-bold text-foreground">
                        What is your current or intended website address?
                    </label>
                    <input
                        type="text"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50"
                        placeholder="Website"
                    />
                </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-bold text-foreground">
                    In short, what this project is about? (required) <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-muted-foreground mb-2">
                    Sharing a realistic assessment of what you plan to spend on this project will help us scope the engagement appropriately.
                </p>
                <textarea
                    required
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none placeholder:text-muted-foreground/50"
                    placeholder="Requirements, intentions, target audience, goals etc."
                />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 px-6 bg-primary text-primary-foreground font-bold text-lg rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.01]"
                >
                    {loading ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                        <>
                            Send Request
                            <Send className="h-5 w-5" />
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
