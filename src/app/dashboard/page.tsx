'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Plus, Download, Search, FileText, LogOut } from 'lucide-react';
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

interface SimulationListItem {
    id: string;
    debtorName: string;
    condominiumName: string;
    totalAmount: number;
    createdAt: string;
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
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
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
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-border">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
                    <p className="text-sm text-muted-foreground">Visão geral e gerenciamento</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-foreground">{session?.user?.name}</p>
                        <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
                    </div>
                    <Button
                        onClick={() => router.push('/simulation/new')}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Simulação
                    </Button>
                </div>
            </div>

            {/* Metrics/Content Area */}
            <div className="space-y-6">
                {/* Search */}
                <Card className="shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                            <Search className="h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por devedor, condomínio ou CPF..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1 border-none shadow-none focus-visible:ring-0 px-0 placeholder:text-muted-foreground/50"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Simulations List */}
                <Card className="border-border/50 shadow-md">
                    <CardHeader>
                        <CardTitle>Histórico de Simulações</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="text-muted-foreground animate-pulse">Carregando dados...</div>
                            </div>
                        ) : filteredSimulations.length === 0 ? (
                            <div className="text-center py-16 bg-secondary/20 rounded-lg border border-dashed border-border">
                                <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                                <p className="text-foreground font-medium mb-1">Nenhuma simulação encontrada</p>
                                <p className="text-sm text-muted-foreground mb-6">
                                    {searchTerm
                                        ? 'Tente ajustar os termos da busca'
                                        : 'Comece criando seu primeiro acordo agora mesmo'}
                                </p>
                                {!searchTerm && (
                                    <Button
                                        variant="outline"
                                        onClick={() => router.push('/simulation/new')}
                                    >
                                        Criar Simulação
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="rounded-lg border border-border overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-secondary/50">
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="w-[30%]">Devedor</TableHead>
                                            <TableHead className="w-[25%]">Condomínio</TableHead>
                                            <TableHead>Valor Total</TableHead>
                                            <TableHead>Data</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredSimulations.map((sim) => (
                                            <TableRow key={sim.id} className="cursor-pointer hover:bg-secondary/30 transition-colors">
                                                <TableCell className="font-medium text-foreground">{sim.debtorName}</TableCell>
                                                <TableCell className="text-muted-foreground">{sim.condominiumName}</TableCell>
                                                <TableCell className="font-medium text-foreground">
                                                    {formatarMoeda(sim.totalAmount)}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">{formatarData(new Date(sim.createdAt))}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDownloadPDF(sim.id);
                                                        }}
                                                        className="text-muted-foreground hover:text-primary"
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
    );
}
