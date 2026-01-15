import { Sidebar } from '@/components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-background text-foreground font-sans antialiased">
            <aside className="fixed inset-y-0 left-0 z-20 hidden lg:block">
                <Sidebar />
            </aside>
            <main className="flex-1 lg:pl-64 transition-all duration-300 ease-in-out">
                <div className="container mx-auto p-6 md:p-8 max-w-7xl">
                    {children}
                </div>
            </main>
        </div>
    );
}
