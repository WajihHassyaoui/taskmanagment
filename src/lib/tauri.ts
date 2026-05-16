import { invoke as tauriInvoke, isTauri } from '@tauri-apps/api/core';

export function isTauriApp(): boolean {
  return isTauri();
}

export async function invoke<T>(
  cmd: string,
  args?: Record<string, unknown>
): Promise<T> {
  if (!isTauriApp()) {
    throw new Error(
      'Desktop backend is not available. Close the browser tab and run the app with: npm run tauri dev'
    );
  }
  return tauriInvoke<T>(cmd, args);
}
