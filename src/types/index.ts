export interface Debtor {
    id?: string;
    name: string;
    unit: string;
    block?: string;
    condominiumName: string;
    cpf_cnpj: string;
}

export interface SimulationParameters {
    juros: number; // Juros de mora (%)
    multa: number; // Multa moratória (%)
    honorarios: number; // Honorários advocatícios (%)
    multaQuebraAcordo: number; // Multa por quebra de acordo (%)
    indiceCorrecao: number; // Índice de correção monetária
    numeroParcelas: number; // Número de parcelas
    entrada: number; // Valor da entrada
}

export interface Simulation {
    id?: string;
    debtorId: string;
    debtAmount: number;
    startDate: Date;
    agreementDate: Date;
    parameters_json: string;
    status: string;
    createdAt?: Date;
    updatedAt?: Date;
    debtor?: Debtor;
    installments?: Installment[];
}

export interface Installment {
    id?: string;
    simulationId: string;
    number: number;
    dueDate: Date;
    amount: number;
    status: string;
}

export interface ParsedDocument {
    debtorName?: string;
    amount?: number;
    dueDate?: Date;
    unit?: string;
    condominiumName?: string;
    cpf_cnpj?: string;
}

export interface CalculationResult {
    principal: number;
    multa: number;
    juros: number;
    correcao: number;
    honorarios: number;
    totalAcordo: number;
    valorEntrada: number;
    numeroParcelas: number;
    valorParcela: number;
    installments: {
        number: number;
        dueDate: Date;
        amount: number;
    }[];
}
