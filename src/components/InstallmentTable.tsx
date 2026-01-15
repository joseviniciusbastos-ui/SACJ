'use client';

import React from 'react';
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

interface InstallmentTableProps {
    installments: {
        number: number;
        dueDate: Date;
        amount: number;
    }[];
}

export default function InstallmentTable({ installments }: InstallmentTableProps) {
    if (installments.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Cronograma de Parcelas</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Parcela</TableHead>
                                <TableHead>Vencimento</TableHead>
                                <TableHead className="text-right">Valor</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {installments.map((inst) => (
                                <TableRow key={inst.number}>
                                    <TableCell className="font-medium">
                                        Parcela {inst.number.toString().padStart(2, '0')}
                                    </TableCell>
                                    <TableCell>{formatarData(inst.dueDate)}</TableCell>
                                    <TableCell className="text-right font-medium">
                                        {formatarMoeda(inst.amount)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
