import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const userCount = await prisma.user.count();
        return NextResponse.json({ hasUsers: userCount > 0 });
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao verificar usuários' }, { status: 500 });
    }
}
