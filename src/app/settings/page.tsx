'use client';

import React, { useState } from 'react';
import {
    Settings,
    User,
    Shield,
    Bell,
    Database,
    Save,
    Mail,
    Lock,
    Globe,
    UserPlus,
    Copy,
    CheckCircle2,
    Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/DashboardLayout';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

export default function SettingsPage() {
    const { data: session } = useSession();
    const [saving, setSaving] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('OPERATOR');
    const [inviting, setInviting] = useState(false);
    const [inviteLink, setInviteLink] = useState('');

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            toast.success('Configurações salvas com sucesso!');
        }, 1000);
    };

    const isAdmin = (session?.user as any)?.role === 'ADMIN';

    const handleInvite = async () => {
        if (!inviteEmail) return;
        setInviting(true);
        try {
            const res = await fetch('/api/users/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: inviteEmail, role: inviteRole })
            });
            const data = await res.json();
            if (res.ok) {
                setInviteLink(data.inviteLink);
                toast.success('Convite gerado com sucesso!');
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            toast.error('Erro ao processar convite');
        } finally {
            setInviting(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.info('Link copiado!');
    };

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-in fade-in duration-700">
                {/* Header */}
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
                        Configurações
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Gerencie as preferências da sua conta e do sistema.
                    </p>
                </div>

                <Tabs defaultValue="profile" className="space-y-6">
                    <TabsList className="bg-white/40 backdrop-blur-sm p-1 shadow-sm border border-border/20 rounded-xl">
                        <TabsTrigger value="profile" className="rounded-lg font-bold px-6">Perfil</TabsTrigger>
                        <TabsTrigger value="security" className="rounded-lg font-bold px-6">Segurança</TabsTrigger>
                        <TabsTrigger value="system" className="rounded-lg font-bold px-6">Sistema</TabsTrigger>
                        {isAdmin && (
                            <TabsTrigger value="users" className="rounded-lg font-bold px-6">Gestão de Time</TabsTrigger>
                        )}
                    </TabsList>

                    <TabsContent value="profile" className="space-y-6">
                        <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
                            <CardHeader className="p-8 border-b border-border/50 bg-slate-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-bold">Informações Pessoais</CardTitle>
                                        <CardDescription>Atualize seus dados de contato e identificação.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="full_name" className="font-bold text-slate-700">Nome Completo</Label>
                                        <Input id="full_name" defaultValue={session?.user?.name || ''} className="rounded-xl h-12 bg-slate-50/50" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="font-bold text-slate-700">Email Profissional</Label>
                                        <Input id="email" type="email" defaultValue={session?.user?.email || ''} className="rounded-xl h-12 bg-slate-50/50" />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button onClick={handleSave} disabled={saving} className="rounded-xl px-8 h-12">
                                        <Save className="mr-2 h-4 w-4" />
                                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="security" className="space-y-6">
                        <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
                            <CardHeader className="p-8 border-b border-border/50 bg-slate-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                                        <Shield size={24} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-bold">Segurança da Conta</CardTitle>
                                        <CardDescription>Gerencie sua senha e métodos de autenticação.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="current_pass" className="font-bold text-slate-700">Senha Atual</Label>
                                            <Input id="current_pass" type="password" placeholder="••••••••" className="rounded-xl h-12 bg-slate-50/50" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="new_pass" className="font-bold text-slate-700">Nova Senha</Label>
                                            <Input id="new_pass" type="password" placeholder="••••••••" className="rounded-xl h-12 bg-slate-50/50" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button onClick={handleSave} disabled={saving} className="rounded-xl px-8 h-12">
                                        <Save className="mr-2 h-4 w-4" />
                                        {saving ? 'Salvando...' : 'Atualizar Senha'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="system" className="space-y-6">
                        <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
                            <CardHeader className="p-8 border-b border-border/50 bg-slate-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                        <Globe size={24} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-bold">Preferências do Sistema</CardTitle>
                                        <CardDescription>Configurações globais para cálculos e exibição.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label className="font-bold text-slate-700">Moeda Padrão</Label>
                                        <Input disabled defaultValue="BRL (R$)" className="rounded-xl h-12 bg-slate-50/50" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-bold text-slate-700">Fuso Horário</Label>
                                        <Input disabled defaultValue="Brasília (GMT-3)" className="rounded-xl h-12 bg-slate-50/50" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-bold text-slate-700">Idioma</Label>
                                        <Input disabled defaultValue="Português (Brasil)" className="rounded-xl h-12 bg-slate-50/50" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="users" className="space-y-6">
                        <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
                            <CardHeader className="p-8 border-b border-border/50 bg-slate-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                                        <UserPlus size={24} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-bold">Convidar Operador</CardTitle>
                                        <CardDescription>Envie um convite para novos membros da sua equipe.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="flex flex-col md:flex-row gap-4 items-end">
                                    <div className="flex-1 space-y-2 w-full">
                                        <Label className="font-bold text-slate-700">Email do Convidado</Label>
                                        <Input
                                            placeholder="exemplo@igreja.com"
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            className="rounded-xl h-12 bg-slate-50/50"
                                        />
                                    </div>
                                    <Button
                                        onClick={handleInvite}
                                        disabled={inviting || !inviteEmail}
                                        className="h-12 rounded-xl px-8 font-bold"
                                    >
                                        {inviting ? 'Gerando...' : 'Gerar Link de Acesso'}
                                    </Button>
                                </div>

                                {inviteLink && (
                                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className="text-emerald-600" size={20} />
                                            <span className="text-sm font-medium text-emerald-800 truncate max-w-md">{inviteLink}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => copyToClipboard(inviteLink)}
                                            className="text-emerald-700 hover:bg-emerald-100 rounded-lg"
                                        >
                                            <Copy size={16} className="mr-2" />
                                            Copiar Link
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
