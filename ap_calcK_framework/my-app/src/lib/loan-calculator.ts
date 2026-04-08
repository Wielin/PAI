export type LoanInput = {
    amount: number;
    years: number;
    annualRate: number;
};

export type RawLoanFormInput = {
    amount: string;
    years: string;
    annualRate: string;
};

export type LoanValidationResult = {
    errors: string[];
    value: LoanInput | null;
};

function parsePositiveInteger(rawValue: string): number | null {
    const value = rawValue.trim();

    if (!/^\d+$/.test(value)) {
        return null;
    }

    const parsed = Number(value);
    if (!Number.isSafeInteger(parsed)) {
        return null;
    }

    return parsed;
}

function parseRateDecimal(rawValue: string): number | null {
    const normalized = rawValue.trim().replace(',', '.');

    if (!/^\d+(\.\d+)?$/.test(normalized)) {
        return null;
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
}

export function validateLoanInput(input: RawLoanFormInput): LoanValidationResult {
    const errors: string[] = [];
    const amountRaw = input.amount.trim();
    const yearsRaw = input.years.trim();
    const annualRateRaw = input.annualRate.trim();

    const amount = parsePositiveInteger(amountRaw);
    const years = parsePositiveInteger(yearsRaw);
    const annualRate = parseRateDecimal(annualRateRaw);

    if (amountRaw.length === 0) {
        errors.push('Pole pieniadze jest wymagane.');
    } else if (amount === null) {
        errors.push('Pieniadze musza byc liczba calkowita.');
    } else if (amount <= 0) {
        errors.push('Pieniadze musza byc wieksze od 0.');
    }

    if (yearsRaw.length === 0) {
        errors.push('Pole lata kredytu jest wymagane.');
    } else if (years === null) {
        errors.push('Lata kredytu musza byc liczba calkowita.');
    } else if (years <= 0) {
        errors.push('Lata kredytu musza byc wieksze od 0.');
    } else if (years > 100) {
        errors.push('Lata kredytu musza byc mniejsze lub rowne 100.');
    }

    if (annualRateRaw.length === 0) {
        errors.push('Pole oprocentowanie roczne jest wymagane.');
    } else if (annualRate === null) {
        errors.push('Oprocentowanie musi byc liczba, np. 0.05 dla 5%.');
    } else if (annualRate < 0) {
        errors.push('Oprocentowanie nie moze byc ujemne.');
    } else if (annualRate > 1) {
        errors.push('Oprocentowanie musi byc z zakresu 0-1 (5% = 0.05).');
    }

    if (errors.length > 0 || amount === null || years === null || annualRate === null) {
        return { errors, value: null };
    }

    return {
        errors: [],
        value: {
            amount,
            years,
            annualRate
        }
    };
}

export function calculateMonthlyInstallment(input: LoanInput): number {
    const months = input.years * 12;
    const monthlyRate = input.annualRate / 12;

    if (monthlyRate === 0) {
        return input.amount / months;
    }

    const factor = Math.pow(1 + monthlyRate, months);
    return (input.amount * monthlyRate * factor) / (factor - 1);
}

export function formatCurrencyPln(value: number): string {
    return new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: 'PLN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(Number.isFinite(value) ? value : 0);
}
