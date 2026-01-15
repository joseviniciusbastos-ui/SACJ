'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    FilePlus,
    Users,
    Settings,
    LogOut,
    Gavel
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';

const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Nova Simulação', href: '/simulation/new', icon: FilePlus },
    { name: 'Devedores', href: '/debtors', icon: Users },
    { name: 'Configurações', href: '/settings', icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-border/50 flex flex-col z-50">
            {/* Logo */}
            <div className="p-8 flex items-center space-x-3">
                <div className="w-10 h-10 bg-[oklch(30%_0.1_230)] rounded-xl flex items-center justify-center text-white shadow-lg">
                    <Gavel size={24} />
                </div>
                <span className="text-xl font-bold tracking-tight text-[oklch(20%_0.04_220)]">
                    SACJ
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group",
                                isActive
                                    ? "bg-[oklch(30%_0.1_230)] text-white shadow-md shadow-blue-500/10"
                                    : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn(
                                "w-5 h-5",
                                isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                            )} />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User/Logout */}
            <div className="p-4 border-t border-border/50">
                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Sair do Sistema</span>
                </button>
            </div>
        </aside>
    );
}
