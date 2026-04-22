<script lang="ts">
    import '$lib/assets/loan-calculator.css';
    import { processLoanForm, type LoginRole } from '$lib/loan-form';

    let amount = $state('');
    let years = $state('');
    let annualRate = $state('');
    let login = $state('');
    let password = $state('');
    let currentRole = $state<LoginRole | null>(null);
    let currentAccountLabel = $state('');
    let authMessage = $state('');
    let errors = $state<string[]>([]);
    let monthlyInstallmentLabel = $state('');

    type LoginApiResponse = {
        success: boolean;
        message: string;
        role?: LoginRole;
        accountLabel?: string;
    };

    async function handleLogin(event: SubmitEvent): Promise<void> {
        event.preventDefault();

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({ login, password })
            });

            const payload = await response.json() as LoginApiResponse;

            if (response.ok && payload.success && payload.role && payload.accountLabel) {
                currentRole = payload.role;
                currentAccountLabel = payload.accountLabel;
                authMessage = payload.message;
                errors = [];
                return;
            }

            currentRole = null;
            currentAccountLabel = '';
            authMessage = payload.message;
            monthlyInstallmentLabel = '';
        } catch {
            currentRole = null;
            currentAccountLabel = '';
            authMessage = 'Blad polaczenia z serwerem logowania.';
            monthlyInstallmentLabel = '';
        }
    }

    function handleLogout(): void {
        currentRole = null;
        currentAccountLabel = '';
        authMessage = 'Wylogowano.';
        monthlyInstallmentLabel = '';
    }

    function handleSubmit(event: SubmitEvent): void {
        event.preventDefault();

        const result = processLoanForm({
            amount,
            years,
            annualRate
        }, currentRole);

        errors = result.errors;
        monthlyInstallmentLabel = result.monthlyInstallmentLabel;
    }
</script>

<main class="page">
    <section class="card">
        <h1>Kalkulator kredytowy</h1>
        <p class="subtitle">Najpierw zaloguj sie, potem podaj dane i oblicz miesieczna rate.</p>

        <form method="POST" class="form login-form" novalidate onsubmit={handleLogin}>
            <label for="login">Login</label>
            <input
                id="login"
                name="login"
                type="text"
                autocomplete="username"
                bind:value={login}
            />

            <label for="password">Haslo</label>
            <input
                id="password"
                name="password"
                type="password"
                autocomplete="current-password"
                bind:value={password}
            />

            <button type="submit">Zaloguj</button>
            <button type="button" class="secondary" onclick={handleLogout}>Wyloguj</button>
        </form>

        {#if currentRole !== null}
            <p class="auth-status">Aktywne konto: <strong>{currentAccountLabel}</strong></p>
        {/if}

        {#if authMessage}
            <p class="auth-message">{authMessage}</p>
        {/if}

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

            <button type="submit" disabled={currentRole === null}>Oblicz</button>
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
