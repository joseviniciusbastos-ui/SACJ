import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const simulations = await prisma.simulation.findMany({
            include: {
                debtor: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        const formattedSimulations = simulations.map((sim) => {
            const params = JSON.parse(sim.parameters_json);
            return {
                id: sim.id,
                debtorName: sim.debtor.name,
                condominiumName: sim.debtor.condominiumName,
                totalAmount: sim.debtAmount,
                createdAt: sim.createdAt,
            };
        });

        return NextResponse.json({ simulations: formattedSimulations });
    } catch (error) {
        console.error('Error fetching simulations:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar simulações' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const { debtor, debtAmount, startDate, parameters, calculationResult } = await req.json();

        // Create or find debtor
        let debtorRecord = await prisma.debtor.findFirst({
            where: {
                cpf_cnpj: debtor.cpf_cnpj,
            },
        });

        if (!debtorRecord) {
            debtorRecord = await prisma.debtor.create({
                data: {
                    name: debtor.name,
                    unit: debtor.unit,
                    block: debtor.block || null,
                    condominiumName: debtor.condominiumName,
                    cpf_cnpj: debtor.cpf_cnpj,
                },
            });
        }

        // Create simulation
        const simulation = await prisma.simulation.create({
            data: {
                debtorId: debtorRecord.id,
                debtAmount: parseFloat(debtAmount.toString()),
                startDate: new Date(startDate),
                agreementDate: new Date(),
                parameters_json: JSON.stringify(parameters),
                status: 'active',
            },
        });

        // Create installments
        if (calculationResult?.installments) {
            await Promise.all(
                calculationResult.installments.map((inst: any) =>
                    prisma.installment.create({
                        data: {
                            simulationId: simulation.id,
                            number: inst.number,
                            dueDate: new Date(inst.dueDate),
                            amount: parseFloat(inst.amount.toString()),
                            status: 'pending',
                        },
                    })
                )
            );
        }

        return NextResponse.json({ success: true, simulationId: simulation.id });
    } catch (error) {
        console.error('Error creating simulation:', error);
        return NextResponse.json(
            { error: 'Erro ao criar simulação' },
            { status: 500 }
        );
    }
}
