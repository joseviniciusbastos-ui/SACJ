'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ShieldCheck, User, Lock, Mail } from 'lucide-react';

function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            toast.error('Token de convite não encontrado');
            router.push('/login');
        }
    }, [token, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return toast.error('As senhas não coincidem');
        }

        setLoading(true);
        try {
            const res = await fetch('/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, token })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('Conta criada com sucesso! Faça login.');
                router.push('/login');
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            toast.error('Erro ao criar conta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md border-none shadow-2xl bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden">
            <CardHeader className="space-y-1 p-8 text-center bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4">
                    <ShieldCheck size={28} />
                </div>
                <CardTitle className="text-3xl font-extrabold tracking-tight text-slate-900">
                    Finalizar Cadastro
                </CardTitle>
                <CardDescription className="text-slate-500 font-medium">
                    Crie sua conta para acessar o sistema.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Nome Completo</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                            <Input
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all shadow-sm"
                                placeholder="Seu nome"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                            <Input
                                required
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all shadow-sm"
                                placeholder="exemplo@sacj.com"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Senha</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                            <Input
                                required
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all shadow-sm"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Confirmar Senha</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                            <Input
                                required
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all shadow-sm"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                    <Button
                        type="submit"
                        className="w-full h-12 rounded-xl text-md font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98]"
                        disabled={loading}
                    >
                        {loading ? 'Criando conta...' : 'Criar Conta'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

export default function RegisterPage() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-teal-50">
            <Suspense fallback={<div>Carregando...</div>}>
                <RegisterForm />
            </Suspense>
        </div>
    );
}
