import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const {
            type,
            itemId,
            amount,
            paymentMethodId,
            paymentProofUrl,
            transactionId,
            billingCycle, // Hosting specific
            domainName,   // Domain specific
            years,        // Domain specific
            requirements,  // Service specific
            enroll // Class enrollment details
        } = await req.json()

        // Get authenticated user
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        let result
        let orderId

        if (type === 'hosting') {
            const { data, error } = await supabase.from('hosting_orders').insert({
                user_id: user.id,
                plan_id: itemId, // hosting table uses UUID mostly or serial ID? Check migration. 
                // Wait, hosting_orders schema checks:
                // hosting_orders(user_id, plan_id, billing_cycle, domain_name, payment_method_id, payment_proof_url, transaction_id, status)
                billing_cycle: billingCycle,
                domain_name: domainName,
                payment_method_id: paymentMethodId,
                payment_proof_url: paymentProofUrl,
                transaction_id: transactionId,
                status: 'pending',
                amount: amount,
                price: amount // Legacy column support
            }).select('id').single()

            if (error) throw error
            orderId = data.id

        } else if (type === 'services') {
            const { data, error } = await supabase.from('service_orders').insert({
                user_id: user.id,
                service_id: itemId,
                amount,
                payment_method_id: paymentMethodId,
                payment_proof_url: paymentProofUrl,
                transaction_id: transactionId,
                requirements,
                status: 'pending'
            }).select('id').single()

            if (error) throw error
            orderId = data.id

        } else if (type === 'projects') {
            const { data, error } = await supabase.from('project_orders').insert({
                user_id: user.id,
                project_id: itemId,
                amount,
                payment_method_id: paymentMethodId,
                payment_proof_url: paymentProofUrl,
                transaction_id: transactionId,
                status: 'pending'
            }).select('id').single()

            if (error) throw error
            orderId = data.id

        } else if (type === 'domains') {
            const { data, error } = await supabase.from('domain_orders').insert({
                user_id: user.id,
                domain_name: domainName || 'unknown-domain',
                years,
                amount,
                payment_method_id: paymentMethodId,
                payment_proof_url: paymentProofUrl,
                transaction_id: transactionId,
                status: 'pending'
            }).select('id').single()

            if (error) throw error
            orderId = data.id

        } else if (type === 'bundles') {
            const { data, error } = await supabase.from('bundle_orders').insert({
                user_id: user.id,
                bundle_id: itemId,
                amount,
                payment_method_id: paymentMethodId,
                payment_proof_url: paymentProofUrl,
                transaction_id: transactionId,
                status: 'pending'
            }).select('id').single()

            if (error) throw error
            orderId = data.id
        } else if (type === 'classes') {
            const { data, error } = await supabase.from('class_orders').insert({
                user_id: user.id,
                class_id: itemId,
                amount,
                payment_method_id: paymentMethodId,
                payment_proof_url: paymentProofUrl,
                transaction_id: transactionId,
                status: 'pending',
                full_name: enroll?.fullName || null,
                email: enroll?.email || null,
                mobile: enroll?.mobile || null,
                address: enroll?.address || null,
                college_name: enroll?.collegeName || null,
                other_course: enroll?.otherCourse || null,
                remarks: enroll?.remarks || null
            }).select('id').single()

            if (error) throw error
            orderId = data.id

        } else {
            return NextResponse.json({ error: 'Invalid order type' }, { status: 400 })
        }

        return NextResponse.json({ success: true, orderId })

    } catch (error: any) {
        console.error('Checkout error:', error)
        return NextResponse.json({ error: error.message || 'Checkout failed' }, { status: 500 })
    }
}
