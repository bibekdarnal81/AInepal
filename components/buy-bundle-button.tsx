'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface BuyBundleButtonProps {
    bundleId: string;
    price: number;
}

export function BuyBundleButton({ bundleId, price }: BuyBundleButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleBuy = async () => {
        router.push(`/checkout/bundles/${bundleId}`);
    };

    return (
        <button
            onClick={handleBuy}
            disabled={loading}
            className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-lg shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
            {loading ? (
                <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                </>
            ) : (
                'Buy This Bundle'
            )}
        </button>
    );
}
