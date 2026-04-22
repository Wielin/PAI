import { json } from '@sveltejs/kit';
import { verifyUserCredentials } from '$lib/server/auth-db';
import type { RequestHandler } from './$types';

type LoginRole = 'user' | 'szef';

type LoginPayload = {
    login?: unknown;
    password?: unknown;
};

function isLoginRole(value: string): value is LoginRole {
    return value === 'user' || value === 'szef';
}

export const POST: RequestHandler = async ({ request }) => {
    const payload = await request.json() as LoginPayload;

    const login = typeof payload.login === 'string' ? payload.login.trim() : '';
    const password = typeof payload.password === 'string' ? payload.password : '';

    if (login.length === 0 || password.length === 0) {
        return json({
            success: false,
            message: 'Podaj login i haslo.'
        }, { status: 400 });
    }

    const user = verifyUserCredentials(login, password);

    if (user === null) {
        return json({
            success: false,
            message: 'Nieprawidlowy login lub haslo.'
        }, { status: 401 });
    }

    if (!isLoginRole(user.login)) {
        return json({
            success: false,
            message: 'Konto istnieje, ale nie ma przypisanej roli w aplikacji.'
        }, { status: 403 });
    }

    const message = user.login === 'user'
        ? 'Zalogowano na konto user (limit kredytu: 100000).'
        : 'Zalogowano na konto szef (brak limitu kredytu).';

    return json({
        success: true,
        role: user.login,
        accountLabel: user.login,
        message
    });
};