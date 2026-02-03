import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/options'
import dbConnect from '@/lib/mongodb/client'
import { PaymentMethod } from '@/lib/mongodb/models'
import mongoose from 'mongoose'

async function isAdmin() {
    const session = await getServerSession(authOptions)
    return session?.user?.isAdmin === true
}

export async function GET() {
    try {
        if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        await dbConnect()
        const methods = await PaymentMethod.find().sort({ createdAt: -1 }).lean()
        const typedMethods = methods as unknown as Array<{
            _id: mongoose.Types.ObjectId
            name: string
            type: string
            qr_image_url?: string
            account_name?: string
            account_number?: string
            bank_name?: string
            instructions?: string
            isActive: boolean
            createdAt: Date
        }>
        return NextResponse.json({
            paymentMethods: typedMethods.map((m) => ({
                id: m._id.toString(), name: m.name, type: m.type, qrImageUrl: m.qr_image_url,
                accountName: m.account_name, accountNumber: m.account_number, bankName: m.bank_name,
                instructions: m.instructions, isActive: m.isActive, createdAt: m.createdAt
            }))
        })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        await dbConnect()
        const body = await request.json()
        const method = await PaymentMethod.create({
            name: body.name, type: body.type, qr_image_url: body.qrImageUrl || '',
            account_name: body.accountName, account_number: body.accountNumber,
            bank_name: body.bankName || '', instructions: body.instructions || '', isActive: body.isActive ?? true
        })
        return NextResponse.json({ success: true, id: method._id.toString() }, { status: 201 })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        await dbConnect()
        const { id, ...fields } = await request.json()
        if (!id || !mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
        const updateData: Record<string, unknown> = {}
        if (fields.name !== undefined) updateData.name = fields.name
        if (fields.type !== undefined) updateData.type = fields.type
        if (fields.qrImageUrl !== undefined) updateData.qr_image_url = fields.qrImageUrl
        if (fields.accountName !== undefined) updateData.account_name = fields.accountName
        if (fields.accountNumber !== undefined) updateData.account_number = fields.accountNumber
        if (fields.bankName !== undefined) updateData.bank_name = fields.bankName
        if (fields.instructions !== undefined) updateData.instructions = fields.instructions
        if (fields.isActive !== undefined) updateData.isActive = fields.isActive
        const method = await PaymentMethod.findByIdAndUpdate(id, updateData, { new: true })
        if (!method) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const id = new URL(request.url).searchParams.get('id')
        if (!id || !mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
        await dbConnect()
        await PaymentMethod.findByIdAndDelete(id)
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}
