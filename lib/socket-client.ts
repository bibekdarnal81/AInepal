import { io, Socket } from 'socket.io-client'

let socket: Socket | undefined

export const getSocket = (): Socket => {
    if (!socket) {
        // Connect to the same origin
        socket = io({
            path: '/socket.io',
            autoConnect: true,
            reconnection: true,
        })
    }
    return socket
}

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect()
        socket = undefined
    }
}
