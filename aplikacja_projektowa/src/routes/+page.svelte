<script lang="ts">
	import type { LayoutData } from '$lib/types';

	let { data } = $props<{ data: LayoutData }>();
	const user = $derived(data.user);
	const role = $derived(user?.role ?? 'Guest');
</script>

<svelte:head>
	<title>Exploit DB</title>
</svelte:head>

<section class="hero">
	<h1>Exploit DB</h1>
	<p>
		Baza wiedzy o CVE, exploitach oraz metodach ochrony. Wyszukuj po tagach, typie,
		OS i protokole.
	</p>
	<p class="role">Aktualna rola: {role}</p>
	<div class="actions">
		{#if user}
			<a class="primary" href="/">Przegladaj watki</a>
		{:else}
			<a class="primary" href="/login">Logowanie</a>
			<a class="secondary" href="/register">Rejestracja</a>
			<form method="POST" action="/guest">
				<button type="submit" class="ghost">Kontynuuj jako Guest</button>
			</form>
		{/if}
	</div>
</section>

<style>
	.hero {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 28px;
		background: #fff;
		border-radius: 16px;
		box-shadow: 0 12px 30px rgba(16, 22, 40, 0.08);
	}

	.role {
		font-weight: 600;
		color: #345;
	}

	.actions {
		display: flex;
		gap: 12px;
		flex-wrap: wrap;
		align-items: center;
	}

	.actions a,
	.actions button {
		text-decoration: none;
		border-radius: 8px;
		padding: 10px 16px;
		border: 1px solid transparent;
		font-weight: 600;
		cursor: pointer;
	}

	.primary {
		background: #1d4ed8;
		color: #fff;
	}

	.secondary {
		background: #e5e7eb;
		color: #111827;
	}

	.ghost {
		background: transparent;
		border-color: #1d4ed8;
		color: #1d4ed8;
	}

	form {
		margin: 0;
	}
</style>
