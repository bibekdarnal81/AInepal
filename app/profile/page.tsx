import { redirect } from "next/navigation"

export default async function ProfilePage({
    searchParams,
}: {
    searchParams: Promise<{ tab?: string }>
}) {
    const { tab } = await searchParams

    if (tab === 'orders') {
        redirect("/dashboard/orders")
    }

    redirect("/dashboard")
}
