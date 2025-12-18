'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, ArrowRight, Check, CreditCard, User, FileText, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { notify } from '@/components/ui/notify'
import Link from 'next/link'
import { Suspense } from 'react'

// Types
interface Course {
    id: string
    title: string
    price: number
    currency: string
    slug: string
}

interface EnrollmentData {
    fullName: string
    email: string
    mobile: string
    address: string
    collegeName: string
    paymentMethod: string
    remarks: string
}

const STEPS = [
    { id: 1, title: 'Enroll Form', icon: User },
    { id: 2, title: 'Payment Method', icon: CreditCard },
    { id: 3, title: 'Review Details', icon: FileText },
]

function EnrollContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const courseSlug = searchParams.get('course_slug')
    const supabase = createClient()

    const [currentStep, setCurrentStep] = useState(1)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
    const [availableCourses, setAvailableCourses] = useState<Course[]>([])

    // Form Data
    const [formData, setFormData] = useState<EnrollmentData>({
        fullName: '',
        email: '',
        mobile: '',
        address: '',
        collegeName: '',
        paymentMethod: '',
        remarks: ''
    })

    // Fetch initial data
    useEffect(() => {
        const init = async () => {
            // Fetch courses
            const { data: courses } = await supabase
                .from('courses')
                .select('id, title, price, currency, slug')
                .eq('is_published', true)
                .order('title')

            if (courses) {
                setAvailableCourses(courses)
                if (courseSlug) {
                    const found = courses.find(c => c.slug === courseSlug)
                    if (found) setSelectedCourse(found)
                }
            }

            // Fetch user profile if logged in
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                if (profile) {
                    setFormData(prev => ({
                        ...prev,
                        fullName: profile.display_name || '',
                        email: user.email || '',
                        mobile: profile.phone || '',
                    }))
                }
            }

            setLoading(false)
        }
        init()
    }, [courseSlug, supabase])

    const handleNext = () => {
        if (currentStep === 1) {
            if (!selectedCourse || !formData.fullName || !formData.email || !formData.mobile || !formData.address) {
                notify.error('Please fill in all required fields')
                return
            }
        } else if (currentStep === 2) {
            // Payment validation is optional based on design, but ensuring method is selected is good
            if (!formData.paymentMethod) {
                // For now allowed to skip or we can enforce it. The screenshot shows radio buttons.
            }
        }
        setCurrentStep(prev => prev + 1)
    }

    const handleBack = () => {
        setCurrentStep(prev => prev - 1)
    }

    const [showSuccess, setShowSuccess] = useState(false)

    const handleSubmit = async () => {
        if (!selectedCourse) return
        setSubmitting(true)

        try {
            const response = await fetch('/api/enroll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: selectedCourse.id,
                    ...formData
                })
            })

            const result = await response.json()

            if (!response.ok) throw new Error(result.error || 'Enrollment failed')

            // Success!!
            setShowSuccess(true)
        } catch (error: any) {
            notify.error(error.message)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div></div>

    if (showSuccess) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center animate-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Enrollment Successful!</h2>
                    <p className="text-slate-600 mb-8">
                        Thank you for enrolling in <strong>{selectedCourse?.title}</strong>.
                        Your request has been received and we will contact you shortly.
                    </p>
                    <div className="space-y-3">
                        <Button
                            onClick={() => router.push('/')}
                            className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg"
                        >
                            Return to Home
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/dashboard')}
                            className="w-full text-slate-500 hover:text-slate-700"
                        >
                            Go to Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar Steps */}
            <div className="hidden lg:flex flex-col w-80 bg-white border-r border-slate-200 p-8 fixed h-full">
                <div className="mb-10">
                    <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-blue-900">
                        {/* Replace with your Logo */}
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">R</div>
                        Rusha
                    </Link>
                </div>

                <div className="space-y-8 relative">
                    {/* Vertical Line */}
                    <div className="absolute left-3.5 top-0 bottom-0 w-0.5 bg-slate-200 -z-10" />

                    {STEPS.map((step, index) => {
                        const isCompleted = currentStep > step.id
                        const isCurrent = currentStep === step.id
                        const Icon = step.icon

                        return (
                            <div key={step.id} className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${isCompleted ? 'bg-blue-600 text-white' :
                                    isCurrent ? 'bg-blue-600 text-white' :
                                        'bg-slate-100 text-slate-400 border border-slate-200'
                                    }`}>
                                    {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                                </div>
                                <div>
                                    <p className={`font-medium ${isCurrent ? 'text-blue-600' : 'text-slate-600'}`}>
                                        {step.title}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 lg:ml-80">
                <div className="max-w-3xl mx-auto p-6 py-12">
                    <div className="mb-8">
                        <p className="text-sm font-medium text-slate-500 mb-1">Step {currentStep}: {STEPS[currentStep - 1].title}</p>
                        <h1 className="text-3xl font-bold text-slate-900">
                            {currentStep === 1 && 'Enroll Now'}
                            {currentStep === 2 && 'Select Payment Method'}
                            {currentStep === 3 && 'Verify your details'}
                        </h1>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">

                        {/* Step 1: Personal Details */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <p className="text-slate-600 mb-6">Please fill out the form below and get enrolled now! All fields marked with * are required.</p>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Course <span className="text-red-500">*</span></label>
                                    <select
                                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        value={selectedCourse?.id || ''}
                                        onChange={(e) => setSelectedCourse(availableCourses.find(c => c.id === e.target.value) || null)}
                                    >
                                        <option value="">Choose a Course...</option>
                                        {availableCourses.map(course => (
                                            <option key={course.id} value={course.id}>{course.title} ({course.currency} {course.price})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            placeholder="Your full name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Email <span className="text-red-500">*</span></label>
                                        <input
                                            type="email"
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Mobile <span className="text-red-500">*</span></label>
                                        <input
                                            type="tel"
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.mobile}
                                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                            placeholder="98XXXXXXXX"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Address <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            placeholder="City, District"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">College Name</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.collegeName}
                                        onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                                        placeholder="Your college or institution"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 2: Payment Method */}
                        {currentStep === 2 && (
                            <div className="space-y-8">
                                <p className="text-slate-600">Select your preferred payment method to proceed with your payment.</p>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-4">Select an online payment option</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {['eSewa', 'Khalti', 'ConnectIPS', 'IME Pay'].map((method) => (
                                            <div
                                                key={method}
                                                className={`cursor-pointer rounded-xl border-2 p-4 flex items-center justify-center transition-all ${formData.paymentMethod === method ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-blue-300'
                                                    }`}
                                                onClick={() => setFormData({ ...formData, paymentMethod: method })}
                                            >
                                                <span className="font-semibold text-slate-700">{method}</span>
                                                {/* You can add logos here later */}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-4">Amount <span className="text-red-500">*</span></label>
                                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                                        <p className="text-2xl font-bold text-slate-900">
                                            {selectedCourse?.currency} {selectedCourse?.price.toLocaleString()}
                                        </p>
                                        <p className="text-sm text-slate-500 mt-1">Total amount for {selectedCourse?.title}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Remarks</label>
                                    <textarea
                                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none"
                                        value={formData.remarks}
                                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                        placeholder="Any additional notes..."
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 3: Review */}
                        {currentStep === 3 && (
                            <div className="space-y-8">
                                <p className="text-slate-600">Check and verify your details before submitting your admission request.</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-slate-900 border-b pb-2">Admission Details</h3>
                                        <div className="grid grid-cols-[120px_1fr] gap-y-4 text-sm">
                                            <span className="text-slate-500">Full Name</span>
                                            <span className="font-medium text-slate-900">{formData.fullName}</span>

                                            <span className="text-slate-500">Email</span>
                                            <span className="font-medium text-slate-900">{formData.email}</span>

                                            <span className="text-slate-500">Mobile</span>
                                            <span className="font-medium text-slate-900">{formData.mobile}</span>

                                            <span className="text-slate-500">Address</span>
                                            <span className="font-medium text-slate-900">{formData.address}</span>

                                            <span className="text-slate-500">College</span>
                                            <span className="font-medium text-slate-900">{formData.collegeName || '-'}</span>

                                            <span className="text-slate-500">Course</span>
                                            <span className="font-medium text-slate-900">{selectedCourse?.title}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-slate-900 border-b pb-2">Payment</h3>
                                        <div className="grid grid-cols-[120px_1fr] gap-y-4 text-sm">
                                            <span className="text-slate-500">Amount</span>
                                            <span className="font-medium text-slate-900">{selectedCourse?.currency} {selectedCourse?.price.toLocaleString()}</span>

                                            <span className="text-slate-500">Method</span>
                                            <span className="font-medium text-slate-900 capitalize">{formData.paymentMethod || 'Pay Later'}</span>

                                            <span className="text-slate-500">Remarks</span>
                                            <span className="font-medium text-slate-900">{formData.remarks || '-'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm">
                                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <p>By clicking "Complete Payment", you agree to our Terms & Conditions and understand that this enrollment is subject to approval.</p>
                                </div>
                            </div>
                        )}

                        <div className="mt-10 flex items-center justify-between pt-6 border-t border-slate-100">
                            {currentStep > 1 ? (
                                <Button
                                    variant="secondary"
                                    onClick={handleBack}
                                    className="gap-2"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </Button>
                            ) : <div></div>}

                            {currentStep < 3 ? (
                                <Button
                                    onClick={handleNext}
                                    className="bg-blue-600 hover:bg-blue-700 gap-2 px-8"
                                >
                                    Continue <ArrowRight className="w-4 h-4" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="bg-blue-600 hover:bg-blue-700 gap-2 px-8"
                                >
                                    {submitting ? 'Processing...' : 'Complete Payment'}
                                    {!submitting && <ArrowRight className="w-4 h-4" />}
                                </Button>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default function EnrollPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div></div>}>
            <EnrollContent />
        </Suspense>
    )
}
