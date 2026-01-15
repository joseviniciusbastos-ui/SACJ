'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Debtor } from '@/types';

interface DebtorFormProps {
    debtor: Debtor;
    onChange: (debtor: Debtor) => void;
}

export default function DebtorForm({ debtor, onChange }: DebtorFormProps) {
    const formatCpfCnpj = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 14);
        if (digits.length <= 11) {
            return digits
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        }
        return digits
            .replace(/^(\d{2})(\d)/, '$1.$2')
            .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2');
    };

    const handleChange = (field: keyof Debtor, value: string) => {
        if (field === 'cpf_cnpj') {
            const formatted = formatCpfCnpj(value);
            onChange({ ...debtor, [field]: formatted });
        } else {
            onChange({ ...debtor, [field]: value });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Dados do Devedor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo *</Label>
                        <Input
                            id="name"
                            value={debtor.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            placeholder="Nome do devedor"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cpf_cnpj">CPF/CNPJ *</Label>
                        <Input
                            id="cpf_cnpj"
                            value={debtor.cpf_cnpj}
                            onChange={(e) => handleChange('cpf_cnpj', e.target.value)}
                            placeholder="000.000.000-00 ou 00.000.000/0000-00"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="condominiumName">Condomínio *</Label>
                        <Input
                            id="condominiumName"
                            value={debtor.condominiumName}
                            onChange={(e) => handleChange('condominiumName', e.target.value)}
                            placeholder="Nome do condomínio"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="unit">Unidade *</Label>
                        <Input
                            id="unit"
                            value={debtor.unit}
                            onChange={(e) => handleChange('unit', e.target.value)}
                            placeholder="Ex: 101"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="block">Bloco</Label>
                        <Input
                            id="block"
                            value={debtor.block || ''}
                            onChange={(e) => handleChange('block', e.target.value)}
                            placeholder="Ex: A (opcional)"
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
