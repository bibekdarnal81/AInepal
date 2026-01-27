import { NextResponse } from 'next/server'

// Known taken domains (common/valuable domains that are definitely registered)
const KNOWN_TAKEN_DOMAINS = [
    'google', 'facebook', 'amazon', 'apple', 'microsoft', 'twitter', 'instagram',
    'youtube', 'netflix', 'tesla', 'samsung', 'sony', 'nike', 'adidas',
    'nepal', 'india', 'china', 'america', 'london', 'paris', 'tokyo',
    'bitcoin', 'crypto', 'blockchain', 'ai', 'tech', 'cloud', 'app',
    'shop', 'store', 'buy', 'sell', 'news', 'blog', 'mail', 'email',
    'bank', 'money', 'finance', 'insurance', 'health', 'medical', 'doctor',
    'food', 'travel', 'hotel', 'flight', 'car', 'home', 'real', 'estate'
]

// Pricing map for different TLDs (in NPR)
const TLD_PRICING: Record<string, number> = {
    '.com': 1200,
    '.net': 1400,
    '.org': 1300,
    '.io': 3500,
    '.dev': 1500,
    '.app': 1800,
    '.co': 2500,
    '.ai': 8000,
    '.xyz': 900,
    '.tech': 1600,
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { searchQuery } = body

        if (!searchQuery || typeof searchQuery !== 'string') {
            return NextResponse.json(
                { error: 'Invalid search query' },
                { status: 400 }
            )
        }

        // Clean the search query (remove any existing TLD)
        const cleanQuery = searchQuery.toLowerCase().replace(/\.(com|net|org|io|dev|app|co|ai|xyz|tech)$/i, '')

        // Generate list of domains to check
        const tlds = Object.keys(TLD_PRICING)
        const domainsToCheck = tlds.map(tld => `${cleanQuery}${tld}`)

        console.log('[Domain API] Search query:', cleanQuery)
        console.log('[Domain API] Checking', domainsToCheck.length, 'domains')

        // Generate simulated results
        // Note: For real availability checking, integrate with a domain registrar API
        // or WHOIS service. Cloudflare API doesn't support availability checking.
        const results = domainsToCheck.map(domain => {
            const tld = domain.substring(domain.lastIndexOf('.'))
            const domainName = domain.substring(0, domain.lastIndexOf('.'))

            // Check if domain is in known taken list
            const isKnownTaken = KNOWN_TAKEN_DOMAINS.includes(domainName.toLowerCase())

            return {
                domain,
                available: isKnownTaken ? false : Math.random() > 0.4, // Known domains always unavailable, others 60% available
                premium: false,
                price: TLD_PRICING[tld] || 1500
            }
        })

        console.log('[Domain API] Returning', results.length, 'simulated results')

        return NextResponse.json({
            results,
            note: 'These are simulated availability results. For actual registration, please use Cloudflare dashboard.'
        })
    } catch (error) {
        console.error('[Domain API] Error:', error)
        return NextResponse.json(
            { error: 'Failed to check domain availability' },
            { status: 500 }
        )
    }
}
