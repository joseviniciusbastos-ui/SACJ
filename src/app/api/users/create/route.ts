import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { name, email, password } = await req.json();

        // Check if there are already users
        const userCount = await prisma.user.count();
        if (userCount > 0) {
            return NextResponse.json(
                { error: 'Já existe um administrador cadastrado' },
                { status: 403 }
            );
        }

        // Validate input
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Todos os campos são obrigatórios' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'A senha deve ter pelo menos 6 caracteres' },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email já cadastrado' },
                { status: 400 }
            );
        }

        // Hash password
        const password_hash = await hash(password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password_hash,
            },
        });

        return NextResponse.json({
            message: 'Usuário criado com sucesso',
            userId: user.id,
        });
    } catch (error: any) {
        console.error('Error creating user:', error);
        return NextResponse.json(
            { error: 'Erro ao criar usuário', details: error.message },
            { status: 500 }
        );
    }
}
