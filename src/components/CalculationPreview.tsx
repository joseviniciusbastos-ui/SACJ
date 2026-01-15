'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalculationResult } from '@/types';
import { formatarMoeda } from '@/lib/calculations';

interface CalculationPreviewProps {
    result: CalculationResult | null;
}

export default function CalculationPreview({ result }: CalculationPreviewProps) {
    if (!result) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Prévia do Cálculo</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-500">
                        Configure os parâmetros para ver a prévia do cálculo
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100">
            <CardHeader>
                <CardTitle>Prévia do Cálculo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Valor Principal:</span>
                        <span className="font-medium">{formatarMoeda(result.principal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Multa Moratória:</span>
                        <span className="font-medium">{formatarMoeda(result.multa)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Juros de Mora:</span>
                        <span className="font-medium">{formatarMoeda(result.juros)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Correção Monetária:</span>
                        <span className="font-medium">{formatarMoeda(result.correcao)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Honorários Advocatícios:</span>
                        <span className="font-medium">{formatarMoeda(result.honorarios)}</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between text-lg font-bold">
                            <span className="text-slate-900">Total do Acordo:</span>
                            <span className="text-slate-900">{formatarMoeda(result.totalAcordo)}</span>
                        </div>
                    </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                    <h3 className="font-medium text-slate-900 mb-2">Parcelamento</h3>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Entrada:</span>
                        <span className="font-medium">{formatarMoeda(result.valorEntrada)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Parcelas:</span>
                        <span className="font-medium">
                            {result.numeroParcelas}x de {formatarMoeda(result.valorParcela)}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
