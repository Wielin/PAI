<script lang="ts">
    import '$lib/assets/loan-calculator.css';
    import { processLoanForm } from '$lib/loan-form';

    let amount = $state('');
    let years = $state('');
    let annualRate = $state('');
    let errors = $state<string[]>([]);
    let monthlyInstallmentLabel = $state('');

    function handleSubmit(event: SubmitEvent): void {
        event.preventDefault();

        const result = processLoanForm({
            amount,
            years,
            annualRate
        });

        errors = result.errors;
        monthlyInstallmentLabel = result.monthlyInstallmentLabel;
    }
</script>

<main class="page">
    <section class="card">
        <h1>Kalkulator kredytowy</h1>
        <p class="subtitle">Podaj dane i oblicz miesieczna rate.</p>

        <form method="POST" class="form" novalidate onsubmit={handleSubmit}>
            <label for="amount">Pieniadze (int)</label>
            <input
                id="amount"
                name="amount"
                type="text"
                inputmode="numeric"
                autocomplete="off"
                bind:value={amount}
            />

            <label for="years">Lata kredytu (int)</label>
            <input
                id="years"
                name="years"
                type="text"
                inputmode="numeric"
                autocomplete="off"
                bind:value={years}
            />

            <label for="annualRate">Oprocentowanie roczne (5% = 0.05)</label>
            <input
                id="annualRate"
                name="annualRate"
                type="text"
                inputmode="decimal"
                autocomplete="off"
                bind:value={annualRate}
            />

            <button type="submit">Oblicz</button>
        </form>

        {#if errors.length > 0}
            <ul class="errors">
                {#each errors as error}
                    <li>{error}</li>
                {/each}
            </ul>
        {:else if monthlyInstallmentLabel}
            <p class="result">
                Miesieczna kwota raty:
                <strong>{monthlyInstallmentLabel}</strong>
            </p>
        {/if}
    </section>
</main>
