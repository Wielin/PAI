<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import type { LayoutData } from '$lib/types';

	let { data, children } = $props<{ data: LayoutData }>();
	const user = $derived(data.user);
	const role = $derived(user?.role ?? 'Guest');
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="page">
	<header class="site-header">
		<a class="brand" href="/">Exploit DB</a>
		<nav class="nav">
			<a href="/">Start</a>
			{#if user}
				<span class="user">Zalogowany: {user.username} ({role})</span>
				<form method="POST" action="/logout">
					<button type="submit">Wyloguj</button>
				</form>
			{:else}
				<a href="/login">Logowanie</a>
				<a href="/register">Rejestracja</a>
				<form method="POST" action="/guest">
					<button type="submit">Guest</button>
				</form>
			{/if}
		</nav>
	</header>
	<main class="content">
		{@render children()}
	</main>
</div>

<style>
	:global(body) {
		margin: 0;
		font-family: 'Segoe UI', system-ui, sans-serif;
		background: #f6f7fb;
		color: #1c1f2a;
	}

	.page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.site-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 24px;
		background: #101628;
		color: #fff;
	}

	.brand {
		font-weight: 700;
		font-size: 18px;
		text-decoration: none;
		color: inherit;
	}

	.nav {
		display: flex;
		gap: 12px;
		align-items: center;
		flex-wrap: wrap;
	}

	.nav a {
		color: #cfe1ff;
		text-decoration: none;
		font-weight: 600;
	}

	.nav form {
		margin: 0;
	}

	.nav button {
		border: 1px solid #cfe1ff;
		background: transparent;
		color: #cfe1ff;
		padding: 6px 10px;
		border-radius: 6px;
		cursor: pointer;
	}

	.user {
		color: #f7d38b;
		font-weight: 600;
	}

	.content {
		padding: 32px 24px;
		max-width: 960px;
		width: 100%;
		margin: 0 auto;
	}
</style>
