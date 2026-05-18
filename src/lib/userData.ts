import { useAuthStore } from '@/store/authStore';
import { isTauriApp, invoke } from '@/lib/tauri';

export function requireUserId(): string {
  const user = useAuthStore.getState().user;
  if (!user) throw new Error('Not signed in. Please log in again.');
  return user.id;
}

export async function syncActiveUser(userId: string | null): Promise<void> {
  if (!isTauriApp()) return;
  if (userId) {
    await invoke('set_active_user', { user_id: userId });
  } else {
    await invoke('clear_active_user');
  }
}
