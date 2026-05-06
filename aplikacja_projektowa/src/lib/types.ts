export type SessionUser = {
	id: number;
	username: string;
	email: string;
	role: string;
};

export type LayoutData = {
	user: SessionUser | null;
};
