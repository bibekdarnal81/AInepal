'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Check, Upload, CreditCard, Loader2, ArrowRight } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

interface PaymentMethod {
    id: string
    name: string
    type: 'esewa' | 'khalti' | 'bank_transfer'
    qr_image_url: string
    account_name: string
    account_number: string
    bank_name: string
    instructions: string
}

interface ItemDetails {
    id: string
    name: string
    price: number
    currency?: string
    description?: string
}

export default function GenericCheckoutPage() {
    const params = useParams()
    const router = useRouter()
    const searchParams = useSearchParams()

    // Params: type (hosting, services, projects, domains) and id
    const { type, id } = params as { type: string, id: string }

    const billingParam = searchParams.get('billing') // Only for hosting usually

    // State
    const [item, setItem] = useState<ItemDetails | null>(null)
    const [methods, setMethods] = useState<PaymentMethod[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [uploading, setUploading] = useState(false)

    // Form Selection
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(
        (billingParam === 'monthly' || billingParam === 'yearly') ? billingParam : 'yearly'
    )
    const [selectedMethod, setSelectedMethod] = useState<string>('')
    const [receiptUrl, setReceiptUrl] = useState<string>('')
    const [transactionId, setTransactionId] = useState('')

    // Additional fields for Domain/Service
    const [domainName, setDomainName] = useState('')
    const [years, setYears] = useState(1)
    const [requirements, setRequirements] = useState('')
    const [enrollFullName, setEnrollFullName] = useState('')
    const [enrollEmail, setEnrollEmail] = useState('')
    const [enrollMobile, setEnrollMobile] = useState('')
    const [enrollAddress, setEnrollAddress] = useState('')
    const [enrollCollegeName, setEnrollCollegeName] = useState('')
    const [enrollOtherCourse, setEnrollOtherCourse] = useState('')
    const [enrollRemarks, setEnrollRemarks] = useState('')

    const supabase = createClient()

    useEffect(() => {
        loadData()
    }, [type, id])

    const loadData = async () => {
        setLoading(true)
        try {
            // Fetch Payment Methods
            const { data: methodsData } = await supabase
                .from('payment_methods')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: true })

            if (methodsData) setMethods(methodsData as any)

            // Fetch Item Details based on type
            let itemData: any = null

            if (type === 'hosting') {
                const { data } = await supabase.from('hosting_plans').select('*').eq('slug', id).single()
                if (data) itemData = {
                    id: data.id,
                    name: data.name,
                    price: data.price,
                    price_yearly: data.price_yearly,
                    description: `${data.storage_gb}GB Storage, ${data.bandwidth_text} Bandwidth`
                }
            } else if (type === 'services') {
                const { data } = await supabase.from('services').select('*').eq('id', id).single()
                if (data) itemData = { id: data.id, name: data.title, price: data.price, currency: data.currency }
            } else if (type === 'projects') {
                const { data } = await supabase.from('projects').select('*').eq('slug', id).single()
                if (data) itemData = { id: data.id, name: data.title, price: data.price || 0, currency: data.currency || 'NPR' }
            } else if (type === 'domains') {
                // For domains logic...
                const domain = searchParams.get('domain')
                if (domain) {
                    itemData = { id: 'new-domain', name: domain, price: 1500, currency: 'NPR', description: 'Domain Registration' }
                    setDomainName(domain)
                } else {
                    const { data } = await supabase.from('domains').select('*').eq('id', id).single()
                    if (data) itemData = { id: data.id, name: data.domain_name, price: data.price }
                }
            } else if (type === 'bundles') {
                const { data } = await supabase.from('bundle_offers').select('*').eq('id', id).single()
                if (data) {
                    itemData = {
                        id: data.id,
                        name: data.name,
                        price: data.price,
                        currency: 'NPR',
                        description: `Bundle Offer: ${data.name}`
                    }
                }
            } else if (type === 'classes') {
                const { data } = await supabase.from('classes').select('*').eq('slug', id).single()
                if (data) {
                    itemData = {
                        id: data.id,
                        name: data.title,
                        price: data.price || 0,
                        currency: data.currency || 'NPR',
                        description: data.summary || ''
                    }
                }
            }

            setItem(itemData)
        } catch (error) {
            console.error('Error loading checkout data', error)
        } finally {
            setLoading(false)
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return

        setUploading(true)
        const file = e.target.files[0]
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('folder', 'payment-proofs')

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (!response.ok) throw new Error(result.error)

            setReceiptUrl(result.url)
        } catch (error) {
            alert('Error uploading receipt: ' + (error as any).message)
        } finally {
            setUploading(false)
        }
    }

    const calculateTotal = () => {
        if (!item) return 0
        if (type === 'hosting' && billingCycle === 'yearly') {
            return (item as any).price_yearly || (item.price * 10)
        }
        if (type === 'domains') {
            return item.price * (years || 1)
        }
        return item.price
    }

    const handleCheckout = async () => {
        if (!item || !selectedMethod || !receiptUrl) return
        if (type === 'classes') {
            if (!enrollFullName.trim() || !enrollEmail.trim() || !enrollMobile.trim() || !enrollAddress.trim()) {
                alert('Please fill in all required enrollment fields.')
                return
            }
        }

        setSubmitting(true)

        try {
            const payload = {
                type,
                itemId: item.id,
                itemName: item.name,
                amount: calculateTotal(),
                paymentMethodId: selectedMethod,
                paymentProofUrl: receiptUrl,
                transactionId,
                // Type specific
                billingCycle: type === 'hosting' ? billingCycle : undefined,
                domainName: type === 'domains' ? (domainName || item.name) : domainName, // for hosting too
                years: type === 'domains' ? years : undefined,
                requirements: type === 'services' ? requirements : undefined,
                enroll: type === 'classes' ? {
                    fullName: enrollFullName.trim(),
                    email: enrollEmail.trim(),
                    mobile: enrollMobile.trim(),
                    address: enrollAddress.trim(),
                    collegeName: enrollCollegeName.trim(),
                    otherCourse: enrollOtherCourse.trim(),
                    remarks: enrollRemarks.trim()
                } : undefined
            }

            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            const result = await response.json()

            if (!response.ok) throw new Error(result.error)

            // Redirect to success
            router.push(`/profile?tab=orders&new_order=true`)

        } catch (error) {
            alert('Checkout failed: ' + (error as any).message)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    )

    if (!item) return (
        <div className="min-h-screen bg-background text-primary flex items-center justify-center flex-col gap-4">
            <h1 className="text-2xl font-bold">Item not found</h1>
            <p className="text-muted">The requested item could not be found or is not available.</p>
            <div className="flex gap-4">
                <button onClick={() => router.back()} className="text-primary hover:underline">Go Back</button>
            </div>
        </div>
    )

    const totalAmount = calculateTotal()
    const selectedMethodDetails = methods.find(m => m.id === selectedMethod)
    const isEnrollmentValid = type !== 'classes' || (
        enrollFullName.trim() &&
        enrollEmail.trim() &&
        enrollMobile.trim() &&
        enrollAddress.trim()
    )

    return (
        <div className="min-h-screen bg-background text-primary font-sans">
            <Header />
            <div className="pt-24 pb-20 px-4">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-12">

                    {/* Left Column: Checkout Form */}
                    <div className="lg:col-span-2 space-y-10">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4 uppercase tracking-wider">
                                Checkout
                            </div>
                            <h1 className="text-3xl font-bold mb-2">Complete Your Order</h1>
                            <p className="text-muted">You are purchasing <strong className="text-primary">{item.name}</strong></p>
                        </div>

                        {/* Configuration Section (Type Specific) */}
                        {type === 'hosting' && (
                            <section className="space-y-4">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                                    Billing Cycle
                                </h2>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setBillingCycle('monthly')}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${billingCycle === 'monthly' ? 'border-blue-600 bg-blue-600/10' : 'border-border hover:border-primary/40'
                                            }`}
                                    >
                                        <div className="font-semibold mb-1">Monthly</div>
                                        <div className="text-lg">रू {item.price.toLocaleString()}<span className="text-sm text-muted">/mo</span></div>
                                    </button>
                                    <button
                                        onClick={() => setBillingCycle('yearly')}
                                        className={`p-4 rounded-xl border-2 text-left transition-all relative ${billingCycle === 'yearly' ? 'border-blue-600 bg-blue-600/10' : 'border-border hover:border-primary/40'
                                            }`}
                                    >
                                        <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">SAVE</div>
                                        <div className="font-semibold mb-1">Yearly</div>
                                        <div className="text-lg">रू {((item as any).price_yearly || item.price * 10).toLocaleString()}<span className="text-sm text-muted">/yr</span></div>
                                    </button>
                                </div>
                            </section>
                        )}

                        {type === 'domains' && (
                            <section className="space-y-4">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                                    Registration Term
                                </h2>
                                <div className="flex items-center gap-4">
                                    <select
                                        value={years}
                                        onChange={(e) => setYears(parseInt(e.target.value))}
                                        className="bg-card border border-border rounded-lg px-4 py-3 outline-none focus:border-blue-500 text-primary"
                                    >
                                        {[1, 2, 3, 5, 10].map(y => (
                                            <option key={y} value={y} className="bg-card text-primary">{y} Year{y > 1 ? 's' : ''}</option>
                                        ))}
                                    </select>
                                    <p className="text-muted">Registration for <strong className="text-primary">{domainName}</strong></p>
                                </div>
                            </section>
                        )}

                        {type === 'services' && (
                            <section className="space-y-4">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                                    Project Requirements
                                </h2>
                                <textarea
                                    value={requirements}
                                    onChange={(e) => setRequirements(e.target.value)}
                                    placeholder="Please describe your requirements briefly..."
                                    className="w-full h-32 bg-card border border-border rounded-xl p-4 outline-none focus:border-blue-500 text-primary placeholder:text-muted"
                                />
                            </section>
                        )}

                        {type === 'classes' && (
                            <section className="space-y-6">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                                    Enrollment Details
                                </h2>
                                <div className="grid gap-5">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-muted">Course</label>
                                        <input
                                            type="text"
                                            value={item.name}
                                            readOnly
                                            className="w-full px-4 py-3 rounded-lg bg-card border border-border text-primary"
                                        />
                                        {item.description ? (
                                            <p className="text-xs text-muted">{item.description}</p>
                                        ) : null}
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-muted">Full Name *</label>
                                            <input
                                                type="text"
                                                value={enrollFullName}
                                                onChange={(e) => setEnrollFullName(e.target.value)}
                                                placeholder="Your Name"
                                                className="w-full px-4 py-3 rounded-lg bg-card border border-border focus:border-blue-500 outline-none text-primary placeholder:text-muted"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-muted">Email *</label>
                                            <input
                                                type="email"
                                                value={enrollEmail}
                                                onChange={(e) => setEnrollEmail(e.target.value)}
                                                placeholder="you@example.com"
                                                className="w-full px-4 py-3 rounded-lg bg-card border border-border focus:border-blue-500 outline-none text-primary placeholder:text-muted"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-muted">Mobile *</label>
                                            <input
                                                type="tel"
                                                value={enrollMobile}
                                                onChange={(e) => setEnrollMobile(e.target.value)}
                                                placeholder="+977 98XXXXXXXX"
                                                className="w-full px-4 py-3 rounded-lg bg-card border border-border focus:border-blue-500 outline-none text-primary placeholder:text-muted"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-muted">Address *</label>
                                            <input
                                                type="text"
                                                value={enrollAddress}
                                                onChange={(e) => setEnrollAddress(e.target.value)}
                                                placeholder="Your Address"
                                                className="w-full px-4 py-3 rounded-lg bg-card border border-border focus:border-blue-500 outline-none text-primary placeholder:text-muted"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-muted">College Name</label>
                                            <input
                                                type="text"
                                                value={enrollCollegeName}
                                                onChange={(e) => setEnrollCollegeName(e.target.value)}
                                                placeholder="College name"
                                                className="w-full px-4 py-3 rounded-lg bg-card border border-border focus:border-blue-500 outline-none text-primary placeholder:text-muted"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-muted">Other Course</label>
                                            <input
                                                type="text"
                                                value={enrollOtherCourse}
                                                onChange={(e) => setEnrollOtherCourse(e.target.value)}
                                                placeholder="Mention other course"
                                                className="w-full px-4 py-3 rounded-lg bg-card border border-border focus:border-blue-500 outline-none text-primary placeholder:text-muted"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-muted">Remarks</label>
                                        <textarea
                                            value={enrollRemarks}
                                            onChange={(e) => setEnrollRemarks(e.target.value)}
                                            placeholder="Anything we should know?"
                                            className="w-full h-28 bg-card border border-border rounded-xl p-4 outline-none focus:border-blue-500 text-primary placeholder:text-muted"
                                        />
                                    </div>
                                </div>
                            </section>
                        )}


                        {/* Payment Method Section */}
                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                                Select Payment Method
                            </h2>
                            <div className="grid sm:grid-cols-3 gap-4">
                                {methods.map(method => (
                                    <button
                                        key={method.id}
                                        onClick={() => setSelectedMethod(method.id)}
                                        className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center gap-3 ${selectedMethod === method.id
                                            ? 'border-blue-600 bg-blue-600/10 text-primary'
                                            : 'border-border hover:border-primary/40 text-muted hover:text-primary'
                                            }`}
                                    >
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${method.type === 'esewa' ? 'bg-green-500/20' :
                                            method.type === 'khalti' ? 'bg-purple-500/20' : 'bg-secondary'
                                            }`}>
                                            <CreditCard className={`w-6 h-6 ${method.type === 'esewa' ? 'text-green-500' :
                                                method.type === 'khalti' ? 'text-purple-500' : 'text-muted'
                                                }`} />
                                        </div>
                                        <span className="font-medium">{method.name}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Payment Details Area */}
                            {selectedMethodDetails && (
                                <div className="bg-card rounded-xl p-8 border border-border mt-6 animate-in fade-in slide-in-from-top-4">
                                    <div className="grid md:grid-cols-2 gap-8 items-center">
                                        <div className="space-y-4">
                                            <h3 className="font-bold text-lg mb-4 text-primary">Scan & Pay</h3>
                                            <div className="bg-white p-4 rounded-xl inline-block shadow-lg shadow-black/30">
                                                {selectedMethodDetails.qr_image_url ? (
                                                    <div className="relative w-48 h-48">
                                                        <Image
                                                            src={selectedMethodDetails.qr_image_url}
                                                            alt="QR Code"
                                                            fill
                                                            className="object-contain"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-48 h-48 flex items-center justify-center text-muted border-2 border-dashed border-border">
                                                        No QR
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-sm space-y-2 text-muted">
                                                <p className="flex justify-between border-b border-border pb-2">
                                                    <span className="text-muted">Account Name</span>
                                                    <span className="font-medium text-primary">{selectedMethodDetails.account_name}</span>
                                                </p>
                                                <p className="flex justify-between border-b border-border pb-2">
                                                    <span className="text-muted">Number</span>
                                                    <span className="font-medium font-mono text-primary bg-secondary px-2 rounded">{selectedMethodDetails.account_number}</span>
                                                </p>
                                                {selectedMethodDetails.bank_name && (
                                                    <p className="flex justify-between border-b border-border pb-2">
                                                        <span className="text-muted">Bank</span>
                                                        <span className="font-medium text-primary">{selectedMethodDetails.bank_name}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <h3 className="font-bold text-primary">Upload Payment Proof</h3>
                                                <p className="text-sm text-muted">Upload a screenshot of your successful payment.</p>

                                                <div className="border-2 border-dashed border-border rounded-xl h-40 flex flex-col items-center justify-center text-center hover:bg-secondary/50 hover:border-primary/30 transition-all cursor-pointer relative group">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleFileUpload}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    />
                                                    {receiptUrl ? (
                                                        <div className="flex flex-col items-center gap-2 text-green-500">
                                                            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                                                                <Check className="w-6 h-6" />
                                                            </div>
                                                            <span className="font-medium">Receipt Uploaded</span>
                                                            <span className="text-xs text-muted">Click to replace</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-3 text-muted group-hover:text-primary">
                                                            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                                                                <Upload className="w-6 h-6" />
                                                            </div>
                                                            <span>{uploading ? 'Uploading...' : 'Drop image or Click to Upload'}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-muted">Transaction ID (Optional)</label>
                                                <input
                                                    type="text"
                                                    value={transactionId}
                                                    onChange={(e) => setTransactionId(e.target.value)}
                                                    placeholder="Enter transaction ID / Ref No"
                                                    className="w-full px-4 py-3 rounded-lg bg-card border border-border focus:border-blue-500 outline-none transition-colors text-primary placeholder:text-muted"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 bg-card border border-border rounded-xl p-6 shadow-xl">
                            <h2 className="text-xl font-bold mb-6 text-primary">Order Summary</h2>

                            <div className="space-y-4 mb-6 pb-6 border-b border-border">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-semibold text-primary">{item.name}</div>
                                        <div className="text-sm text-muted capitalize">{type}</div>
                                    </div>
                                    <div className="font-bold text-primary">
                                        {item.currency === 'NPR' ? 'रू' : '$'} {totalAmount.toLocaleString()}
                                    </div>
                                </div>
                                {type === 'hosting' && (
                                    <div className="flex justify-between items-center text-sm text-muted">
                                        <span>Billing Cycle</span>
                                        <span className="capitalize">{billingCycle}</span>
                                    </div>
                                )}
                                {type === 'domains' && (
                                    <div className="flex justify-between items-center text-sm text-muted">
                                        <span>Duration</span>
                                        <span>{years} Year{years > 1 ? 's' : ''}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center text-sm text-muted">
                                    <span>Setup Fee</span>
                                    <span className="text-emerald-500">Free</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-xl font-bold mb-8">
                                <span className="text-primary">Total</span>
                                <span className="text-primary">
                                    {item.currency === 'NPR' ? 'रू' : '$'} {totalAmount.toLocaleString()}
                                </span>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={submitting || !selectedMethod || !receiptUrl || !isEnrollmentValid}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Complete Order
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>

                            <div className="mt-6 flex items-center justify-center gap-4 text-muted">
                                <ShieldCheck className="w-4 h-4" />
                                <span className="text-xs">Secure Payment</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <Footer />
        </div>
    )
}

function ShieldCheck({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}
