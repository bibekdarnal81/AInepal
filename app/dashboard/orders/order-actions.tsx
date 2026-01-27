"use client"

import { Trash2, AlertCircle } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function OrderActions({ orderId, isAdmin }: { orderId: string, isAdmin: boolean }) {
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()

    async function handleDelete() {
        if (!confirm("Are you sure you want to delete this order? This action cannot be undone.")) return

        setIsDeleting(true)
        try {
            const res = await fetch(`/api/admin/orders/${orderId}`, {
                method: "DELETE",
            })

            if (!res.ok) throw new Error("Failed to delete order")

            router.refresh()
        } catch (error) {
            console.error(error)
            alert("Failed to delete order")
        } finally {
            setIsDeleting(false)
        }
    }

    if (!isAdmin) return (
        <button className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
            Details
        </button>
    )

    return (
        <div className="flex items-center justify-end gap-3">
            <button className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                Details
            </button>
            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-500 hover:text-red-700 hover:bg-red-500/10 p-1.5 rounded-md transition-colors"
                title="Delete Order"
            >
                {isDeleting ? (
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin block" />
                ) : (
                    <Trash2 className="w-4 h-4" />
                )}
            </button>
        </div>
    )
}
