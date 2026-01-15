'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FileUpload from '@/components/FileUpload';
import DebtorForm from '@/components/DebtorForm';
import SimulationForm from '@/components/SimulationForm';
import CalculationPreview from '@/components/CalculationPreview';
import InstallmentTable from '@/components/InstallmentTable';
import { Debtor, SimulationParameters, CalculationResult } from '@/types';
import { toast } from 'sonner';

export default function NewSimulationPage() {
    const router = useRouter();
    const [currentTab, setCurrentTab] = useState('upload');
    const [debtor, setDebtor] = useState<Debtor>({
        name: '',
        unit: '',
        block: '',
        condominiumName: '',
        cpf_cnpj: '',
    });
    const [debtAmount, setDebtAmount] = useState(0);
    const [startDate, setStartDate] = useState(new Date());
    const [parameters, setParameters] = useState<SimulationParameters>({
        juros: 1,
        multa: 2,
        honorarios: 10,
        multaQuebraAcordo: 30,
        indiceCorrecao: 0,
        numeroParcelas: 12,
        entrada: 0,
    });
    const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
    const [saving, setSaving] = useState(false);

    const handleFileProcessed = (data: any) => {
        if (data.data) {
            const parsed = data.data;
            setDebtor({
                name: parsed.debtorName || '',
                unit: parsed.unit || '',
                block: '',
                condominiumName: parsed.condominiumName || '',
                cpf_cnpj: parsed.cpf_cnpj || '',
            });
            if (parsed.amount) setDebtAmount(parsed.amount);
            if (parsed.dueDate) setStartDate(new Date(parsed.dueDate));

            toast.success('Arquivo processado com sucesso!');
            setCurrentTab('debtor');
        }
    };

    const handleManualEntry = () => {
        setCurrentTab('debtor');
    };

    const handleSaveSimulation = async () => {
        if (!debtor.name || !debtor.cpf_cnpj || !debtor.unit || !debtor.condominiumName) {
            toast.error('Preencha todos os campos obrigatórios do devedor');
            return;
        }

        if (debtAmount <= 0) {
            toast.error('Informe um valor de dívida válido');
            return;
        }

        setSaving(true);

        try {
            const response = await fetch('/api/simulation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    debtor,
                    debtAmount,
                    startDate: startDate.toISOString(),
                    parameters,
                    calculationResult,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao salvar simulação');
            }

            toast.success('Simulação salva com sucesso!');
            router.push('/dashboard');
        } catch (error: any) {
            toast.error(error.message || 'Erro ao salvar simulação');
        } finally {
            setSaving(false);
        }
    };

    const handleGeneratePDF = () => {
        if (!calculationResult) {
            toast.error('Configure os parâmetros primeiro');
            return;
        }

        // This will be handled by saving first, then downloading
        handleSaveSimulation();
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-center pb-6 border-b border-border">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/dashboard')}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Nova Simulação</h1>
                        <p className="text-sm text-muted-foreground">Criação de acordo de parcelamento</p>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        onClick={handleSaveSimulation}
                        disabled={saving || !calculationResult}
                    >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? 'Salvando...' : 'Salvar'}
                    </Button>
                    <Button
                        onClick={handleGeneratePDF}
                        disabled={!calculationResult}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                        <FileDown className="h-4 w-4 mr-2" />
                        Gerar PDF
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <Tabs value={currentTab} onValueChange={setCurrentTab}>
                {/* Tabs List - keeping simpler look */}
                <TabsList className="grid w-full grid-cols-3 mb-8 bg-secondary/50 p-1 rounded-xl">
                    <TabsTrigger value="upload" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">1. Upload / Entrada</TabsTrigger>
                    <TabsTrigger value="debtor" disabled={!debtor.name && debtAmount === 0} className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        2. Dados do Devedor
                    </TabsTrigger>
                    <TabsTrigger value="simulation" disabled={!debtor.name || debtAmount === 0} className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        3. Simulação
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card>
                        <CardHeader>
                            <CardTitle>Importar Dados</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FileUpload onFileProcessed={handleFileProcessed} />
                            <div className="text-center">
                                <div className="relative py-4">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-border"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-card text-muted-foreground">ou</span>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={handleManualEntry}
                                    className="w-full md:w-auto"
                                >
                                    Preencher Manualmente
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="debtor" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <DebtorForm debtor={debtor} onChange={setDebtor} />

                    <Card>
                        <CardHeader>
                            <CardTitle>Dados da Dívida</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Valor Principal (R$) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={debtAmount}
                                        onChange={(e) => setDebtAmount(parseFloat(e.target.value) || 0)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Data de Vencimento Original *</label>
                                    <input
                                        type="date"
                                        value={startDate.toISOString().split('T')[0]}
                                        onChange={(e) => setStartDate(new Date(e.target.value))}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end">
                                <Button onClick={() => setCurrentTab('simulation')} className="w-full md:w-auto">
                                    Continuar para Simulação
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="simulation" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        <div className="xl:col-span-2 space-y-6">
                            <SimulationForm
                                parameters={parameters}
                                debtAmount={debtAmount}
                                startDate={startDate}
                                onChange={setParameters}
                                onCalculationUpdate={setCalculationResult}
                            />

                            {calculationResult && calculationResult.installments.length > 0 && (
                                <InstallmentTable installments={calculationResult.installments} />
                            )}
                        </div>

                        <div>
                            <CalculationPreview result={calculationResult} />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
