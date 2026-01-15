import { XMLParser } from 'fast-xml-parser';
import { ParsedDocument } from '../types';


/**
 * Tenta extrair valores monetários de texto
 */
function extractAmount(text: string): number | undefined {
    // Procura por padrões de valores em reais: R$ 1.234,56 ou 1234.56
    const patterns = [
        /R\$\s*(\d{1,3}(?:\.\d{3})*,\d{2})/,
        /(\d{1,3}(?:\.\d{3})*,\d{2})/,
        /(\d+\.\d{2})/,
    ];

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
    // Procura por padrões de data: DD/MM/YYYY
    const patterns = [
        /(\d{2})\/(\d{2})\/(\d{4})/,
        /(\d{2})-(\d{2})-(\d{4})/,
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            const day = parseInt(match[1]);
            const month = parseInt(match[2]) - 1; // Mês começa em 0
            const year = parseInt(match[3]);
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
    // Procura por padrões de CPF (###.###.###-##) ou CNPJ (##.###.###/####-##)
    const cpfPattern = /(\d{3}\.\d{3}\.\d{3}-\d{2})/;
    const cnpjPattern = /(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/;

    let match = text.match(cnpjPattern);
    if (match) return match[1];

    match = text.match(cpfPattern);
    if (match) return match[1];

    return undefined;
}

/**
 * Parse PDF e tenta extrair informações relevantes
 */
export async function parsePDF(buffer: Buffer): Promise<ParsedDocument> {
    try {
        const pdfParse = require('pdf-parse');
        const data = await pdfParse(buffer);
        const text = data.text;

        const parsed: ParsedDocument = {
            amount: extractAmount(text),
            dueDate: extractDate(text),
            cpf_cnpj: extractCpfCnpj(text),
        };

        // Tenta extrair nome (assume que é a primeira linha com palavras maiúsculas)
        const lines = text.split('\n').filter((line: string) => line.trim());
        for (const line of lines) {
            if (/^[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ\s]+$/.test(line.trim()) && line.length > 5) {
                parsed.debtorName = line.trim();
                break;
            }
        }

        return parsed;
    } catch (error) {
        console.error('Error parsing PDF:', error);
        return {};
    }
}

/**
 * Parse XML e tenta extrair informações relevantes
 */
export async function parseXML(xmlString: string): Promise<ParsedDocument> {
    try {
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '@_',
        });

        const result = parser.parse(xmlString);

        // A estrutura do XML pode variar, então tentamos várias abordagens
        const parsed: ParsedDocument = {};

        // Função auxiliar para buscar valores em objetos aninhados
        function searchInObject(obj: any, key: string): any {
            if (obj[key]) return obj[key];

            for (const k in obj) {
                if (typeof obj[k] === 'object') {
                    const found = searchInObject(obj[k], key);
                    if (found) return found;
                }
            }
            return null;
        }

        // Tenta extrair valor
        const valorField = searchInObject(result, 'valor') ||
            searchInObject(result, 'total') ||
            searchInObject(result, 'amount');
        if (valorField) {
            const amount = parseFloat(String(valorField).replace(',', '.'));
            if (!isNaN(amount)) parsed.amount = amount;
        }

        // Tenta extrair data
        const dataField = searchInObject(result, 'data') ||
            searchInObject(result, 'vencimento') ||
            searchInObject(result, 'dueDate');
        if (dataField) {
            parsed.dueDate = extractDate(String(dataField));
        }

        // Tenta extrair nome
        const nomeField = searchInObject(result, 'nome') ||
            searchInObject(result, 'pagador') ||
            searchInObject(result, 'devedor');
        if (nomeField) {
            parsed.debtorName = String(nomeField);
        }

        // Tenta extrair CPF/CNPJ
        const cpfField = searchInObject(result, 'cpf') ||
            searchInObject(result, 'cnpj') ||
            searchInObject(result, 'documento');
        if (cpfField) {
            parsed.cpf_cnpj = String(cpfField);
        }

        return parsed;
    } catch (error) {
        console.error('Error parsing XML:', error);
        return {};
    }
}
