import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const userCount = await prisma.user.count();
        return NextResponse.json({ hasUsers: userCount > 0 });
    } catch (error: any) {
        console.error('Error checking users:', error);
        return NextResponse.json(
            { error: 'Erro ao verificar usuários', details: error.message },
            { status: 500 }
        );
    }
}
