export const preferenceKey = 'codesaga.preferences.v1';
export type Preferences = { theme: 'system' | 'light' | 'dark'; sound: boolean; motion: 'system' | 'reduced' };
export const defaultPreferences: Preferences = { theme: 'system', sound: false, motion: 'system' };
export function parsePreferences(raw: string | null): Preferences {
  if (!raw) return { ...defaultPreferences };
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object') return { ...defaultPreferences };
    const item = value as Record<string, unknown>;
    return {
      theme: item.theme === 'light' || item.theme === 'dark' ? item.theme : 'system',
      sound: item.sound === true,
      motion: item.motion === 'reduced' ? 'reduced' : 'system',
    };
  } catch { return { ...defaultPreferences }; }
}
