import { User, CreditTransaction } from '@/lib/mongodb/models'
import mongoose from 'mongoose'
import { getIO } from './socket-server'

export async function deductCredits(
    userId: string | mongoose.Types.ObjectId,
    amount: number,
    description: string,
    metadata?: Record<string, unknown>
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
    try {
        const user = await User.findById(userId)
        if (!user) {
            return { success: false, error: 'User not found' }
        }

        const advancedCredits = user.advancedCredits || 0

        if (advancedCredits < amount) {
            return { success: false, error: 'Insufficient advanced credits' }
        }

        // Deduct only from Advanced Credits
        const newAdvancedCredits = advancedCredits - amount

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    advancedCredits: newAdvancedCredits
                }
            },
            { new: true }
        )

        if (!updatedUser) {
            return { success: false, error: 'Failed to update user balance' }
        }

        // Log transaction
        await CreditTransaction.create({
            userId,
            amount: -amount,
            type: 'generation',
            description,
            metadata: {
                ...metadata,
                deductedFrom: 'advancedCredits'
            },
        })

        // Emit socket event for real-time update
        const io = getIO()
        if (io) {
            io.to(`user-${userId}`).emit('credits-updated', {
                userId: userId.toString(),
                advancedCredits: newAdvancedCredits
            })
        }

        return { success: true, newBalance: newAdvancedCredits }
    } catch (error) {
        console.error('Error deducting credits:', error)
        return { success: false, error: 'Transaction failed' }
    }
}

export async function addAdvancedCredits(
    userId: string | mongoose.Types.ObjectId,
    amount: number,
    description: string,
    metadata?: Record<string, unknown>
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $inc: { advancedCredits: amount } },
            { new: true }
        )

        if (!updatedUser) {
            return { success: false, error: 'User not found' }
        }

        await CreditTransaction.create({
            userId,
            amount: amount,
            type: 'purchase',
            description,
            metadata: {
                ...metadata,
                creditType: 'advancedCredits'
            },
        })

        // Emit socket event for real-time update
        const io = getIO()
        if (io) {
            io.to(`user-${userId}`).emit('credits-updated', {
                userId: userId.toString(),
                advancedCredits: updatedUser.advancedCredits || 0
            })
        }

        return { success: true, newBalance: updatedUser.advancedCredits }
    } catch (error) {
        console.error('Error adding advanced credits:', error)
        return { success: false, error: 'Transaction failed' }
    }
}
