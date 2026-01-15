'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gavel, Loader2, User, Mail, Lock, ShieldCheck } from 'lucide-react';

export default function SetupPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [hasUsers, setHasUsers] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        // Check if there are already users
        fetch('/api/users/check')
            .then((res) => res.json())
            .then((data) => {
                if (data.hasUsers) {
                    setHasUsers(true);
                }
            })
            .catch(() => { })
            .finally(() => setChecking(false));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/users/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Erro ao criar usuário');
                return;
            }

            router.push('/login');
        } catch (err) {
            setError('Erro ao criar usuário. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (checking) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[oklch(98%+0.01+210)]">
                <div className="flex flex-col items-center">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                    <div className="text-slate-600 font-medium animate-pulse">Iniciando sistema...</div>
                </div>
            </div>
        );
    }

    if (hasUsers) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[oklch(98%+0.01+210)] p-4">
                <Card className="w-full max-w-md border-none shadow-2xl rounded-[32px] p-4">
                    <CardHeader className="text-center space-y-4">
                        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
                            <ShieldCheck className="w-10 h-10 text-amber-500" />
                        </div>
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-bold">Acesso Restrito</CardTitle>
                            <CardDescription className="font-medium">
                                O sistema já possui um administrador configurado.
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="text-center pt-4 pb-8">
                        <Button
                            onClick={() => router.push('/login')}
                            className="bg-[oklch(30%_0.1_230)] w-full py-6 rounded-2xl"
                        >
                            Ir para o Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[oklch(98%+0.01+210)] p-4 relative overflow-hidden">
            {/* Abstract Background Decoration */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50/50 blur-[120px] rounded-full" />

            <div className="w-full max-w-[500px] z-10 animate-in fade-in zoom-in duration-700">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-14 h-14 bg-[oklch(30%_0.1_230)] rounded-2xl flex items-center justify-center text-white shadow-lg mb-4">
                        <Gavel size={32} />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-[oklch(20%_0.04_220)]">
                        Configuração Inicial
                    </h1>
                </div>

                <Card className="border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[32px] bg-white/80 backdrop-blur-xl border border-white/40">
                    <CardHeader className="space-y-2 p-10 pb-4">
                        <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight text-center">
                            Crie sua conta mestre
                        </CardTitle>
                        <CardDescription className="text-center text-slate-500 font-medium">
                            Configure o primeiro administrador para gerenciar o sistema.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 pt-4">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2.5">
                                <Label htmlFor="name" className="text-sm font-bold text-slate-700 ml-1">Nome Completo</Label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="João da Silva"
                                        className="pl-12 h-12 bg-slate-50/50 border-slate-200/60 rounded-2xl focus:bg-white transition-all text-base"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2.5">
                                <Label htmlFor="email" className="text-sm font-bold text-slate-700 ml-1">Email</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        className="pl-12 h-12 bg-slate-50/50 border-slate-200/60 rounded-2xl focus:bg-white transition-all text-base"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2.5">
                                    <Label htmlFor="password" title="password label" className="text-sm font-bold text-slate-700 ml-1">Senha</Label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            className="pl-12 h-12 bg-slate-50/50 border-slate-200/60 rounded-2xl focus:bg-white transition-all text-base"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2.5">
                                    <Label htmlFor="confirmPassword" title="confirm password label" className="text-sm font-bold text-slate-700 ml-1">Confirmar</Label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            className="pl-12 h-12 bg-slate-50/50 border-slate-200/60 rounded-2xl focus:bg-white transition-all text-base"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            </div>
                            {error && (
                                <div className="rounded-2xl bg-red-50 p-4 border border-red-100 text-sm text-red-800 font-bold flex items-center shadow-sm">
                                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full mr-3 shrink-0" />
                                    {error}
                                </div>
                            )}
                            <Button
                                type="submit"
                                className="w-full h-14 bg-[oklch(30%_0.1_230)] hover:bg-[oklch(40%_0.1_230)] text-white text-lg font-bold rounded-2xl premium-transition"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Configurando...
                                    </div>
                                ) : 'Criar Administrador'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
