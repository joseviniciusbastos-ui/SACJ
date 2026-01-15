'use client';

import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SimulationParameters } from '@/types';
import { calcularTotalAcordo, formatarMoeda } from '@/lib/calculations';

interface SimulationFormProps {
    parameters: SimulationParameters;
    debtAmount: number;
    startDate: Date;
    onChange: (params: SimulationParameters) => void;
    onCalculationUpdate: (result: any) => void;
}

export default function SimulationForm({
    parameters,
    debtAmount,
    startDate,
    onChange,
    onCalculationUpdate,
}: SimulationFormProps) {
    const [agreementDate, setAgreementDate] = useState(new Date());

    const handleChange = (field: keyof SimulationParameters, value: number) => {
        const updated = { ...parameters, [field]: value };
        onChange(updated);
    };

    useEffect(() => {
        // Recalculate whenever parameters change
        if (debtAmount > 0) {
            const result = calcularTotalAcordo(debtAmount, startDate, agreementDate, parameters);
            onCalculationUpdate(result);
        }
    }, [parameters, debtAmount, startDate, agreementDate]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Parâmetros do Acordo</CardTitle>
                <CardDescription>
                    Configure os parâmetros financeiros e jurídicos do acordo
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="debtAmount">Valor Principal *</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-slate-500">R$</span>
                            <Input
                                id="debtAmount"
                                type="number"
                                step="0.01"
                                value={debtAmount}
                                disabled
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="startDate">Data de Vencimento Original *</Label>
                        <Input
                            id="startDate"
                            type="date"
                            value={startDate.toISOString().split('T')[0]}
                            disabled
                        />
                    </div>
                </div>

                <div className="border-t pt-4">
                    <h3 className="font-medium text-slate-900 mb-4">Taxas e Encargos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="multa">Multa Moratória (%)</Label>
                            <Input
                                id="multa"
                                type="number"
                                step="0.01"
                                value={parameters.multa}
                                onChange={(e) => handleChange('multa', parseFloat(e.target.value) || 0)}
                                placeholder="2.00"
                            />
                            <p className="text-xs text-slate-500">Padrão: 2%</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="juros">Juros de Mora (% a.m.)</Label>
                            <Input
                                id="juros"
                                type="number"
                                step="0.01"
                                value={parameters.juros}
                                onChange={(e) => handleChange('juros', parseFloat(e.target.value) || 0)}
                                placeholder="1.00"
                            />
                            <p className="text-xs text-slate-500">Padrão: 1% ao mês pro-rata</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="indiceCorrecao">Correção Monetária (%)</Label>
                            <Input
                                id="indiceCorrecao"
                                type="number"
                                step="0.01"
                                value={parameters.indiceCorrecao}
                                onChange={(e) => handleChange('indiceCorrecao', parseFloat(e.target.value) || 0)}
                                placeholder="0.00"
                            />
                            <p className="text-xs text-slate-500">Índice acumulado (IPCA, IGP-M, etc.)</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="honorarios">Honorários Advocatícios (%)</Label>
                            <Input
                                id="honorarios"
                                type="number"
                                step="0.01"
                                value={parameters.honorarios}
                                onChange={(e) => handleChange('honorarios', parseFloat(e.target.value) || 0)}
                                placeholder="10.00"
                            />
                            <p className="text-xs text-slate-500">Padrão: 10%</p>
                        </div>
                    </div>
                </div>

                <div className="border-t pt-4">
                    <h3 className="font-medium text-slate-900 mb-4">Parcelamento</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="entrada">Valor de Entrada (R$)</Label>
                            <Input
                                id="entrada"
                                type="number"
                                step="0.01"
                                value={parameters.entrada}
                                onChange={(e) => handleChange('entrada', parseFloat(e.target.value) || 0)}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="numeroParcelas">Número de Parcelas</Label>
                            <Input
                                id="numeroParcelas"
                                type="number"
                                min="1"
                                max="60"
                                value={parameters.numeroParcelas}
                                onChange={(e) => handleChange('numeroParcelas', parseInt(e.target.value) || 1)}
                                placeholder="12"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="multaQuebraAcordo">Multa Quebra Acordo (%)</Label>
                            <Input
                                id="multaQuebraAcordo"
                                type="number"
                                step="0.01"
                                value={parameters.multaQuebraAcordo}
                                onChange={(e) => handleChange('multaQuebraAcordo', parseFloat(e.target.value) || 0)}
                                placeholder="30.00"
                            />
                            <p className="text-xs text-slate-500">Padrão: 30%</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
