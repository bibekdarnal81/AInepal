import { Server } from 'socket.io'

// Helper to access the global IO instance from API routes
export const getIO = (): Server | undefined => {
    if ((global as any).io) {
        return (global as any).io as Server
    }
    return undefined
}
