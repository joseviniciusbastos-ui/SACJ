'use client';

import React from 'react';
import Sidebar from './Sidebar';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { status } = useSession();

    if (status === 'unauthenticated') {
        redirect('/login');
    }

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex">
            <Sidebar />
            <main className="ml-64 flex-1 p-8">
                <div className="max-w-7xl mx-auto h-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
