'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, FileDown, CheckCircle2 } from 'lucide-react';
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
import DashboardLayout from '@/components/DashboardLayout';
import { cn } from '@/lib/utils';

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
    const [debtItems, setDebtItems] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);

    const handleFileProcessed = (data: any) => {
        if (data.data) {
            const parsed = data.data;
            console.log('Dados processados recebidos:', parsed);

            setDebtor({
                name: parsed.debtorName || '',
                unit: parsed.unit || '',
                block: parsed.block || '',
                condominiumName: parsed.condominiumName || '',
                cpf_cnpj: parsed.cpf_cnpj || '',
            });

            if (parsed.amount !== undefined) {
                setDebtAmount(parsed.amount);
            } else if (parsed.debtItems && parsed.debtItems.length > 0) {
                // Soma os itens se não tiver o total explícito
                const total = parsed.debtItems.reduce((acc: number, item: any) => acc + item.amount, 0);
                setDebtAmount(total);
            }

            if (parsed.dueDate) {
                setStartDate(new Date(parsed.dueDate));
            } else if (parsed.debtItems && parsed.debtItems.length > 0) {
                // Pega o vencimento mais antigo dos itens
                const oldestDate = new Date(Math.min(...parsed.debtItems.map((it: any) => new Date(it.dueDate).getTime())));
                setStartDate(oldestDate);
            }

            if (parsed.debtItems) setDebtItems(parsed.debtItems);

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
        handleSaveSimulation();
    };

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push('/dashboard')}
                            className="bg-white/50 hover:bg-white text-muted-foreground rounded-xl shadow-sm border border-border/20"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Nova Simulação</h1>
                            <p className="text-muted-foreground mt-0.5">Siga os passos para gerar o acordo profissional.</p>
                        </div>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            onClick={handleSaveSimulation}
                            disabled={saving || !calculationResult}
                            className="flex-1 sm:flex-none border-primary/20 text-primary font-bold bg-white/50 rounded-xl"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {saving ? 'Salvando...' : 'Salvar'}
                        </Button>
                        <Button
                            onClick={handleGeneratePDF}
                            disabled={!calculationResult}
                            className="flex-1 sm:flex-none bg-[oklch(30%_0.1_230)] hover:bg-[oklch(40%_0.1_230)] text-white shadow-lg shadow-blue-500/20 rounded-xl font-bold"
                        >
                            <FileDown className="h-4 w-4 mr-2" />
                            Gerar PDF
                        </Button>
                    </div>
                </div>

                {/* Steps / Tabs */}
                <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-10 h-16 bg-white/40 backdrop-blur-sm p-1.5 rounded-2xl border border-white/20 shadow-inner">
                        <TabsTrigger
                            value="upload"
                            className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg font-bold text-sm premium-transition"
                        >
                            <span className="mr-2 opacity-50">01</span>
                            Importação
                            {currentTab !== 'upload' && <CheckCircle2 className="ml-2 h-4 w-4 text-emerald-500" />}
                        </TabsTrigger>
                        <TabsTrigger
                            value="debtor"
                            disabled={!debtor.name && debtAmount === 0}
                            className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg font-bold text-sm premium-transition"
                        >
                            <span className="mr-2 opacity-50">02</span>
                            Devedor
                            {currentTab === 'simulation' && <CheckCircle2 className="ml-2 h-4 w-4 text-emerald-500" />}
                        </TabsTrigger>
                        <TabsTrigger
                            value="simulation"
                            disabled={!debtor.name || debtAmount === 0}
                            className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg font-bold text-sm premium-transition"
                        >
                            <span className="mr-2 opacity-50">03</span>
                            Simulação
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="upload" className="space-y-6 focus-visible:outline-none">
                        <Card className="border-none shadow-2xl bg-white rounded-3xl overflow-hidden">
                            <CardHeader className="p-8 border-b border-border/30 bg-slate-50/50">
                                <CardTitle className="text-2xl font-bold tracking-tight">Comece pelo o arquivo</CardTitle>
                                <p className="text-muted-foreground">Arraste o documento da dívida ou preencha manualmente para automatizar os cálculos.</p>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                <FileUpload onFileProcessed={handleFileProcessed} />
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-border/50"></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                                        <span className="px-6 bg-white text-muted-foreground/50">ou</span>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={handleManualEntry}
                                        className="rounded-2xl border-dashed border-2 px-12 hover:border-primary hover:text-primary transition-all bg-slate-50/50"
                                    >
                                        Preencher Tudo Manualmente
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="debtor" className="space-y-6 focus-visible:outline-none">
                        <DebtorForm debtor={debtor} onChange={setDebtor} />

                        <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
                            <CardHeader className="bg-slate-50/50 border-b border-border/30 p-8">
                                <CardTitle className="text-xl font-bold tracking-tight">Detalhes da Dívida Original</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-foreground">Valor Principal da Dívida (R$)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={debtAmount}
                                            onChange={(e) => setDebtAmount(parseFloat(e.target.value) || 0)}
                                            className="w-full bg-slate-50/50 border border-border/50 rounded-xl px-4 py-3 text-lg font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-foreground">Vencimento Original</label>
                                        <input
                                            type="date"
                                            value={startDate.toISOString().split('T')[0]}
                                            onChange={(e) => setStartDate(new Date(e.target.value))}
                                            className="w-full bg-slate-50/50 border border-border/50 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                {debtItems.length > 0 && (
                                    <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                                        <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                                            <CheckCircle2 className="text-emerald-500 h-4 w-4" />
                                            Itens extraídos do arquivo ({debtItems.length})
                                        </h4>
                                        <div className="space-y-2">
                                            {debtItems.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-sm py-2 border-b border-slate-200 last:border-none">
                                                    <span className="text-slate-600 font-medium">{item.description}</span>
                                                    <div className="flex gap-4">
                                                        <span className="text-slate-400 font-mono">{new Date(item.dueDate).toLocaleDateString('pt-BR')}</span>
                                                        <span className="font-bold text-slate-900">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.amount)}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-10 flex justify-end">
                                    <Button
                                        onClick={() => setCurrentTab('simulation')}
                                        size="lg"
                                        className="rounded-xl px-10 bg-primary shadow-lg shadow-primary/20"
                                    >
                                        Próximo Passo: Simulação
                                        <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="simulation" className="space-y-6 focus-visible:outline-none">
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                            <div className="xl:col-span-2 space-y-8">
                                <SimulationForm
                                    parameters={parameters}
                                    debtAmount={debtAmount}
                                    startDate={startDate}
                                    debtItems={debtItems}
                                    onChange={setParameters}
                                    onCalculationUpdate={setCalculationResult}
                                />

                                {calculationResult && calculationResult.installments.length > 0 && (
                                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                                        <InstallmentTable installments={calculationResult.installments} />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                <div className="sticky top-8">
                                    <CalculationPreview result={calculationResult} />

                                    <div className="mt-6 bg-blue-50 p-6 rounded-3xl border border-blue-100 flex items-start space-x-4">
                                        <CheckCircle2 className="h-6 w-6 text-blue-500 mt-1 shrink-0" />
                                        <div>
                                            <p className="text-sm font-bold text-blue-900 mb-1">Pronto para gerar!</p>
                                            <p className="text-xs text-blue-700 leading-relaxed">
                                                Revise os valores ao lado. Após salvar, o PDF será gerado automaticamente com todas as cláusulas legais.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout >
    );
}
