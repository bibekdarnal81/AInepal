export const notify = {
    success: (message: string) => {
        // Simple implementation using browser alert or console for now
        // In a real app, integrate with sonner or toast
        console.log('Success:', message)
        alert(message)
    },
    error: (message: string) => {
        console.error('Error:', message)
        alert(message)
    }
}
