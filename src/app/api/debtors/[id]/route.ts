import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Não autorizado. Apenas administradores podem excluir registros.' }, { status: 403 });
        }

        const { id } = await params;

        // Fetch debtor info for the log before deleting
        const debtor = await prisma.debtor.findUnique({
            where: { id },
            include: { simulations: true }
        });

        if (!debtor) {
            return NextResponse.json({ error: 'Devedor não encontrado' }, { status: 404 });
        }

        // Create Audit Log
        await prisma.auditLog.create({
            data: {
                action: 'DELETE_DEBTOR',
                entityType: 'DEBTOR',
                entityId: id,
                details: JSON.stringify({
                    name: debtor.name,
                    cpf_cnpj: debtor.cpf_cnpj,
                    simulationCount: debtor.simulations.length
                }),
                userId: (session.user as any).id
            }
        });

        // Delete the debtor (simulations and installments are deleted via Cascade in Prisma)
        await prisma.debtor.delete({
            where: { id }
        });

        return NextResponse.json({ success: true, message: 'Registro excluído e auditado.' });
    } catch (error) {
        console.error('Error deleting debtor:', error);
        return NextResponse.json(
            { error: 'Erro ao excluir devedor' },
            { status: 500 }
        );
    }
}
