/**
 * Test script to verify Namecheap API configuration
 * Run with: npx tsx scripts/test-namecheap.ts
 */

const requiredEnvVars = [
    'NAMECHEAP_API_USER',
    'NAMECHEAP_API_KEY',
    'NAMECHEAP_USERNAME',
    'NAMECHEAP_CLIENT_IP',
]

const optionalEnvVars = [
    'NAMECHEAP_USE_SANDBOX',
]

console.log('🔍 Checking Namecheap API Configuration...\n')

let allPresent = true

// Check required variables
console.log('Required Environment Variables:')
requiredEnvVars.forEach(varName => {
    const value = process.env[varName]
    const status = value ? '✅' : '❌'
    const display = value ? '(configured)' : '(MISSING)'

    console.log(`${status} ${varName}: ${display}`)

    if (!value) {
        allPresent = false
    }
})

console.log('\nOptional Environment Variables:')
optionalEnvVars.forEach(varName => {
    const value = process.env[varName]
    const status = value ? '✅' : '⚠️'
    const display = value || '(not set, defaults to false)'

    console.log(`${status} ${varName}: ${display}`)
})

console.log('\n' + '='.repeat(50))

if (allPresent) {
    console.log('✅ All required Namecheap API variables are configured!')
    console.log('\nYour configuration:')
    console.log(`- API User: ${process.env.NAMECHEAP_API_USER}`)
    console.log(`- Username: ${process.env.NAMECHEAP_USERNAME}`)
    console.log(`- Client IP: ${process.env.NAMECHEAP_CLIENT_IP}`)
    console.log(`- API Key: ${process.env.NAMECHEAP_API_KEY?.substring(0, 10)}...`)
    console.log(`- Environment: ${process.env.NAMECHEAP_USE_SANDBOX === 'true' ? 'SANDBOX (testing)' : 'PRODUCTION'}`)

    console.log('\n🎉 Domain search will use REAL Namecheap API!')
} else {
    console.log('❌ Some required variables are missing!')
    console.log('\nAdd the following to your .env.local file:')
    console.log(`
NAMECHEAP_API_USER=your_username
NAMECHEAP_API_KEY=your_api_key
NAMECHEAP_USERNAME=your_username
NAMECHEAP_USE_SANDBOX=true
NAMECHEAP_CLIENT_IP=your_server_ip
  `)
    console.log('💡 Domain search will use SIMULATED results until configured.')
}

console.log('='.repeat(50))
