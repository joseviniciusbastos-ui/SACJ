'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gavel, Loader2, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Email ou senha inválidos');
            } else {
                router.push('/dashboard');
                router.refresh();
            }
        } catch (err) {
            setError('Erro ao fazer login. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[oklch(98%+0.01+210)] p-4 relative overflow-hidden">
            {/* Abstract Background Decoration */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/50 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-50/50 blur-[120px] rounded-full" />

            <div className="w-full max-w-[440px] z-10 animate-in fade-in zoom-in duration-700">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-14 h-14 bg-[oklch(30%_0.1_230)] rounded-2xl flex items-center justify-center text-white shadow-[0_20px_50px_rgba(30,58,138,0.3)] mb-4">
                        <Gavel size={32} />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-[oklch(20%_0.04_220)]">
                        SACJ
                    </h1>
                    <p className="text-muted-foreground font-medium mt-2">Sistema de Acordos Condominiais</p>
                </div>

                <Card className="border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[32px] bg-white/80 backdrop-blur-xl border border-white/40">
                    <CardHeader className="space-y-2 p-10 pb-4">
                        <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight">
                            Bem-vindo de volta
                        </CardTitle>
                        <CardDescription className="text-slate-500 font-medium">
                            Insira suas credenciais para acessar sua conta.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 pt-4">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-3">
                                <Label htmlFor="email" className="text-sm font-bold text-slate-700 ml-1">Email Profissional</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        className="pl-12 h-12 bg-slate-50/50 border-slate-200/60 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-base"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center ml-1">
                                    <Label htmlFor="password" title="password label" className="text-sm font-bold text-slate-700">Senha</Label>
                                    <a href="#" className="text-xs font-bold text-primary hover:underline">Esqueceu a senha?</a>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-12 h-12 bg-slate-50/50 border-slate-200/60 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-base"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            {error && (
                                <div className="rounded-2xl bg-red-50 p-4 border border-red-100 text-sm text-red-800 font-bold flex items-center shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full mr-3 shrink-0" />
                                    {error}
                                </div>
                            )}
                            <Button
                                type="submit"
                                className="w-full h-14 bg-[oklch(30%_0.1_230)] hover:bg-[oklch(40%_0.1_230)] text-white text-lg font-bold rounded-2xl shadow-[0_12px_24px_-8px_rgba(30,58,138,0.4)] hover:shadow-[0_16px_32px_-8px_rgba(30,58,138,0.5)] premium-transition active:scale-[0.98]"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Autenticando...
                                    </div>
                                ) : 'Entrar no Sistema'}
                            </Button>
                        </form>
                        <div className="mt-8 text-center text-sm">
                            <span className="text-slate-500 font-medium">Ainda não tem acesso?</span>{' '}
                            <button
                                onClick={() => router.push('/setup')}
                                className="text-primary hover:underline font-extrabold ml-1"
                            >
                                Comece agora gratuitamente
                            </button>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-8 text-center">
                    <p className="text-xs text-slate-400 font-medium">
                        © 2026 CondoAgreement S.A. Todos os direitos reservados.
                    </p>
                </div>
            </div>
        </div>
    );
}
