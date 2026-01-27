import { redirect } from "next/navigation"

export default function ProfilePage({
    searchParams,
}: {
    searchParams: { tab?: string }
}) {
    const tab = searchParams.tab

    if (tab === 'orders') {
        redirect("/dashboard/orders")
    }

    redirect("/dashboard")
}
