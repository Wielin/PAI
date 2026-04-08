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

export function processLoanForm(values: RawLoanFormInput): LoanFormResult {
    const validation = validateLoanInput(values);

    if (validation.value === null) {
        return {
            errors: validation.errors,
            monthlyInstallmentLabel: ''
        };
    }

    const monthlyInstallment = calculateMonthlyInstallment(validation.value);

    return {
        errors: [],
        monthlyInstallmentLabel: formatCurrencyPln(monthlyInstallment)
    };
}