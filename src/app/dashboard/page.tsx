'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Plus, Download, Search, FileText, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatarMoeda, formatarData } from '@/lib/calculations';
import DashboardLayout from '@/components/DashboardLayout';

interface SimulationListItem {
    id: string;
    debtorName: string;
    condominiumName: string;
    totalAmount: number;
    createdAt: string;
    createdBy: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [simulations, setSimulations] = useState<SimulationListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchSimulations();
    }, []);

    const fetchSimulations = async () => {
        try {
            const response = await fetch('/api/simulation');
            const data = await response.json();
            setSimulations(data.simulations || []);
        } catch (error) {
            console.error('Error fetching simulations:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredSimulations = simulations.filter(
        (sim) =>
            sim.debtorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sim.condominiumName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDownloadPDF = async (simulationId: string) => {
        try {
            const response = await fetch(`/api/pdf/${simulationId}`);
            if (!response.ok) throw new Error('Erro ao baixar PDF');

            const blob = await response.blob();
            // Ensure blob type is set correctly
            const pdfBlob = new Blob([blob], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(pdfBlob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `acordo_${simulationId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading PDF:', error);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-in fade-in duration-700">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
                            Bem-vindo, {session?.user?.name?.split(' ')[0]}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Gerencie seus acordos e simulações com agilidade.
                        </p>
                    </div>
                    <Button
                        onClick={() => router.push('/simulation/new')}
                        size="lg"
                        className="bg-[oklch(30%_0.1_230)] hover:bg-[oklch(40%_0.1_230)] text-white shadow-lg shadow-blue-500/20 rounded-xl"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Nova Simulação
                    </Button>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 gap-6">
                    {/* Search & Filter Bar */}
                    <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm rounded-2xl overflow-hidden">
                        <CardContent className="p-2">
                            <div className="flex items-center space-x-4 px-4 py-2">
                                <Search className="h-5 w-5 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por devedor ou condomínio..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="flex-1 border-none shadow-none focus-visible:ring-0 bg-transparent text-lg placeholder:text-muted-foreground/40"
                                />
                                <div className="h-6 w-[1px] bg-border/50 mx-2" />
                                <Button variant="ghost" size="sm" className="text-muted-foreground">
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filtros
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Simulations List */}
                    <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
                        <CardHeader className="border-b border-border/50 bg-slate-50/50 px-8 py-6">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-xl font-bold flex items-center gap-2 text-[oklch(20%_0.1_230)]">
                                    <FileText className="h-5 w-5 text-primary" />
                                    Histórico de Simulações
                                </CardTitle>
                                <span className="text-xs font-semibold px-3 py-1 bg-secondary text-secondary-foreground rounded-full">
                                    {filteredSimulations.length} {filteredSimulations.length === 1 ? 'resultado' : 'resultados'}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-24">
                                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                                    <div className="text-muted-foreground font-medium animate-pulse">Carregando dados...</div>
                                </div>
                            ) : filteredSimulations.length === 0 ? (
                                <div className="text-center py-32">
                                    <div className="w-20 h-20 bg-secondary/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <FileText className="h-10 w-10 text-muted-foreground/40" />
                                    </div>
                                    <p className="text-xl font-bold text-foreground mb-2">Nenhuma simulação encontrada</p>
                                    <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                                        {searchTerm
                                            ? 'Não encontramos nenhum registro compatível com sua busca. Tente outros termos.'
                                            : 'Sua lista de simulações está vazia. Comece criando seu primeiro acordo profissional.'}
                                    </p>
                                    {!searchTerm && (
                                        <Button
                                            onClick={() => router.push('/simulation/new')}
                                            className="bg-[oklch(30%_0.1_230)]"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Criar Simulação Agora
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-slate-50/50">
                                            <TableRow className="hover:bg-transparent border-none">
                                                <TableHead className="px-8 py-4 font-semibold text-xs tracking-wider uppercase text-muted-foreground">Devedor</TableHead>
                                                <TableHead className="px-8 py-4 font-semibold text-xs tracking-wider uppercase text-muted-foreground">Condomínio</TableHead>
                                                <TableHead className="px-8 py-4 font-semibold text-xs tracking-wider uppercase text-muted-foreground">Valor Total</TableHead>
                                                <TableHead className="px-8 py-4 font-semibold text-xs tracking-wider uppercase text-muted-foreground">Data</TableHead>
                                                <TableHead className="px-8 py-4 font-semibold text-xs tracking-wider uppercase text-muted-foreground">Autor</TableHead>
                                                <TableHead className="px-8 py-4 font-semibold text-xs tracking-wider uppercase text-muted-foreground text-right">Ações</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredSimulations.map((sim) => (
                                                <TableRow
                                                    key={sim.id}
                                                    className="group hover:bg-slate-50/80 transition-all border-b border-border/30 last:border-none"
                                                >
                                                    <TableCell className="px-8 py-6">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                                                                {sim.debtorName}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground mt-1 tabular-nums font-mono opacity-60">
                                                                ID: {sim.id.substring(0, 8)}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-8 py-6">
                                                        <span className="text-muted-foreground font-medium">{sim.condominiumName}</span>
                                                    </TableCell>
                                                    <TableCell className="px-8 py-6">
                                                        <span className="font-bold text-[oklch(40%_0.15_180)] bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 shadow-sm">
                                                            {formatarMoeda(sim.totalAmount)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="px-8 py-6">
                                                        <span className="text-muted-foreground tabular-nums whitespace-nowrap">{formatarData(new Date(sim.createdAt))}</span>
                                                    </TableCell>
                                                    <TableCell className="px-8 py-6">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-200 uppercase">
                                                                {sim.createdBy.charAt(0)}
                                                            </div>
                                                            <span className="text-sm font-medium text-slate-600 truncate max-w-[120px]">{sim.createdBy}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-8 py-6 text-right">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDownloadPDF(sim.id);
                                                            }}
                                                            className="hover:bg-primary hover:text-white border-primary/20 text-primary font-bold shadow-sm rounded-lg"
                                                        >
                                                            <Download className="h-4 w-4 mr-2" />
                                                            PDF
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
