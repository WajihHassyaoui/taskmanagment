import { create } from 'zustand';
import { isTauriApp, invoke } from '@/lib/tauri';
import { syncActiveUser } from '@/lib/userData';
import {
  localGetUserById,
  localHasUsers,
  localLogin,
  localRegister,
} from '@/lib/localAuth';
import { useNoteStore } from '@/store/noteStore';
import { useStatsStore } from '@/store/statsStore';
import { useTaskStore } from '@/store/taskStore';

export interface AuthUser {
  id: string;
  username: string;
  display_name: string;
}

const SESSION_KEY = 'yalla-task-go-session';

function loadSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function saveSession(user: AuthUser | null) {
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

function clearUserDataStores() {
  useTaskStore.setState({ tasks: [], error: null, loading: false });
  useNoteStore.setState({ notes: [], error: null, loading: false });
  useStatsStore.setState({
    dashboardStats: null,
    weeklyStats: [],
    achievements: [],
    error: null,
    loading: false,
  });
}

async function applySession(user: AuthUser | null) {
  saveSession(user);
  await syncActiveUser(user?.id ?? null);
  if (!user) clearUserDataStores();
}

interface AuthState {
  user: AuthUser | null;
  initialized: boolean;
  loading: boolean;
  error: string | null;
  hasUsers: boolean | null;
  init: () => Promise<void>;
  checkHasUsers: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  initialized: false,
  loading: false,
  error: null,
  hasUsers: null,

  init: async () => {
    const cached = loadSession();
    if (!cached) {
      await applySession(null);
      set({ user: null, initialized: true });
      await get().checkHasUsers();
      return;
    }

    try {
      if (isTauriApp()) {
        const user = await invoke<AuthUser>('get_user_by_id', { id: cached.id });
        await applySession(user);
        set({ user, initialized: true });
      } else {
        const user = localGetUserById(cached.id);
        await applySession(user);
        set({ user: user ?? null, initialized: true });
      }
    } catch {
      await applySession(null);
      set({ user: null, initialized: true });
    }
    await get().checkHasUsers();
  },

  checkHasUsers: async () => {
    try {
      const hasUsers = isTauriApp()
        ? await invoke<boolean>('has_users')
        : localHasUsers();
      set({ hasUsers });
    } catch {
      set({ hasUsers: false });
    }
  },

  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const user = isTauriApp()
        ? await invoke<AuthUser>('login', {
            input: { username, password },
          })
        : await localLogin(username, password);
      await applySession(user);
      set({ user, loading: false, hasUsers: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  register: async (username, password, displayName) => {
    set({ loading: true, error: null });
    try {
      const user = isTauriApp()
        ? await invoke<AuthUser>('register', {
            input: { username, password, display_name: displayName },
          })
        : await localRegister(username, password, displayName);
      await applySession(user);
      set({ user, loading: false, hasUsers: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  logout: () => {
    void applySession(null);
    set({ user: null, error: null });
  },
}));
