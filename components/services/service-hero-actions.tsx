'use client'

import { MessageSquare } from 'lucide-react'
import { BuyButton } from '@/components/buy-button'

interface ServiceHeroActionsProps {
    service: {
        id: string
        title: string
        slug: string
        price: number
        currency: string
    }
    variant?: 'default' | 'white'
}

export function ServiceHeroActions({ service, variant = 'default' }: ServiceHeroActionsProps) {
    const isWhite = variant === 'white'

    return (
        <div className="flex flex-col sm:flex-row gap-4">
            <BuyButton
                itemType="service"
                itemId={service.id}
                itemTitle={service.title}
                itemSlug={service.slug}
                amount={service.price}
                currency={service.currency}
                className={`px-8 py-4 text-lg shadow-lg transition-all duration-300 ${isWhite
                        ? 'bg-white text-primary hover:bg-gray-100 shadow-xl'
                        : 'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary hover:shadow-primary/50'
                    }`}
            >
                {isWhite ? 'Purchase Now' : 'Get Started Now'}
            </BuyButton>

            <button
                onClick={() => {
                    window.dispatchEvent(new CustomEvent('openChatWithMessage', {
                        detail: { itemType: 'service', itemTitle: service.title }
                    }))
                }}
                className={`px-8 py-4 text-lg flex items-center justify-center gap-2 border-2 rounded-xl font-medium transition-all duration-300 ${isWhite
                        ? 'border-white text-white hover:bg-white/10'
                        : 'border-primary/50 text-primary hover:bg-primary/10 hover:border-primary'
                    }`}
            >
                <MessageSquare className="h-5 w-5" />
                {isWhite ? 'Contact Us' : 'Ask Questions'}
            </button>
        </div>
    )
}
