'use client'

import { useState, useEffect } from 'react'
import { Search, ShoppingBag, X } from 'lucide-react'

interface CatalogBrowseProps {
    onClose: () => void
    onPurchase: () => void
}

export function CatalogBrowse({ onClose, onPurchase }: CatalogBrowseProps) {
    return (
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 h-full overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="p-4 border-b border-border bg-white dark:bg-gray-800 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-emerald-500" />
                    Browse Services
                </h3>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center text-center text-muted-foreground">
                <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg font-medium mb-2">Service Catalog</p>
                <p className="text-sm max-w-[200px]">
                    Browse our services and projects directly from the chat. Coming soon!
                </p>
                <button
                    onClick={onClose}
                    className="mt-6 text-sm text-primary hover:underline"
                >
                    Back to Chat
                </button>
            </div>
        </div>
    )
}
