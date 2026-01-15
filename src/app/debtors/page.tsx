'use client';

import React, { useState, useEffect } from 'react';
import {
    Users,
    Search,
    FileText,
    History,
    Download,
    ChevronRight,
    Building2,
    Calendar,
    DollarSign
} from 'lucide-react';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { formatarMoeda, formatarData } from '@/lib/calculations';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'sonner';

interface DebtorListItem {
    id: string;
    name: string;
    unit: string;
    block: string | null;
    condominiumName: string;
    cpf_cnpj: string;
    simulationCount: number;
    totalDebt: number;
    lastSimulation: string | null;
    simulations: any[];
}

export default function DebtorsPage() {
    const [debtors, setDebtors] = useState<DebtorListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDebtor, setSelectedDebtor] = useState<DebtorListItem | null>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    useEffect(() => {
        fetchDebtors();
    }, []);

    const fetchDebtors = async () => {
        try {
            const response = await fetch('/api/debtors');
            const data = await response.json();
            setDebtors(data.debtors || []);
        } catch (error) {
            console.error('Error fetching debtors:', error);
            toast.error('Erro ao carregar lista de devedores');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async (simulationId: string) => {
        try {
            const response = await fetch(`/api/pdf/${simulationId}`);
            if (!response.ok) throw new Error('Erro ao baixar PDF');
            const blob = await response.blob();
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
            toast.error('Erro ao baixar o arquivo');
        }
    };

    const filteredDebtors = debtors.filter(
        (d) =>
            d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.condominiumName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.cpf_cnpj.includes(searchTerm)
    );

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-in fade-in duration-700">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
                            Gestão de Devedores
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Acompanhe o histórico e gerencie acordos de cada unidade.
                        </p>
                    </div>
                    <div className="bg-primary/5 px-6 py-3 rounded-2xl border border-primary/10 flex items-center gap-4">
                        <Users className="h-6 w-6 text-primary" />
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase">Total Base</p>
                            <p className="text-xl font-black text-primary">{debtors.length} Devedores</p>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm rounded-2xl overflow-hidden">
                    <CardContent className="p-2">
                        <div className="flex items-center space-x-4 px-4 py-2">
                            <Search className="h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nome, CPF ou condomínio..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1 border-none shadow-none focus-visible:ring-0 bg-transparent text-lg placeholder:text-muted-foreground/40"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Debtors List */}
                <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-24">
                                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                                <div className="text-muted-foreground font-medium">Carregando base de dados...</div>
                            </div>
                        ) : filteredDebtors.length === 0 ? (
                            <div className="text-center py-24">
                                <Users className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                                <p className="text-lg font-medium text-muted-foreground">Nenhum devedor encontrado.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-slate-50/50">
                                        <TableRow className="border-none">
                                            <TableHead className="px-8 py-5">Devedor</TableHead>
                                            <TableHead className="px-8 py-5">Unidade / Condomínio</TableHead>
                                            <TableHead className="px-8 py-5">Simulações</TableHead>
                                            <TableHead className="px-8 py-5">Dívida Acumulada</TableHead>
                                            <TableHead className="px-8 py-5 text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredDebtors.map((debtor) => (
                                            <TableRow key={debtor.id} className="group hover:bg-slate-50 transition-all border-b border-border/30 last:border-none">
                                                <TableCell className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-foreground text-lg">{debtor.name}</span>
                                                        <span className="text-xs text-muted-foreground font-medium tabular-nums opacity-70">CPF/CNPJ: {debtor.cpf_cnpj}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                                                            <Building2 className="h-4 w-4 text-muted-foreground" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-foreground">{debtor.unit} {debtor.block ? `- ${debtor.block}` : ''}</span>
                                                            <span className="text-xs text-muted-foreground">{debtor.condominiumName}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-8 py-6">
                                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[oklch(30%_0.1_230)]/10 text-[oklch(30%_0.1_230)] font-bold text-sm">
                                                        {debtor.simulationCount}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-8 py-6">
                                                    <span className="font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                                                        {formatarMoeda(debtor.totalDebt)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-8 py-6 text-right">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedDebtor(debtor);
                                                            setIsHistoryOpen(true);
                                                        }}
                                                        className="hover:bg-primary shadow-sm hover:text-white rounded-xl font-bold"
                                                    >
                                                        <History className="h-4 w-4 mr-2" />
                                                        Ver Histórico
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

                {/* History Modal */}
                <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto rounded-[32px] p-0 border-none shadow-2xl overflow-hidden">
                        <div className="bg-primary p-8 text-white relative overflow-hidden">
                            <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 blur-[80px] rounded-full" />
                            <DialogHeader>
                                <DialogTitle className="text-3xl font-black mb-1">Histórico de Simulações</DialogTitle>
                                <DialogDescription className="text-primary-foreground/80 font-medium text-lg">
                                    {selectedDebtor?.name} • Unidade {selectedDebtor?.unit}
                                </DialogDescription>
                            </DialogHeader>
                        </div>
                        <div className="p-8">
                            <div className="space-y-6">
                                {selectedDebtor?.simulations.map((sim, index) => (
                                    <div key={sim.id} className="group flex items-center justify-between p-6 bg-slate-50 hover:bg-white rounded-2xl border border-border/50 hover:shadow-xl hover:border-primary/20 transition-all duration-300">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary font-bold">
                                                #{index + 1}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    <p className="font-bold text-slate-900">{formatarData(new Date(sim.createdAt))}</p>
                                                    <span className={`text-[10px] uppercase tracking-wider font-black px-2 py-0.5 rounded-full ${sim.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                                                        {sim.status === 'active' ? 'Ativa' : sim.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                    <p className="text-xl font-black text-slate-900">{formatarMoeda(sim.debtAmount)}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="secondary"
                                            onClick={() => handleDownloadPDF(sim.id)}
                                            className="bg-white hover:bg-primary hover:text-white shadow-sm rounded-xl font-bold border-border/40"
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Baixar PDF
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}
