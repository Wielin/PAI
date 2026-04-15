import {
    calculateMonthlyInstallment,
    formatCurrencyPln,
    type RawLoanFormInput,
    validateLoanInput
} from '$lib/loan-calculator';

export type LoanFormResult = {
    errors: string[];
    monthlyInstallmentLabel: string;
};

export type LoginRole = 'user' | 'szef';

export function processLoanForm(values: RawLoanFormInput, role: LoginRole | null): LoanFormResult {
    if (role === null) {
        return {
            errors: ['Aby obliczyc rate, zaloguj sie.'],
            monthlyInstallmentLabel: ''
        };
    }

    const validation = validateLoanInput(values);

    if (validation.value === null) {
        return {
            errors: validation.errors,
            monthlyInstallmentLabel: ''
        };
    }

    if (role === 'user' && validation.value.amount > 100000) {
        return {
            errors: ['Konto user pozwala na kredyt maksymalnie do 100000.'],
            monthlyInstallmentLabel: ''
        };
    }

    const monthlyInstallment = calculateMonthlyInstallment(validation.value);

    return {
        errors: [],
        monthlyInstallmentLabel: formatCurrencyPln(monthlyInstallment)
    };
}