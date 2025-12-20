// Quick test script to verify domain check API
const testDomainCheck = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/domains/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ searchQuery: 'testsite' })
        })

        const data = await response.json()
        console.log('API Response:', JSON.stringify(data, null, 2))

        if (!data.results || data.results.length === 0) {
            console.log('❌ ERROR: Results array is empty!')
        } else {
            console.log(`✅ SUCCESS: Got ${data.results.length} results`)
            data.results.forEach(r => {
                console.log(`  - ${r.domain}: ${r.available ? 'Available' : 'Taken'} (रू ${r.price})`)
            })
        }
    } catch (error) {
        console.error('❌ Test failed:', error)
    }
}

testDomainCheck()
