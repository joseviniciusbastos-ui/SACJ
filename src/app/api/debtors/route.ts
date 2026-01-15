import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const debtors = await prisma.debtor.findMany({
            include: {
                simulations: {
                    select: {
                        id: true,
                        debtAmount: true,
                        status: true,
                        createdAt: true,
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });

        const formattedDebtors = debtors.map(debtor => {
            const totalDebt = debtor.simulations.reduce((sum, sim) => sum + sim.debtAmount, 0);
            return {
                ...debtor,
                simulationCount: debtor.simulations.length,
                totalDebt,
                lastSimulation: debtor.simulations[0]?.createdAt || null
            };
        });

        return NextResponse.json({ debtors: formattedDebtors });
    } catch (error) {
        console.error('Error fetching debtors:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar devedores' },
            { status: 500 }
        );
    }
}
