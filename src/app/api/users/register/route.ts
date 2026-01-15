import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
    try {
        const { email, password, name, token } = await req.json();

        if (!token) {
            return NextResponse.json({ error: 'Token de convite é obrigatório' }, { status: 400 });
        }

        // Validate invitation
        const invitation = await prisma.invitation.findUnique({
            where: { token },
            include: { creator: true }
        });

        if (!invitation || invitation.usedAt || invitation.expiresAt < new Date()) {
            return NextResponse.json({ error: 'Convite inválido ou expirado' }, { status: 400 });
        }

        if (invitation.email !== email) {
            return NextResponse.json({ error: 'Este convite foi emitido para outro email' }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: 'Usuário já cadastrado' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user and mark invitation as used
        const [user] = await prisma.$transaction([
            prisma.user.create({
                data: {
                    email,
                    name,
                    password_hash: hashedPassword,
                    role: invitation.role,
                }
            }),
            prisma.invitation.update({
                where: { id: invitation.id },
                data: { usedAt: new Date() }
            }),
            prisma.auditLog.create({
                data: {
                    action: 'USER_REGISTERED_VIA_INVITE',
                    entityType: 'USER',
                    entityId: email,
                    userId: invitation.createdById,
                    details: `Usuário ${name} registrado com cargo ${invitation.role}`
                }
            })
        ]);

        return NextResponse.json({ success: true, message: 'Conta criada com sucesso!' });
    } catch (error) {
        console.error('Error registering user:', error);
        return NextResponse.json(
            { error: 'Erro ao criar conta' },
            { status: 500 }
        );
    }
}
