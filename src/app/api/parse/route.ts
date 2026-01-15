import { NextRequest, NextResponse } from 'next/server';
import { parsePDF, parseXML } from '@/lib/parsers';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'Nenhum arquivo enviado' },
                { status: 400 }
            );
        }

        let parsedData;

        if (file.type === 'application/pdf') {
            const buffer = Buffer.from(await file.arrayBuffer());
            parsedData = await parsePDF(buffer);
        } else if (file.type === 'text/xml' || file.type === 'application/xml') {
            const text = await file.text();
            parsedData = await parseXML(text);
        } else {
            return NextResponse.json(
                { error: 'Tipo de arquivo não suportado' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            data: parsedData,
        });
    } catch (error: any) {
        console.error('Error parsing file:', error);
        return NextResponse.json(
            { error: error.message || 'Erro ao processar arquivo' },
            { status: 500 }
        );
    }
}
