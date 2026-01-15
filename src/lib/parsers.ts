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
        const lines = text.split('\n').map((l: string) => l.trim()).filter(Boolean);

        // Regex inteligentes para campos brasileiros
        const unitPattern = /(?:Unidade|Apto|Apartamento|Sala|Lote)\s*:?\s*(\d+[A-Z]?)/i;
        const blockPattern = /(?:Bloco|Torre|Edifício|Ed)\s*:?\s*([A-Z\d]+)/i;
        const condoLabels = /(?:Condomínio|Edifício|Residencial|Conjunto)\s*:?\s*([A-ZÁÀÂÃÉÊÍÓÔÕÚÇ.\s\-]+)/i;
        const nameLabels = /(?:Devedor|Proprietário|Morador|Condômino)\s*:?\s*([A-ZÁÀÂÃÉÊÍÓÔÕÚÇ\s]+)/i;

        const parsed: ParsedDocument = {
            amount: extractAmount(text),
            dueDate: extractDate(text),
            cpf_cnpj: extractCpfCnpj(text),
        };

        // Identificação por etiquetas (Labels)
        for (const line of lines) {
            const condoMatch = line.match(condoLabels);
            if (condoMatch && !parsed.condominiumName) parsed.condominiumName = condoMatch[1].trim();

            const nameMatch = line.match(nameLabels);
            if (nameMatch && !parsed.debtorName) parsed.debtorName = nameMatch[1].trim();

            const unitMatch = line.match(unitPattern);
            if (unitMatch && !parsed.unit) parsed.unit = unitMatch[1];

            const blockMatch = line.match(blockPattern);
            if (blockMatch && !parsed.block) parsed.block = blockMatch[1];
        }

        // Heurística de Nome (Se não encontrar por label, procura linhas em caixa alta)
        if (!parsed.debtorName) {
            for (const line of lines) {
                if (/^[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ\s]{10,50}$/.test(line) &&
                    !line.includes('CONDOMÍNIO') &&
                    !line.includes('DOCUMENTO') &&
                    !line.includes('NÃO É VALE')) {
                    parsed.debtorName = line;
                    break;
                }
            }
        }

        // Extração de itens de dívida (Tabelas)
        const debtItems: any[] = [];
        const debtRowPattern = /(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(?:R\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2})/g;

        let match;
        while ((match = debtRowPattern.exec(text)) !== null) {
            const dateStr = match[1];
            const description = match[2].trim();
            const valueStr = match[3].replace(/\./g, '').replace(',', '.');
            const amount = parseFloat(valueStr);

            if (!isNaN(amount) && description.length > 2) {
                const [day, month, year] = dateStr.split('/').map(Number);
                debtItems.push({
                    dueDate: new Date(year, month - 1, day),
                    description,
                    amount
                });
            }
        }

        if (debtItems.length > 0) {
            parsed.debtItems = debtItems;
            if (!parsed.amount) {
                parsed.amount = debtItems.reduce((acc, item) => acc + item.amount, 0);
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

        // Tenta extrair itens de dívida do XML
        const items = searchInObject(result, 'parcelas') ||
            searchInObject(result, 'itens') ||
            searchInObject(result, 'items') ||
            searchInObject(result, 'debitos');

        if (items && Array.isArray(items)) {
            parsed.debtItems = items.map(item => ({
                description: searchInObject(item, 'descricao') || searchInObject(item, 'description') || 'Parcela',
                amount: parseFloat(String(searchInObject(item, 'valor') || searchInObject(item, 'amount')).replace(',', '.')),
                dueDate: extractDate(String(searchInObject(item, 'vencimento') || searchInObject(item, 'dueDate') || ''))
            })).filter((it: any) => !isNaN(it.amount) && it.dueDate) as any[];
        }

        return parsed;
    } catch (error) {
        console.error('Error parsing XML:', error);
        return {};
    }
}
