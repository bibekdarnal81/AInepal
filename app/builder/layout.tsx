import { BuilderHeader } from '@/components/builder/header';

export default function BuilderLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-black text-white">
            <BuilderHeader />
            <div className="pt-14">
                {children}
            </div>
        </div>
    );
}
