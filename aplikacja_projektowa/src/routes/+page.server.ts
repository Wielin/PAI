import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	createThread,
	getLinksByThreadIds,
	getAllTags,
	getThreadAuthorId,
	listUsers,
	searchThreads,
	updateThread,
	updateUserRole
} from '$lib/server/db';
import type { ThreadSearch } from '$lib/types';

const ROLE_ADMIN = 'Admin';
const ROLE_CONTRIBUTOR = 'Contributor';
const ROLE_USER = 'User';
const MAX_LINKS = 8;

const readText = (value: FormDataEntryValue | null): string => {
	return typeof value === 'string' ? value.trim() : '';
};

const toOptional = (value: FormDataEntryValue | null): string | null => {
	const text = readText(value);
	return text ? text : null;
};

const isWebUrl = (value: string): boolean => {
	return /^https?:\/\//i.test(value);
};

const parseSearch = (url: URL): ThreadSearch => {
	const query = url.searchParams.get('q')?.trim() ?? '';
	const tags = url.searchParams
		.getAll('tag')
		.map((tag) => tag.trim())
		.filter(Boolean);
	const exploitType = url.searchParams.get('exploitType')?.trim() ?? '';
	const affectedOs = url.searchParams.get('affectedOs')?.trim() ?? '';
	const affectedProtocol = url.searchParams.get('affectedProtocol')?.trim() ?? '';

	return {
		query,
		tags,
		exploitType,
		affectedOs,
		affectedProtocol
	};
};

const parseLinks = (raw: string): { url: string; description?: string | null }[] => {
	if (!raw) {
		return [];
	}

	const lines = raw
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean);

	if (lines.length > MAX_LINKS) {
		throw new Error(`Maksymalnie ${MAX_LINKS} linkow.`);
	}

	return lines.map((line) => {
		const [urlPart, descriptionPart] = line.split('|').map((part) => part.trim());
		if (!urlPart || !isWebUrl(urlPart)) {
			throw new Error(`Niepoprawny link: ${urlPart || 'brak'}.`);
		}

		return {
			url: urlPart,
			description: descriptionPart || null
		};
	});
};

export const load: PageServerLoad = async ({ locals, url }) => {
	const search = parseSearch(url);
	const threads = searchThreads(search);
	const linkRows = getLinksByThreadIds(threads.map((thread) => thread.id));
	const linksByThread = new Map<number, { url: string; description: string | null }[]>();
	for (const link of linkRows) {
		const current = linksByThread.get(link.threadId) ?? [];
		current.push({ url: link.url, description: link.description });
		linksByThread.set(link.threadId, current);
	}
	const threadsWithLinks = threads.map((thread) => {
		const linkList = linksByThread.get(thread.id) ?? [];
		const linksText = linkList
			.map((link) => (link.description ? `${link.url} | ${link.description}` : link.url))
			.join('\n');
		return {
			...thread,
			linksText
		};
	});
	const tags = getAllTags();
	const users =
		locals.user?.role === ROLE_ADMIN
			? listUsers().filter((user) => user.role !== ROLE_ADMIN)
			: [];

	return {
		threads: threadsWithLinks,
		tags,
		users,
		search
	};
};

export const actions: Actions = {
	createThread: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, {
				formId: 'createThread',
				error: 'Zaloguj sie, aby dodac wpis.'
			});
		}

		if (![ROLE_CONTRIBUTOR, ROLE_ADMIN].includes(locals.user.role)) {
			return fail(403, {
				formId: 'createThread',
				error: 'Brak uprawnien do dodawania wpisow.'
			});
		}

		const data = await request.formData();
		const title = readText(data.get('title'));
		const mainContent = readText(data.get('mainContent'));

		if (!title || !mainContent) {
			return fail(400, {
				formId: 'createThread',
				error: 'Wypelnij tytul i tresc wpisu.'
			});
		}

		const summary = toOptional(data.get('summary'));
		const cveId = toOptional(data.get('cveId'));
		const exploitType = toOptional(data.get('exploitType'));
		const affectedOs = toOptional(data.get('affectedOs'));
		const affectedProtocol = toOptional(data.get('affectedProtocol'));
		const escalationSteps = toOptional(data.get('escalationSteps'));
		const mitigation = toOptional(data.get('mitigation'));
		const patchUrl = toOptional(data.get('patchUrl'));

		let cvssScore: number | null = null;
		const cvssRaw = readText(data.get('cvssScore'));
		if (cvssRaw) {
			const parsed = Number(cvssRaw);
			if (!Number.isFinite(parsed) || parsed < 0 || parsed > 10) {
				return fail(400, {
					formId: 'createThread',
					error: 'CVSS musi byc liczba w zakresie 0-10.'
				});
			}
			cvssScore = parsed;
		}

		if (patchUrl && !isWebUrl(patchUrl)) {
			return fail(400, {
				formId: 'createThread',
				error: 'Link do patcha musi zaczynac sie od http:// lub https://.'
			});
		}

		let links: { url: string; description?: string | null }[] = [];
		try {
			links = parseLinks(readText(data.get('links')));
		} catch (error) {
			return fail(400, {
				formId: 'createThread',
				error: error instanceof Error ? error.message : 'Niepoprawne linki.'
			});
		}

		const tags = Array.from(
			new Set(
				data
					.getAll('tags')
					.map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
					.filter(Boolean)
			)
		);

		createThread({
			title,
			summary,
			mainContent,
			authorId: locals.user.id,
			cveId,
			cvssScore,
			affectedOs,
			affectedProtocol,
			exploitType,
			escalationSteps,
			mitigation,
			patchUrl,
			tags,
			links
		});

		return {
			formId: 'createThread',
			success: true
		};
	},
	editThread: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, {
				formId: 'editThread',
				error: 'Zaloguj sie, aby edytowac wpis.'
			});
		}

		if (![ROLE_CONTRIBUTOR, ROLE_ADMIN].includes(locals.user.role)) {
			return fail(403, {
				formId: 'editThread',
				error: 'Brak uprawnien do edycji wpisow.'
			});
		}

		const data = await request.formData();
		const threadId = Number(data.get('threadId'));
		if (!Number.isInteger(threadId) || threadId <= 0) {
			return fail(400, {
				formId: 'editThread',
				error: 'Niepoprawny wpis.'
			});
		}

		const authorId = getThreadAuthorId(threadId);
		if (!authorId) {
			return fail(404, {
				formId: 'editThread',
				threadId,
				error: 'Wpis nie istnieje.'
			});
		}

		if (locals.user.role !== ROLE_ADMIN && locals.user.id !== authorId) {
			return fail(403, {
				formId: 'editThread',
				threadId,
				error: 'Nie mozesz edytowac tego wpisu.'
			});
		}

		const title = readText(data.get('title'));
		const mainContent = readText(data.get('mainContent'));

		if (!title || !mainContent) {
			return fail(400, {
				formId: 'editThread',
				threadId,
				error: 'Wypelnij tytul i tresc wpisu.'
			});
		}

		const summary = toOptional(data.get('summary'));
		const cveId = toOptional(data.get('cveId'));
		const exploitType = toOptional(data.get('exploitType'));
		const affectedOs = toOptional(data.get('affectedOs'));
		const affectedProtocol = toOptional(data.get('affectedProtocol'));
		const escalationSteps = toOptional(data.get('escalationSteps'));
		const mitigation = toOptional(data.get('mitigation'));
		const patchUrl = toOptional(data.get('patchUrl'));

		let cvssScore: number | null = null;
		const cvssRaw = readText(data.get('cvssScore'));
		if (cvssRaw) {
			const parsed = Number(cvssRaw);
			if (!Number.isFinite(parsed) || parsed < 0 || parsed > 10) {
				return fail(400, {
					formId: 'editThread',
					threadId,
					error: 'CVSS musi byc liczba w zakresie 0-10.'
				});
			}
			cvssScore = parsed;
		}

		if (patchUrl && !isWebUrl(patchUrl)) {
			return fail(400, {
				formId: 'editThread',
				threadId,
				error: 'Link do patcha musi zaczynac sie od http:// lub https://.'
			});
		}

		let links: { url: string; description?: string | null }[] = [];
		try {
			links = parseLinks(readText(data.get('links')));
		} catch (error) {
			return fail(400, {
				formId: 'editThread',
				threadId,
				error: error instanceof Error ? error.message : 'Niepoprawne linki.'
			});
		}

		const tags = Array.from(
			new Set(
				data
					.getAll('tags')
					.map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
					.filter(Boolean)
			)
		);

		updateThread({
			threadId,
			title,
			summary,
			mainContent,
			authorId,
			cveId,
			cvssScore,
			affectedOs,
			affectedProtocol,
			exploitType,
			escalationSteps,
			mitigation,
			patchUrl,
			tags,
			links
		});

		return {
			formId: 'editThread',
			threadId,
			success: true
		};
	},
	updateRole: async ({ request, locals }) => {
		if (!locals.user || locals.user.role !== ROLE_ADMIN) {
			return fail(403, {
				formId: 'updateRole',
				error: 'Brak uprawnien do zmiany rol.'
			});
		}

		const data = await request.formData();
		const userId = Number(data.get('userId'));
		const roleName = readText(data.get('role'));

		if (!Number.isInteger(userId) || userId <= 0) {
			return fail(400, {
				formId: 'updateRole',
				error: 'Niepoprawne konto.'
			});
		}

		if (![ROLE_CONTRIBUTOR, ROLE_USER].includes(roleName)) {
			return fail(400, {
				formId: 'updateRole',
				error: 'Mozesz nadac lub odebrac role Contributor.'
			});
		}

		const users = listUsers();
		const target = users.find((user) => user.id === userId);
		if (!target) {
			return fail(404, {
				formId: 'updateRole',
				error: 'Uzytkownik nie istnieje.'
			});
		}

		if (target.role === ROLE_ADMIN) {
			return fail(403, {
				formId: 'updateRole',
				error: 'Nie mozna zmienic roli Admina.'
			});
		}

		if (target.role === roleName) {
			return fail(400, {
				formId: 'updateRole',
				error: 'Ten uzytkownik juz ma te role.'
			});
		}

		updateUserRole(userId, roleName);

		return {
			formId: 'updateRole',
			success: true,
			updatedUserId: userId
		};
	}
};
