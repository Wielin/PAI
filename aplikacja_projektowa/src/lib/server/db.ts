import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto';

type SessionRow = {
	expiresAt: string;
	id: number;
	username: string;
	email: string;
	role: string;
};

type LoginUserRow = {
	id: number;
	username: string;
	email: string;
	passwordHash: string;
	role: string;
};

export type AuthUser = {
	id: number;
	username: string;
	email: string;
	role: string;
};

const DB_PATH = resolve('data', 'app.db');
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const HASH_ITERATIONS = 120_000;
const HASH_KEYLEN = 32;
const HASH_DIGEST = 'sha256';

let db: DatabaseSync | null = null;
let initialized = false;

function getDb(): DatabaseSync {
	if (!db) {
		mkdirSync(dirname(DB_PATH), { recursive: true });
		db = new DatabaseSync(DB_PATH);
	}

	if (!initialized) {
		initializeSchema(db);
		initialized = true;
	}

	return db;
}

function initializeSchema(database: DatabaseSync): void {
	database.exec('PRAGMA foreign_keys = ON;');
	database.exec(`
		CREATE TABLE IF NOT EXISTS Roles (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL UNIQUE
		);

		CREATE TABLE IF NOT EXISTS Users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			username TEXT NOT NULL UNIQUE,
			email TEXT NOT NULL UNIQUE,
			password_hash TEXT NOT NULL,
			role_id INTEGER NOT NULL DEFAULT 1,
			created_at TEXT DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (role_id) REFERENCES Roles(id)
		);

		CREATE TABLE IF NOT EXISTS Tags (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			tag_name TEXT NOT NULL UNIQUE
		);

		CREATE TABLE IF NOT EXISTS Threads (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			title TEXT NOT NULL,
			summary TEXT,
			main_content TEXT NOT NULL,
			author_id INTEGER NOT NULL,
			views INTEGER NOT NULL DEFAULT 0,
			is_published INTEGER NOT NULL DEFAULT 1,
			created_at TEXT DEFAULT CURRENT_TIMESTAMP,
			updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (author_id) REFERENCES Users(id) ON DELETE CASCADE
		);

		CREATE TRIGGER IF NOT EXISTS threads_updated_at
		AFTER UPDATE ON Threads
		FOR EACH ROW
		WHEN NEW.updated_at = OLD.updated_at
		BEGIN
			UPDATE Threads SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
		END;

		CREATE TABLE IF NOT EXISTS Exploit_Meta (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			thread_id INTEGER NOT NULL UNIQUE,
			cve_id TEXT,
			cvss_score REAL,
			affected_os TEXT,
			affected_protocol TEXT,
			exploit_type TEXT,
			escalation_steps TEXT,
			mitigation TEXT,
			patch_url TEXT,
			FOREIGN KEY (thread_id) REFERENCES Threads(id) ON DELETE CASCADE
		);

		CREATE TABLE IF NOT EXISTS Links (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			thread_id INTEGER NOT NULL,
			url TEXT NOT NULL,
			description TEXT,
			FOREIGN KEY (thread_id) REFERENCES Threads(id) ON DELETE CASCADE
		);

		CREATE TABLE IF NOT EXISTS Thread_Tags (
			thread_id INTEGER NOT NULL,
			tag_id INTEGER NOT NULL,
			PRIMARY KEY (thread_id, tag_id),
			FOREIGN KEY (thread_id) REFERENCES Threads(id) ON DELETE CASCADE,
			FOREIGN KEY (tag_id) REFERENCES Tags(id) ON DELETE CASCADE
		);

		CREATE TABLE IF NOT EXISTS Likes (
			user_id INTEGER NOT NULL,
			thread_id INTEGER NOT NULL,
			created_at TEXT DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (user_id, thread_id),
			FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
			FOREIGN KEY (thread_id) REFERENCES Threads(id) ON DELETE CASCADE
		);

		CREATE TABLE IF NOT EXISTS Sessions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			token TEXT NOT NULL UNIQUE,
			created_at TEXT DEFAULT CURRENT_TIMESTAMP,
			expires_at TEXT NOT NULL,
			FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
		);
	`);

	seedInitialData(database);
}

function seedInitialData(database: DatabaseSync): void {
	const roleCount = database.prepare('SELECT COUNT(*) AS count FROM Roles').get() as {
		count: number;
	};

	if (roleCount.count === 0) {
		database
			.prepare('INSERT INTO Roles (name) VALUES (?), (?), (?), (?)')
			.run('Guest', 'User', 'Contributor', 'Admin');
	}

	const tagCount = database.prepare('SELECT COUNT(*) AS count FROM Tags').get() as {
		count: number;
	};

	if (tagCount.count === 0) {
		database
			.prepare(
				`INSERT INTO Tags (tag_name) VALUES
				('RCE'),
				('LPE'),
				('SQLi'),
				('XSS'),
				('CSRF'),
				('BufferOverflow'),
				('Windows'),
				('Linux'),
				('macOS'),
				('Android'),
				('Web'),
				('Network'),
				('Critical'),
				('High'),
				('Medium'),
				('Low'),
				('ZeroDay');`
			)
			.run();
	}

	const adminRoleId = getRoleIdByName('Admin', database);
	const hasAdmin = database
		.prepare('SELECT 1 FROM Users WHERE role_id = ? LIMIT 1')
		.get(adminRoleId);

	if (!hasAdmin) {
		const passwordHash = hashPassword('admin123');
		database
			.prepare(
				'INSERT INTO Users (username, email, password_hash, role_id) VALUES (?, ?, ?, ?)'
			)
			.run('admin', 'admin@example.com', passwordHash, adminRoleId);
	}
}

export function hashPassword(password: string): string {
	const salt = randomBytes(16).toString('hex');
	const hash = pbkdf2Sync(password, salt, HASH_ITERATIONS, HASH_KEYLEN, HASH_DIGEST).toString(
		'hex'
	);
	return `pbkdf2$${HASH_ITERATIONS}$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
	try {
		const [scheme, iterationsRaw, salt, hash] = stored.split('$');
		if (scheme !== 'pbkdf2' || !iterationsRaw || !salt || !hash) {
			return false;
		}

		const iterations = Number(iterationsRaw);
		if (!Number.isFinite(iterations) || iterations <= 0) {
			return false;
		}

		const storedBuffer = Buffer.from(hash, 'hex');
		const derived = pbkdf2Sync(password, salt, iterations, storedBuffer.length, HASH_DIGEST);
		return timingSafeEqual(storedBuffer, derived);
	} catch {
		return false;
	}
}

function getRoleIdByName(name: string, database?: DatabaseSync): number {
	const activeDb = database ?? getDb();
	const row = activeDb.prepare('SELECT id FROM Roles WHERE name = ?').get(name) as
		| { id: number }
		| undefined;

	if (!row) {
		throw new Error(`Role not found: ${name}`);
	}

	return row.id;
}

export function isUsernameTaken(username: string): boolean {
	const database = getDb();
	const row = database
		.prepare('SELECT 1 FROM Users WHERE username = ? LIMIT 1')
		.get(username);
	return Boolean(row);
}

export function isEmailTaken(email: string): boolean {
	const database = getDb();
	const row = database.prepare('SELECT 1 FROM Users WHERE email = ? LIMIT 1').get(email);
	return Boolean(row);
}

export function createUser(params: {
	username: string;
	email: string;
	passwordHash: string;
	roleName?: string;
}): number {
	const database = getDb();
	const roleName = params.roleName ?? 'User';
	const roleId = getRoleIdByName(roleName);
	const result = database
		.prepare('INSERT INTO Users (username, email, password_hash, role_id) VALUES (?, ?, ?, ?)')
		.run(params.username, params.email, params.passwordHash, roleId);

	return Number(result.lastInsertRowid);
}

export function getUserByIdentifier(identifier: string): LoginUserRow | null {
	const database = getDb();
	const row = database
		.prepare(
			`SELECT Users.id AS id,
				Users.username AS username,
				Users.email AS email,
				Users.password_hash AS passwordHash,
				Roles.name AS role
			FROM Users
			JOIN Roles ON Roles.id = Users.role_id
			WHERE Users.username = ? OR Users.email = ?
			LIMIT 1`
		)
		.get(identifier, identifier) as LoginUserRow | undefined;

	return row ?? null;
}

export function createSession(userId: number): string {
	const database = getDb();
	const token = randomBytes(32).toString('hex');
	const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();

	database
		.prepare('INSERT INTO Sessions (user_id, token, expires_at) VALUES (?, ?, ?)')
		.run(userId, token, expiresAt);

	return token;
}

export function deleteSession(token: string): void {
	const database = getDb();
	database.prepare('DELETE FROM Sessions WHERE token = ?').run(token);
}

export function getUserBySessionToken(token: string): AuthUser | null {
	const database = getDb();
	const row = database
		.prepare(
			`SELECT Users.id AS id,
				Users.username AS username,
				Users.email AS email,
				Roles.name AS role,
				Sessions.expires_at AS expiresAt
			FROM Sessions
			JOIN Users ON Users.id = Sessions.user_id
			JOIN Roles ON Roles.id = Users.role_id
			WHERE Sessions.token = ?
			LIMIT 1`
		)
		.get(token) as SessionRow | undefined;

	if (!row) {
		return null;
	}

	if (new Date(row.expiresAt).getTime() <= Date.now()) {
		deleteSession(token);
		return null;
	}

	return {
		id: row.id,
		username: row.username,
		email: row.email,
		role: row.role
	};
}
