import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

type UserRecord = {
    login: string;
    password: string;
};

const databasePath = resolve('data', 'auth.db');
mkdirSync(dirname(databasePath), { recursive: true });

const database = new DatabaseSync(databasePath);

database.exec(`
    CREATE TABLE IF NOT EXISTS users (
        login TEXT PRIMARY KEY,
        password TEXT NOT NULL
    )
`);

const insertDefaultUser = database.prepare(
    'INSERT OR IGNORE INTO users (login, password) VALUES (?, ?)'
);

insertDefaultUser.run('user', 'user');
insertDefaultUser.run('szef', 'szef');

const selectUserByCredentials = database.prepare(
    'SELECT login, password FROM users WHERE login = ? AND password = ? LIMIT 1'
);

export function verifyUserCredentials(login: string, password: string): UserRecord | null {
    const row = selectUserByCredentials.get(login, password) as UserRecord | undefined;
    return row ?? null;
}