import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateAgreementPDF } from '@/lib/pdfGenerator';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const simulation = await prisma.simulation.findUnique({
            where: { id },
            include: {
                debtor: true,
                installments: {
                    orderBy: { number: 'asc' },
                },
            },
        });

        if (!simulation) {
            return NextResponse.json(
                { error: 'Simulação não encontrada' },
                { status: 404 }
            );
        }

        const parameters = JSON.parse(simulation.parameters_json);

        // Calculate result from parameters
        const subtotal = simulation.debtAmount * (1 + parameters.multa / 100 + parameters.indiceCorrecao / 100);
        const jurosTotal = simulation.debtAmount * (parameters.juros / 100);
        const totalComJuros = subtotal + jurosTotal;
        const honorarios = totalComJuros * (parameters.honorarios / 100);
        const totalAcordo = totalComJuros + honorarios;

        const calculationResult = {
            principal: simulation.debtAmount,
            multa: simulation.debtAmount * (parameters.multa / 100),
            juros: jurosTotal,
            correcao: simulation.debtAmount * (parameters.indiceCorrecao / 100),
            honorarios: honorarios,
            totalAcordo: totalAcordo,
            valorEntrada: parameters.entrada,
        };

        const pdfData = {
            simulation: {
                id: simulation.id,
                debtorId: simulation.debtorId,
                debtAmount: simulation.debtAmount,
                startDate: simulation.startDate,
                agreementDate: simulation.agreementDate,
                parameters_json: simulation.parameters_json,
                status: simulation.status,
            },
            debtor: simulation.debtor,
            installments: simulation.installments,
            calculationResult,
        };

        const doc = generateAgreementPDF(pdfData as any);
        const pdfBuffer = doc.output('arraybuffer');

        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="acordo_${simulation.id}.pdf"`,
            },
        });
    } catch (error) {
        console.error('Error generating PDF:', error);
        return NextResponse.json(
            { error: 'Erro ao gerar PDF' },
            { status: 500 }
        );
    }
}
