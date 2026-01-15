import { SimulationParameters, CalculationResult } from '../types';

/**
 * Calcula os dias entre duas datas
 */
export function calcularDiasAtraso(dataVencimento: Date, dataAcordo: Date): number {
    const diff = dataAcordo.getTime() - dataVencimento.getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Calcula juros de mora pro-rata die
 * Fórmula: Principal × (Taxa/30) × Dias de atraso
 */
export function calcularJurosMora(
    principal: number,
    taxaMensal: number,
    diasAtraso: number
): number {
    const taxaDiaria = taxaMensal / 30;
    return principal * (taxaDiaria / 100) * diasAtraso;
}

/**
 * Calcula multa moratória
 * Fórmula: Principal × Taxa da Multa
 */
export function calcularMulta(principal: number, taxaMulta: number): number {
    return principal * (taxaMulta / 100);
}

/**
 * Calcula correção monetária
 * Fórmula: Principal × Índice Acumulado
 */
export function calcularCorrecaoMonetaria(
    principal: number,
    indiceCorrecao: number
): number {
    return principal * (indiceCorrecao / 100);
}

/**
 * Calcula honorários advocatícios
 * Fórmula: (Principal + Juros + Multa + Correção) × Taxa de Honorários
 */
export function calcularHonorarios(
    valorBase: number,
    taxaHonorarios: number
): number {
    return valorBase * (taxaHonorarios / 100);
}

/**
 * Calcula o total do acordo
 */
export function calcularTotalAcordo(
    principal: number,
    dataVencimento: Date,
    dataAcordo: Date,
    params: SimulationParameters
): CalculationResult {
    // Calcula dias de atraso
    const diasAtraso = calcularDiasAtraso(dataVencimento, dataAcordo);

    // Calcula cada componente
    const multa = calcularMulta(principal, params.multa);
    const juros = calcularJurosMora(principal, params.juros, diasAtraso);
    const correcao = calcularCorrecaoMonetaria(principal, params.indiceCorrecao);

    // Soma parcial (antes dos honorários)
    const subtotal = principal + multa + juros + correcao;

    // Calcula honorários sobre o subtotal
    const honorarios = calcularHonorarios(subtotal, params.honorarios);

    // Total do acordo
    const totalAcordo = subtotal + honorarios;

    // Calcula parcelas
    const saldoAposEntrada = totalAcordo - params.entrada;
    const valorParcela = params.numeroParcelas > 0
        ? saldoAposEntrada / params.numeroParcelas
        : 0;

    // Gera cronograma de parcelas
    const installments = gerarParcelas(
        dataAcordo,
        params.numeroParcelas,
        valorParcela
    );

    return {
        principal,
        multa,
        juros,
        correcao,
        honorarios,
        totalAcordo,
        valorEntrada: params.entrada,
        numeroParcelas: params.numeroParcelas,
        valorParcela,
        installments,
    };
}

/**
 * Gera o cronograma de parcelas
 */
export function gerarParcelas(
    dataAcordo: Date,
    numeroParcelas: number,
    valorParcela: number
): { number: number; dueDate: Date; amount: number }[] {
    const parcelas = [];

    for (let i = 1; i <= numeroParcelas; i++) {
        const dueDate = new Date(dataAcordo);
        dueDate.setMonth(dueDate.getMonth() + i);

        parcelas.push({
            number: i,
            dueDate,
            amount: valorParcela,
        });
    }

    return parcelas;
}

/**
 * Calcula multa por quebra de acordo
 * Aplica sobre o saldo remanescente
 */
export function calcularMultaQuebraAcordo(
    saldoRemanescente: number,
    taxaMulta: number
): number {
    return saldoRemanescente * (taxaMulta / 100);
}

/**
 * Formata valor monetário para BRL
 */
export function formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(valor);
}

/**
 * Formata data para padrão brasileiro
 */
export function formatarData(data: Date): string {
    return new Intl.DateTimeFormat('pt-BR').format(data);
}
