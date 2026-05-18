import bcrypt from 'bcryptjs';
import type { AuthUser } from '@/store/authStore';

const USERS_KEY = 'yalla-task-go-users';

interface StoredUser {
  id: string;
  username: string;
  display_name: string;
  password_hash: string;
}

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

export function localHasUsers(): boolean {
  return readUsers().length > 0;
}

export async function localRegister(
  username: string,
  password: string,
  displayName: string
): Promise<AuthUser> {
  const u = normalizeUsername(username);
  if (u.length < 3) throw new Error('Username must be at least 3 characters');
  if (password.length < 6) throw new Error('Password must be at least 6 characters');
  if (!displayName.trim()) throw new Error('Display name is required');

  const users = readUsers();
  if (users.some((x) => x.username === u)) {
    throw new Error('Username is already taken');
  }

  const password_hash = await bcrypt.hash(password, 10);
  const user: StoredUser = {
    id: crypto.randomUUID(),
    username: u,
    display_name: displayName.trim(),
    password_hash,
  };
  writeUsers([...users, user]);
  return { id: user.id, username: user.username, display_name: user.display_name };
}

export async function localLogin(username: string, password: string): Promise<AuthUser> {
  const u = normalizeUsername(username);
  const users = readUsers();
  const found = users.find((x) => x.username === u);
  if (!found) throw new Error('Invalid username or password');

  const ok = await bcrypt.compare(password, found.password_hash);
  if (!ok) throw new Error('Invalid username or password');

  return {
    id: found.id,
    username: found.username,
    display_name: found.display_name,
  };
}

export function localGetUserById(id: string): AuthUser | null {
  const found = readUsers().find((x) => x.id === id);
  if (!found) return null;
  return {
    id: found.id,
    username: found.username,
    display_name: found.display_name,
  };
}
