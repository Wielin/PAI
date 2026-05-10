<script lang="ts">
	let { data, form } = $props();
	const user = $derived(data.user);
	const role = $derived(user?.role ?? 'Guest');
	const search = $derived(data.search);
	const canEditThread = (thread: { authorId: number }) =>
		role === 'Admin' || (role === 'Contributor' && user?.id === thread.authorId);
</script>

<svelte:head>
	<title>Exploit DB</title>
</svelte:head>

<section class="hero">
	<div class="hero-copy">
		<p class="eyebrow">Exploit DB</p>
		<h1>Forum wpisow o exploitach i ochronie</h1>
		<p>
			Baza wpisow o CVE, wektorach ataku i metodach ochrony. Wyszukuj po tagach,
			typie, OS i protokole.
		</p>
		<div class="hero-meta">
			<span class="pill">Rola: {role}</span>
			{#if user}
				<span class="muted">Zalogowany: {user.username}</span>
			{:else}
				<a class="pill-link" href="/login">Logowanie</a>
				<a class="pill-link" href="/register">Rejestracja</a>
			{/if}
		</div>
	</div>

	<form method="GET" class="search-card">
		<div class="field">
			<label for="q">Fraza</label>
			<input
				id="q"
				name="q"
				type="search"
				placeholder="CVE-2024-XXXX, nazwa, technika"
				value={search.query}
			/>
		</div>
		<div class="grid-3">
			<label>
				Typ exploita
				<input name="exploitType" placeholder="RCE, LPE" value={search.exploitType} />
			</label>
			<label>
				OS
				<input name="affectedOs" placeholder="Windows, Linux" value={search.affectedOs} />
			</label>
			<label>
				Protokol
				<input
					name="affectedProtocol"
					placeholder="HTTP, SMB"
					value={search.affectedProtocol}
				/>
			</label>
		</div>
		<fieldset class="tag-fieldset">
			<legend>Tagi</legend>
			<div class="tag-list">
				{#each data.tags as tag}
					<label class="tag-check">
						<input
							type="checkbox"
							name="tag"
							value={tag.name}
							checked={search.tags.includes(tag.name)}
						/>
						<span>{tag.name}</span>
					</label>
				{/each}
			</div>
		</fieldset>
		<div class="search-actions">
			<button type="submit" class="primary">Szukaj</button>
			<a class="ghost" href="/">Wyczysc</a>
		</div>
	</form>
</section>

<section class="results">
	<div class="section-head">
		<h2>Wyniki</h2>
		<span class="count">{data.threads.length} wpisow</span>
	</div>
	{#if data.threads.length === 0}
		<p class="empty">Brak wpisow dla podanych filtrow.</p>
	{:else}
		<div class="thread-grid">
			{#each data.threads as thread, index}
				<article class="thread-card" style={`--delay: ${index * 0.05}s`}>
					<header class="thread-header">
						<div>
							<h3>{thread.title}</h3>
							<p class="meta">
								Autor {thread.author} · {thread.createdAt}
							</p>
						</div>
						{#if thread.cveId}
							<span class="badge">{thread.cveId}</span>
						{/if}
					</header>
					<p class="summary">{thread.summary ?? thread.excerpt}</p>
					{#if thread.tags.length > 0}
						<div class="pill-row">
							{#each thread.tags as tag}
								<span class="tag">{tag}</span>
							{/each}
						</div>
					{/if}
					<div class="meta-grid">
						<div>
							<span>Typ</span>
							<strong>{thread.exploitType ?? '-'}</strong>
						</div>
						<div>
							<span>OS</span>
							<strong>{thread.affectedOs ?? '-'}</strong>
						</div>
						<div>
							<span>Protokol</span>
							<strong>{thread.affectedProtocol ?? '-'}</strong>
						</div>
						<div>
							<span>CVSS</span>
							<strong>
								{thread.cvssScore === null ? '-' : thread.cvssScore.toFixed(1)}
							</strong>
						</div>
					</div>
						{#if canEditThread(thread)}
							<details class="edit-box">
								<summary>Edytuj wpis</summary>
								{#if form?.formId === 'editThread' && form.threadId === thread.id && form.error}
									<p class="form-error">{form.error}</p>
								{/if}
								{#if form?.formId === 'editThread' && form.threadId === thread.id && form.success}
									<p class="form-success">Wpis zaktualizowany.</p>
								{/if}
								<form method="POST" action="?/editThread" class="edit-form">
									<input type="hidden" name="threadId" value={thread.id} />
									<div class="grid-2">
										<label>
											Tytul
											<input name="title" value={thread.title} required />
										</label>
										<label>
											CVE ID
											<input name="cveId" value={thread.cveId ?? ''} />
										</label>
									</div>
									<label>
										Summary
										<textarea name="summary" rows="2">{thread.summary ?? ''}</textarea>
									</label>
									<label>
										Tresc wpisu
										<textarea name="mainContent" rows="6">{thread.mainContent}</textarea>
									</label>
									<div class="grid-3">
										<label>
											CVSS
											<input
												name="cvssScore"
												type="number"
												min="0"
												max="10"
												step="0.1"
												value={thread.cvssScore ?? ''}
											/>
										</label>
										<label>
											Typ exploita
											<input name="exploitType" value={thread.exploitType ?? ''} />
										</label>
										<label>
											OS
											<input name="affectedOs" value={thread.affectedOs ?? ''} />
										</label>
										<label>
											Protokol
											<input
												name="affectedProtocol"
												value={thread.affectedProtocol ?? ''}
											/>
										</label>
									</div>
									<label>
										Escalation steps
										<textarea name="escalationSteps" rows="3">{thread.escalationSteps ?? ''}</textarea>
									</label>
									<label>
										Mitigation
										<textarea name="mitigation" rows="3">{thread.mitigation ?? ''}</textarea>
									</label>
									<label>
										Patch URL
										<input name="patchUrl" type="url" value={thread.patchUrl ?? ''} />
									</label>
									<fieldset class="tag-fieldset">
										<legend>Tagi</legend>
										<div class="tag-list">
											{#each data.tags as tag}
												<label class="tag-check">
													<input
														type="checkbox"
														name="tags"
														value={tag.name}
														checked={thread.tags.includes(tag.name)}
													/>
													<span>{tag.name}</span>
												</label>
											{/each}
										</div>
									</fieldset>
									<label>
										Linki (po jednym w linii, format: url | opis)
										<textarea name="links" rows="3">{thread.linksText ?? ''}</textarea>
									</label>
									<button type="submit" class="primary">Zapisz zmiany</button>
								</form>
							</details>
						{/if}
				</article>
			{/each}
		</div>
	{/if}
</section>

{#if role === 'Contributor' || role === 'Admin'}
	<section class="contribute">
		<div class="section-head">
			<h2>Nowy wpis</h2>
			<p class="muted">Widoczne tylko dla Contributor i Admin.</p>
		</div>
		{#if form?.formId === 'createThread' && form.error}
			<p class="form-error">{form.error}</p>
		{/if}
		{#if form?.formId === 'createThread' && form.success}
			<p class="form-success">Wpis dodany pomyslnie.</p>
		{/if}
		<form method="POST" action="?/createThread" class="create-form">
			<div class="grid-2">
				<label>
					Tytul
					<input name="title" required />
				</label>
				<label>
					CVE ID
					<input name="cveId" placeholder="CVE-2024-1234" />
				</label>
			</div>
			<label>
				Summary
				<textarea name="summary" rows="2" placeholder="Krotki opis"></textarea>
			</label>
			<label>
				Tresc wpisu
				<textarea name="mainContent" rows="6" required></textarea>
			</label>
			<div class="grid-3">
				<label>
					CVSS
					<input name="cvssScore" type="number" min="0" max="10" step="0.1" />
				</label>
				<label>
					Typ exploita
					<input name="exploitType" placeholder="RCE" />
				</label>
				<label>
					OS
					<input name="affectedOs" placeholder="Windows" />
				</label>
				<label>
					Protokol
					<input name="affectedProtocol" placeholder="HTTP" />
				</label>
			</div>
			<label>
				Escalation steps
				<textarea name="escalationSteps" rows="3"></textarea>
			</label>
			<label>
				Mitigation
				<textarea name="mitigation" rows="3"></textarea>
			</label>
			<label>
				Patch URL
				<input name="patchUrl" type="url" placeholder="https://" />
			</label>
			<fieldset class="tag-fieldset">
				<legend>Tagi</legend>
				<div class="tag-list">
					{#each data.tags as tag}
						<label class="tag-check">
							<input type="checkbox" name="tags" value={tag.name} />
							<span>{tag.name}</span>
						</label>
					{/each}
				</div>
			</fieldset>
			<label>
				Linki (po jednym w linii, format: url | opis)
				<textarea name="links" rows="3"></textarea>
			</label>
			<button type="submit" class="primary">Dodaj wpis</button>
		</form>
	</section>
{:else if role === 'User'}
	<section class="contribute locked">
		<h2>Dodawanie wpisow</h2>
		<p class="muted">
			Ta sekcja jest dostepna tylko dla Contributor. Popros Admina o nadanie roli.
		</p>
	</section>
{/if}

{#if role === 'Admin'}
	<section class="admin">
		<div class="section-head">
			<h2>Uprawnienia kont</h2>
			<p class="muted">Nadaj role Contributor dla kont User.</p>
		</div>
		{#if form?.formId === 'updateRole' && form.error}
			<p class="form-error">{form.error}</p>
		{/if}
		{#if form?.formId === 'updateRole' && form.success}
			<p class="form-success">Rola zaktualizowana.</p>
		{/if}
		{#if data.users.length === 0}
			<p class="empty">Brak kont do zmiany.</p>
		{:else}
			<div class="user-list">
				{#each data.users as account}
					<div class="user-card">
						<div>
							<p class="name">{account.username}</p>
							<p class="muted">{account.email}</p>
							<span class="role">{account.role}</span>
						</div>
						{#if account.role === 'Contributor'}
							<form method="POST" action="?/updateRole">
								<input type="hidden" name="userId" value={account.id} />
								<input type="hidden" name="role" value="User" />
								<button type="submit" class="ghost">Odbierz Contributor</button>
							</form>
						{:else}
							<form method="POST" action="?/updateRole">
								<input type="hidden" name="userId" value={account.id} />
								<input type="hidden" name="role" value="Contributor" />
								<button type="submit" class="ghost">Nadaj Contributor</button>
							</form>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</section>
{/if}

<style>
	.hero {
		display: grid;
		grid-template-columns: minmax(0, 1.1fr) minmax(0, 380px);
		gap: 24px;
		align-items: start;
		margin-bottom: 32px;
	}

	.hero-copy {
		background: rgba(255, 255, 255, 0.78);
		border: 1px solid var(--line);
		border-radius: 20px;
		padding: 24px;
		box-shadow: var(--shadow);
		animation: fadeUp 0.7s ease both;
	}

	.eyebrow {
		text-transform: uppercase;
		letter-spacing: 0.2em;
		font-size: 12px;
		color: var(--ink-500);
		margin: 0 0 8px;
	}

	.hero h1 {
		font-size: 32px;
		margin: 0 0 12px;
	}

	.hero p {
		margin: 0;
		color: var(--ink-700);
	}

	.hero-meta {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
		align-items: center;
		margin-top: 16px;
	}

	.pill,
	.pill-link {
		padding: 6px 12px;
		border-radius: 999px;
		border: 1px solid rgba(15, 23, 42, 0.2);
		font-weight: 600;
		font-size: 14px;
		text-decoration: none;
		color: var(--ink-900);
		background: #fff;
	}

	.pill-link {
		border-color: rgba(15, 23, 42, 0.1);
		color: var(--brand-700);
	}

	.search-card {
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: 20px;
		padding: 20px;
		box-shadow: var(--shadow);
		display: flex;
		flex-direction: column;
		gap: 16px;
		animation: fadeUp 0.7s ease both;
		animation-delay: 0.05s;
	}

	.field label,
	label {
		display: flex;
		flex-direction: column;
		gap: 6px;
		font-weight: 600;
		color: var(--ink-700);
	}

	.search-card input,
	.search-card textarea,
	.create-form input,
	.create-form textarea {
		padding: 10px 12px;
		border-radius: 10px;
		border: 1px solid var(--line);
		font-family: inherit;
		font-size: 14px;
		background: #fff;
	}

	.search-card input:focus,
	.create-form input:focus,
	.create-form textarea:focus,
	.search-card textarea:focus {
		outline: 2px solid rgba(249, 115, 22, 0.3);
		border-color: rgba(249, 115, 22, 0.55);
	}

	.grid-3 {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 12px;
	}

	.grid-2 {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 12px;
	}

	.tag-fieldset {
		border: 1px dashed var(--line);
		border-radius: 16px;
		padding: 12px;
		margin: 0;
	}

	.tag-list {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.tag-check {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 6px 10px;
		border-radius: 999px;
		border: 1px solid var(--line);
		background: var(--surface-alt);
		font-weight: 600;
	}

	.tag-check input {
		accent-color: var(--brand-500);
	}

	.search-actions {
		display: flex;
		gap: 12px;
		align-items: center;
		flex-wrap: wrap;
	}

	.primary {
		background: var(--brand-500);
		color: #fff;
		border: none;
		border-radius: 999px;
		padding: 10px 18px;
		font-weight: 700;
		cursor: pointer;
		box-shadow: 0 10px 18px rgba(249, 115, 22, 0.25);
	}

	.ghost {
		background: transparent;
		border: 1px solid rgba(15, 23, 42, 0.2);
		color: var(--ink-900);
		border-radius: 999px;
		padding: 8px 16px;
		font-weight: 600;
		text-decoration: none;
		cursor: pointer;
	}

	.results {
		display: flex;
		flex-direction: column;
		gap: 20px;
		margin-bottom: 32px;
	}

	.section-head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 12px;
		flex-wrap: wrap;
	}

	.section-head h2 {
		margin: 0;
		font-size: 24px;
	}

	.count {
		color: var(--ink-500);
		font-weight: 600;
	}

	.thread-grid {
		display: grid;
		gap: 18px;
	}

	.thread-card {
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: 18px;
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 12px;
		box-shadow: 0 10px 22px rgba(15, 23, 42, 0.08);
		animation: rise 0.6s ease both;
		animation-delay: var(--delay);
		overflow-wrap: anywhere;
		word-break: break-word;
	}

	.thread-header {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		flex-wrap: wrap;
		align-items: start;
	}

	.thread-header h3 {
		margin: 0 0 6px;
		font-size: 20px;
		overflow-wrap: anywhere;
		word-break: break-word;
	}

	.meta {
		margin: 0;
		color: var(--ink-500);
		font-size: 14px;
		overflow-wrap: anywhere;
	}

	.summary {
		margin: 0;
		color: var(--ink-700);
		overflow-wrap: anywhere;
		word-break: break-word;
	}

	.pill-row {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.tag {
		padding: 4px 10px;
		border-radius: 999px;
		background: rgba(20, 184, 166, 0.12);
		color: #0f766e;
		font-weight: 600;
		font-size: 12px;
		overflow-wrap: anywhere;
	}

	.meta-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: 10px;
	}

	.meta-grid span {
		color: var(--ink-500);
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.meta-grid strong {
		font-family: var(--font-mono);
		font-size: 14px;
		overflow-wrap: anywhere;
		word-break: break-word;
	}

	.badge {
		padding: 6px 10px;
		border-radius: 10px;
		background: rgba(249, 115, 22, 0.15);
		color: var(--brand-700);
		font-weight: 700;
		font-size: 12px;
		overflow-wrap: anywhere;
	}

	.badge.success {
		background: rgba(20, 184, 166, 0.18);
		color: #0f766e;
	}

	.contribute,
	.admin {
		background: rgba(255, 255, 255, 0.85);
		border: 1px solid var(--line);
		border-radius: 20px;
		padding: 22px;
		box-shadow: var(--shadow);
		margin-bottom: 32px;
		animation: fadeUp 0.6s ease both;
	}

	.contribute.locked {
		text-align: center;
	}

	.create-form,
	.edit-form {
		display: flex;
		flex-direction: column;
		gap: 16px;
		margin-top: 16px;
	}

	.edit-box {
		margin-top: 12px;
		padding-top: 12px;
		border-top: 1px dashed var(--line);
	}

	.edit-box summary {
		cursor: pointer;
		font-weight: 700;
		color: var(--brand-700);
	}

	.edit-box[open] summary {
		margin-bottom: 12px;
	}

	.user-list {
		display: grid;
		gap: 12px;
		margin-top: 16px;
	}

	.user-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
		padding: 14px 16px;
		border-radius: 16px;
		border: 1px solid var(--line);
		background: var(--surface);
	}

	.user-card .name {
		margin: 0;
		font-weight: 700;
	}

	.user-card .role {
		display: inline-block;
		margin-top: 4px;
		font-size: 12px;
		color: var(--ink-500);
	}

	.form-error {
		color: #b91c1c;
		font-weight: 600;
		margin: 8px 0;
	}

	.form-success {
		color: #0f766e;
		font-weight: 600;
		margin: 8px 0;
	}

	.muted {
		color: var(--ink-500);
		margin: 0;
	}

	.empty {
		margin: 0;
		color: var(--ink-500);
	}

	@keyframes fadeUp {
		from {
			opacity: 0;
			transform: translateY(14px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(16px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 980px) {
		.hero {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 720px) {
		.grid-3,
		.grid-2 {
			grid-template-columns: 1fr;
		}
		.thread-header {
			flex-direction: column;
			align-items: flex-start;
		}
		.user-card {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>
