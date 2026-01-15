import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Simulation, Debtor, Installment } from '../types';
import { formatarMoeda, formatarData } from './calculations';

export interface PDFData {
    simulation: Simulation;
    debtor: Debtor;
    installments: Installment[];
    calculationResult: {
        principal: number;
        multa: number;
        juros: number;
        correcao: number;
        honorarios: number;
        totalAcordo: number;
        valorEntrada: number;
    };
}

export function generateAgreementPDF(data: PDFData): jsPDF {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPosition = 20;

    // Header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('MINUTA DE ACORDO DE PARCELAMENTO', pageWidth / 2, yPosition, {
        align: 'center',
    });

    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const now = new Date();
    doc.text(
        `Gerado em: ${formatarData(now)} às ${now.toLocaleTimeString('pt-BR')}`,
        pageWidth / 2,
        yPosition,
        { align: 'center' }
    );

    yPosition += 5;
    doc.text(
        `Simulação Nº: ${data.simulation.id?.substring(0, 8)}`,
        pageWidth / 2,
        yPosition,
        { align: 'center' }
    );

    yPosition += 15;

    // Debtor and Creditor Information
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DO DEVEDOR', 14, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nome: ${data.debtor.name}`, 14, yPosition);
    yPosition += 5;
    doc.text(
        `Unidade: ${data.debtor.unit}${data.debtor.block ? ` - Bloco ${data.debtor.block}` : ''}`,
        14,
        yPosition
    );
    yPosition += 5;
    doc.text(`CPF/CNPJ: ${data.debtor.cpf_cnpj}`, 14, yPosition);
    yPosition += 7;

    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DO CREDOR', 14, yPosition);
    yPosition += 7;

    doc.setFont('helvetica', 'normal');
    doc.text(`Condomínio: ${data.debtor.condominiumName}`, 14, yPosition);
    yPosition += 10;

    // Original Debt Breakdown
    doc.setFont('helvetica', 'bold');
    doc.text('DISCRIMINAÇÃO DA DÍVIDA ORIGINAL', 14, yPosition);
    yPosition += 5;

    autoTable(doc, {
        startY: yPosition,
        head: [['Descrição', 'Valor']],
        body: [
            ['Valor Principal', formatarMoeda(data.calculationResult.principal)],
            ['Multa Moratória', formatarMoeda(data.calculationResult.multa)],
            ['Juros de Mora', formatarMoeda(data.calculationResult.juros)],
            ['Correção Monetária', formatarMoeda(data.calculationResult.correcao)],
            ['Honorários Advocatícios', formatarMoeda(data.calculationResult.honorarios)],
        ],
        foot: [['TOTAL DA DÍVIDA', formatarMoeda(data.calculationResult.totalAcordo)]],
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [71, 85, 105] },
        footStyles: { fillColor: [71, 85, 105], fontStyle: 'bold' },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;

    // Agreement Summary
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMO DO ACORDO', 14, yPosition);
    yPosition += 7;

    doc.setFont('helvetica', 'normal');
    doc.text(
        `Total do Acordo: ${formatarMoeda(data.calculationResult.totalAcordo)}`,
        14,
        yPosition
    );
    yPosition += 5;
    doc.text(
        `Entrada: ${formatarMoeda(data.calculationResult.valorEntrada)}`,
        14,
        yPosition
    );
    yPosition += 5;
    doc.text(`Número de Parcelas: ${data.installments.length}`, 14, yPosition);
    yPosition += 5;
    if (data.installments.length > 0) {
        doc.text(
            `Valor da Parcela: ${formatarMoeda(data.installments[0].amount)}`,
            14,
            yPosition
        );
    }
    yPosition += 10;

    // Payment Schedule
    doc.setFont('helvetica', 'bold');
    doc.text('CRONOGRAMA DE PAGAMENTO', 14, yPosition);
    yPosition += 5;

    const installmentRows = data.installments.map((inst) => [
        `Parcela ${inst.number}`,
        formatarData(inst.dueDate),
        formatarMoeda(inst.amount),
    ]);

    autoTable(doc, {
        startY: yPosition,
        head: [['Parcela', 'Vencimento', 'Valor']],
        body: installmentRows,
        theme: 'grid',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [71, 85, 105] },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;

    // Legal Clauses (add new page if needed)
    if (yPosition > 230) {
        doc.addPage();
        yPosition = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.text('CLÁUSULAS DO ACORDO', 14, yPosition);
    yPosition += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    const clauses = [
        '1. O devedor compromete-se a efetuar o pagamento da entrada e das parcelas nas datas estabelecidas no cronograma acima.',
        '2. Em caso de inadimplemento de qualquer parcela, será aplicada multa de 30% (trinta por cento) sobre o saldo devedor remanescente.',
        '3. O atraso no pagamento superior a 30 (trinta) dias implicará no vencimento antecipado de todas as parcelas.',
        '4. O presente acordo é celebrado de forma irrevogável e irretratável.',
    ];

    clauses.forEach((clause) => {
        const lines = doc.splitTextToSize(clause, pageWidth - 28);
        doc.text(lines, 14, yPosition);
        yPosition += lines.length * 5;
    });

    yPosition += 10;

    // Signature Section
    if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
    }

    yPosition += 10;
    const city = 'São Paulo'; // Could be dynamic
    doc.text(
        `${city}, ${formatarData(new Date())}`,
        pageWidth / 2,
        yPosition,
        { align: 'center' }
    );

    yPosition += 20;
    doc.line(40, yPosition, 90, yPosition);
    doc.line(120, yPosition, 170, yPosition);

    yPosition += 5;
    doc.text('Devedor', 65, yPosition, { align: 'center' });
    doc.text('Credor', 145, yPosition, { align: 'center' });

    return doc;
}
