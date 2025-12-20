'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Network, Search, Check, X } from 'lucide-react'
import Link from 'next/link'

const popularTLDs = [
    { ext: '.com', price: 1200 },
    { ext: '.net', price: 1400 },
    { ext: '.org', price: 1300 },
    { ext: '.io', price: 3500 },
    { ext: '.dev', price: 1500 },
    { ext: '.app', price: 1800 },
    { ext: '.co', price: 2500 },
    { ext: '.ai', price: 8000 },
]

export default function DomainDeployPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [searching, setSearching] = useState(false)
    const [searchResults, setSearchResults] = useState<Array<{ domain: string; available: boolean; price: number }>>([])
    const [addingToCart, setAddingToCart] = useState<string | null>(null)
    const [cartItems, setCartItems] = useState<Set<string>>(new Set())

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!searchQuery.trim()) return

        setSearching(true)

        try {
            // Call our server-side API that integrates with Namecheap
            const response = await fetch('/api/domains/check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ searchQuery: searchQuery.trim() })
            })

            if (!response.ok) {
                throw new Error('Failed to check domains')
            }

            const data = await response.json()
            setSearchResults(data.results || [])
        } catch (error) {
            console.error('Domain search error:', error)
            // Show error to user
            setSearchResults([])
        } finally {
            setSearching(false)
        }
    }

    const addToCart = async (domain: string, price: number) => {
        setAddingToCart(domain)

        try {
            const response = await fetch('/api/domains/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ domain, price })
            })

            const data = await response.json()

            if (!response.ok) {
                alert(data.error || 'Failed to add domain to cart')
                return
            }

            // Add to cart items set
            setCartItems(prev => new Set(prev).add(domain))
            alert(`${domain} added to cart successfully!`)
        } catch (error) {
            console.error('Add to cart error:', error)
            alert('Failed to add domain to cart')
        } finally {
            setAddingToCart(null)
        }
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <main className="flex-1 py-12 px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
                            <Network className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-4xl font-bold text-foreground mb-3">
                            Domain Registration
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Find and register your perfect domain name
                        </p>
                    </div>

                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="mb-12">
                        <div className="relative max-w-2xl mx-auto">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for your domain (e.g., mywebsite)"
                                className="w-full px-6 py-4 pr-14 bg-card border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <button
                                type="submit"
                                disabled={searching || !searchQuery.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                <Search className="w-5 h-5" />
                            </button>
                        </div>
                    </form>

                    {/* Search Results */}
                    {searching && (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-4"></div>
                            <p className="text-muted-foreground">Searching for available domains...</p>
                        </div>
                    )}

                    {!searching && searchResults.length > 0 && (
                        <div className="space-y-3">
                            <h2 className="text-xl font-semibold text-foreground mb-4">Search Results</h2>
                            {searchResults.map((result, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-4 bg-card border border-border rounded-xl"
                                >
                                    <div className="flex items-center gap-3">
                                        {result.available ? (
                                            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                                                <Check className="w-5 h-5 text-green-500" />
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                                                <X className="w-5 h-5 text-red-500" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium text-foreground">{result.domain}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {result.available ? 'Available' : 'Taken'}
                                            </p>
                                        </div>
                                    </div>
                                    {result.available ? (
                                        <div className="flex items-center gap-4">
                                            <span className="font-semibold text-foreground">
                                                रू {result.price.toLocaleString('en-NP')}/year
                                            </span>
                                            <button
                                                onClick={() => addToCart(result.domain, result.price)}
                                                disabled={addingToCart === result.domain || cartItems.has(result.domain)}
                                                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {addingToCart === result.domain ? 'Adding...' : cartItems.has(result.domain) ? 'Added' : 'Add to Cart'}
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">Unavailable</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {!searching && searchResults.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">
                                Enter a domain name to start searching
                            </p>
                        </div>
                    )}

                    {/* Back Link */}
                    <div className="mt-12 text-center">
                        <Link
                            href="/projects/new"
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            ← Back to deployment options
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
