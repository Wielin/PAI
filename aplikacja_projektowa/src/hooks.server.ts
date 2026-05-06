import type { Handle } from '@sveltejs/kit';
import { getUserBySessionToken } from '$lib/server/db';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('session');
	event.locals.user = null;

	if (token) {
		const user = getUserBySessionToken(token);
		if (user) {
			event.locals.user = user;
		} else {
			event.cookies.delete('session', { path: '/' });
		}
	}

	return resolve(event);
};
