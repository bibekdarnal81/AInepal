'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export function ServiceBackLink() {
    return (
        <Link
            href="/services"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
        >
            <ArrowLeft className="h-4 w-4" />
            Back to Services
        </Link>
    )
}
