'use client'

import React, { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '../ui/badge'
import { Loader2 } from 'lucide-react'

interface Transaction {
    _id: string
    amount: number
    type: string
    description: string
    createdAt: string
    metadata?: any
}

export function CreditHistory() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)

    useEffect(() => {
        fetchHistory(1)
    }, [])

    const fetchHistory = async (pageNum: number) => {
        try {
            setLoading(true)
            const res = await fetch(`/api/credits/history?page=${pageNum}&limit=10`)
            const data = await res.json()
            if (data.success) {
                if (pageNum === 1) {
                    setTransactions(data.transactions)
                } else {
                    setTransactions(prev => [...prev, ...data.transactions])
                }
                setHasMore(data.pagination.page < data.pagination.pages)
            }
        } catch (error) {
            console.error('Failed to fetch history:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadMore = () => {
        const nextPage = page + 1
        setPage(nextPage)
        fetchHistory(nextPage)
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Transaction History</h2>
            <div className="space-y-3">
                {transactions.map((tx) => (
                    <Card key={tx._id} className="p-4 flex justify-between items-center hover:bg-muted/50 transition-colors">
                        <div>
                            <p className="font-medium">{tx.description}</p>
                            <p className="text-sm text-muted-foreground">
                                {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString()}
                            </p>
                        </div>
                        <div className="text-right">
                            <Badge variant={tx.amount > 0 ? 'default' : 'secondary'} className={tx.amount > 0 ? 'bg-green-600' : ''}>
                                {tx.amount > 0 ? '+' : ''}{tx.amount} Credits
                            </Badge>
                        </div>
                    </Card>
                ))}

                {transactions.length === 0 && !loading && (
                    <p className="text-center text-muted-foreground py-8">No transactions found</p>
                )}

                {hasMore && (
                    <div className="flex justify-center pt-2">
                        <button
                            onClick={loadMore}
                            disabled={loading}
                            className="text-sm text-primary hover:underline flex items-center gap-2"
                        >
                            {loading && <Loader2 className="h-3 w-3 animate-spin" />}
                            Load More
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
