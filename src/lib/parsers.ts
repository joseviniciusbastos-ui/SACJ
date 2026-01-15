import { XMLParser } from 'fast-xml-parser';
import { ParsedDocument } from '../types';


/**
 * Tenta extrair valores monetários de texto
 */
function extractAmount(text: string): number | undefined {
    // Procura por padrões de valores em reais: R$ 1.234,56 ou 1234.56
    const patterns = [
        /(?:R\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2})\b/,
        /\b(\d+\.\d{2})\b/,
        /(?:R\$\s*)?(\d+,\d{2})\b/,
    ];

    // Tenta encontrar o valor de "total" ou "valor nominal" em relatórios de inadimplência
    const totalPatterns = [
        /(?:Total|Valor Total|Total Geral|Valor Nominal|Soma|Liquidado|Boleto|A Pagar|Vencido|Principal|Subtotal)\s*[:=]?\s*(?:R\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2})/i,
        /TOTAL.*?(?:R\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2})/i,
        /VALOR.*?(?:R\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2})/i
    ];

    for (const pattern of totalPatterns) {
        const match = text.match(pattern);
        if (match) {
            const valueStr = match[1].replace(/\./g, '').replace(',', '.');
            const value = parseFloat(valueStr);
            if (!isNaN(value)) return value;
        }
    }

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            const valueStr = match[1].replace(/\./g, '').replace(',', '.');
            const value = parseFloat(valueStr);
            if (!isNaN(value)) return value;
        }
    }

    return undefined;
}

/**
 * Tenta extrair datas de texto
 */
function extractDate(text: string): Date | undefined {
    const patterns = [
        /(\d{2})\/(\d{2})\/(\d{4})/,
        /(\d{2})-(\d{2})-(\d{4})/,
        /(\d{2})\/(\d{2})\/(\d{2})\b/,
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            const day = parseInt(match[1]);
            const month = parseInt(match[2]) - 1;
            let year = parseInt(match[3]);
            if (year < 100) year += 2000;
            const date = new Date(year, month, day);
            if (!isNaN(date.getTime())) return date;
        }
    }

    return undefined;
}

/**
 * Tenta extrair CPF/CNPJ de texto
 */
function extractCpfCnpj(text: string): string | undefined {
    const cpfCnpjPattern = /(\d{3}\.\d{3}\.\d{3}-\d{2})|(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/;
    const match = text.match(cpfCnpjPattern);
    return match ? match[0] : undefined;
}

/**
 * Parse PDF e tenta extrair informações relevantes
 */
export async function parsePDF(buffer: Buffer): Promise<ParsedDocument> {
    try {
        const pdfParse = require('pdf-parse');
        const data = await pdfParse(buffer);
        const text = data.text || '';

        console.log('--- START PDF TEXT EXTRACTION ---');
        console.log('Text Length:', text.length);
        console.log('--- END PDF TEXT EXTRACTION ---');

        if (text.trim().length < 50) {
            throw new Error('PDF sem texto digital detectado. O arquivo pode ser uma imagem escaneada sem OCR ou estar protegido.');
        }

        const lines = text.split('\n').map((l: string) => l.trim()).filter(Boolean);

        // Padrões de detecção genérica
        const condoKeywords = ['CONDOMINIO', 'RESIDENCIAL', 'EDIFICIO', 'CHACARA', 'VILA', 'LOTEAMENTO', 'CONJUNTO', 'EMPRESARIAL', 'ASSOCIACAO'];
        const unitPattern = /(?:Unidade|Apto|Apartamento|Sala|Lote|Unid|Apt|Loja|Box|Casa|Bloco|Quadra|Qd|Lt)\s*[:=]?\s*(\d+[A-Z\d\s\/]*)/i;
        const nameLabels = /(?:Devedor|Proprietário|Morador|Condômino|Nome|Cliente|Sacado|Favorecido|Responsável)\s*[:=]?\s*([A-ZÁÀÂÃÉÊÍÓÔÕÚÇ\s]{5,})/i;
        const debtorLinePattern = /^(\d+[A-Z0-9\s\/]*?)\s+-\s+([A-ZÁÀÂÃÉÊÍÓÔÕÚÇ\s]{5,})$/i;

        const parsed: ParsedDocument = {
            amount: extractAmount(text),
            dueDate: extractDate(text),
            cpf_cnpj: extractCpfCnpj(text),
        };

        // Identificação de Condomínio
        for (let i = 0; i < Math.min(lines.length, 10); i++) {
            const line = lines[i].toUpperCase();
            if (condoKeywords.some(keyword => line.includes(keyword))) {
                const name = lines[i]
                    .replace(/^[A-Z0-9]+\s+/, '')
                    .replace(/\(\d+\)$/, '')
                    .trim();

                if (name.length > 5 && !parsed.condominiumName) {
                    parsed.condominiumName = name;
                    break;
                }
            }
        }

        for (const line of lines) {
            const debtorMatch = line.match(debtorLinePattern);
            if (debtorMatch && !parsed.debtorName) {
                parsed.unit = debtorMatch[1].trim();
                parsed.debtorName = debtorMatch[2].trim();
            }

            const nameMatch = line.match(nameLabels);
            if (nameMatch && !parsed.debtorName) {
                const name = nameMatch[1].split('\n')[0].split('-')[0].trim();
                if (name.length > 3) parsed.debtorName = name;
            }

            const unitMatch = line.match(unitPattern);
            if (unitMatch && !parsed.unit) {
                parsed.unit = unitMatch[1].trim();
            }
        }

        // Fallback Nome
        if (!parsed.debtorName) {
            for (const line of lines) {
                if (/^[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ\s\-]{8,50}$/.test(line) &&
                    !condoKeywords.some(kw => line.toUpperCase().includes(kw)) &&
                    !line.includes('DEMONSTRATIVO') && !line.includes('RELATÓRIO') &&
                    !line.includes('INADIMPLÊNCIA') && !line.includes('DOCUMENTO') &&
                    !line.includes('TOTAL') && !line.includes('SUBTOTAL') &&
                    !line.includes('VENCIMENTO') && !line.includes('UNIDADE') &&
                    !line.includes('PÁGINA') && !line.includes('PAGINA')) {
                    parsed.debtorName = line.trim();
                    break;
                }
            }
        }

        const debtItems: any[] = [];
        const debtRowPatterns = [
            /(\d{2}\/\d{2}\/\d{2,4})\s+(\d{2}\/\d{4})\s+\d+.*?\s+-\s+(.+?)\s+(\d{1,3}(?:\.\d{3})*,\d{2})/g,
            /(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(?:R\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2})/g,
            /(\d{2}\/\d{2}\/\d{4})\s+(?:R\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2})\s+([A-ZÁÀÂÃÉÊÍÓÔÕÚÇ].*)/g,
            /(\b\w{3}\/\d{4})\b\s+(.+?)\s+(?:R\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2})/g,
            /(\b\d{2}\/\d{4})\b\s+(.+?)\s+(?:R\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2})/g,
            /(\d{2}\/\d{2}\/\d{4})\s+(?:R\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2})/g,
        ];

        for (const pattern of debtRowPatterns) {
            let match;
            pattern.lastIndex = 0;
            while ((match = pattern.exec(text)) !== null) {
                let dateStr, description, valueStr;

                if (pattern.source.includes('-\\s+')) {
                    dateStr = match[1];
                    description = match[3].trim();
                    valueStr = match[4];
                } else if (pattern.source.includes('(.+?)\\s+(?:R\\$') || pattern.source.includes('(\\b\\w{3}\/\\d{4})') || pattern.source.includes('(\\b\\d{2}\/\\d{4})')) {
                    dateStr = match[1];
                    description = match[2].trim();
                    valueStr = match[3];
                } else if (match.length === 3) {
                    dateStr = match[1];
                    valueStr = match[2];
                    description = 'Parcela/Taxa';
                } else {
                    dateStr = match[1];
                    valueStr = match[2];
                    description = match[3]?.trim() || 'Dívida';
                }

                if (dateStr && valueStr) {
                    const cleanValue = valueStr.replace(/\./g, '').replace(',', '.');
                    const amount = parseFloat(cleanValue);
                    if (!isNaN(amount) && amount > 0) {
                        let dueDate: Date | undefined;
                        if (dateStr.includes('/')) {
                            const parts = dateStr.split('/');
                            if (parts.length === 3) {
                                let [day, month, year] = parts.map(Number);
                                if (year < 100) year += 2000;
                                dueDate = new Date(year, month - 1, day);
                            } else if (parts.length === 2) {
                                const monthMap: Record<string, number> = {
                                    'jan': 0, 'fev': 1, 'mar': 2, 'abr': 3, 'mai': 4, 'jun': 5,
                                    'jul': 6, 'ago': 7, 'set': 8, 'out': 9, 'nov': 10, 'dez': 11
                                };
                                let monthStr = parts[0].toLowerCase().substring(0, 3);
                                let month = monthMap[monthStr];
                                if (month === undefined) month = parseInt(parts[0]) - 1;
                                const year = parseInt(parts[1]);
                                if (!isNaN(month) && !isNaN(year)) dueDate = new Date(year, month, 1);
                            }
                        }

                        if (dueDate && !isNaN(dueDate.getTime())) {
                            debtItems.push({ dueDate, description, amount });
                        }
                    }
                }
            }
            if (debtItems.length > 1) break;
        }

        if (debtItems.length > 0) {
            parsed.debtItems = debtItems;
            if (!parsed.amount || parsed.amount === 0) {
                parsed.amount = debtItems.reduce((acc, item) => acc + item.amount, 0);
            }
        }

        // Se não conseguiu extrair nada relevante, levanta erro motivacional
        if (!parsed.debtorName && (!parsed.debtItems || parsed.debtItems.length === 0)) {
            throw new Error('Não foi possível identificar dados de devedor ou débitos no PDF. Verifique se o arquivo está no formato esperado.');
        }

        return parsed;
    } catch (error: any) {
        console.error('Error parsing PDF:', error);
        throw error;
    }
}

export async function parseXML(xmlString: string): Promise<ParsedDocument> {
    try {
        const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
        const result = parser.parse(xmlString);
        const parsed: ParsedDocument = {};

        function searchInObject(obj: any, key: string): any {
            if (!obj) return null;
            if (obj[key]) return obj[key];
            for (const k in obj) {
                if (typeof obj[k] === 'object') {
                    const found = searchInObject(obj[k], key);
                    if (found) return found;
                }
            }
            return null;
        }

        const valorField = searchInObject(result, 'valor') || searchInObject(result, 'total') || searchInObject(result, 'amount');
        if (valorField) {
            const amount = parseFloat(String(valorField).replace(',', '.'));
            if (!isNaN(amount)) parsed.amount = amount;
        }

        const dataField = searchInObject(result, 'data') || searchInObject(result, 'vencimento') || searchInObject(result, 'dueDate');
        if (dataField) parsed.dueDate = extractDate(String(dataField));

        const nomeField = searchInObject(result, 'nome') || searchInObject(result, 'pagador') || searchInObject(result, 'devedor');
        if (nomeField) parsed.debtorName = String(nomeField);

        const cpfField = searchInObject(result, 'cpf') || searchInObject(result, 'cnpj') || searchInObject(result, 'documento');
        if (cpfField) parsed.cpf_cnpj = String(cpfField);

        const items = searchInObject(result, 'parcelas') || searchInObject(result, 'itens') || searchInObject(result, 'items') || searchInObject(result, 'debitos');
        if (items && Array.isArray(items)) {
            parsed.debtItems = items.map(item => ({
                description: searchInObject(item, 'descricao') || searchInObject(item, 'description') || 'Parcela',
                amount: parseFloat(String(searchInObject(item, 'valor') || searchInObject(item, 'amount')).replace(',', '.')),
                dueDate: extractDate(String(searchInObject(item, 'vencimento') || searchInObject(item, 'dueDate') || ''))
            })).filter((it: any) => !isNaN(it.amount) && it.dueDate) as any[];
        }

        return parsed;
    } catch (error: any) {
        console.error('Error parsing XML:', error);
        throw error;
    }
}
