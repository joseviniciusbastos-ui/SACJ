import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        // @ts-ignore
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const { email, role } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

        const invitation = await prisma.invitation.create({
            data: {
                email,
                role: role || 'OPERATOR',
                token,
                expiresAt,
                createdById: (session.user as any).id,
            },
        });

        // In a real app, you would send an email here.
        // We will return the link for the user to copy.
        const inviteLink = `${req.nextUrl.origin}/register?token=${token}`;

        return NextResponse.json({ success: true, inviteLink });
    } catch (error) {
        console.error('Error inviting user:', error);
        return NextResponse.json(
            { error: 'Erro ao convidar usuário' },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        // @ts-ignore
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const invitations = await prisma.invitation.findMany({
            include: {
                creator: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ invitations });
    } catch (error) {
        console.error('Error fetching invitations:', error);
        return NextResponse.json({ error: 'Erro ao buscar convites' }, { status: 500 });
    }
}
