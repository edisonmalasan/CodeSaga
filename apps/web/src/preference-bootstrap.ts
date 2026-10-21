import { preferenceKey } from './preferences-model';

// Runs synchronously in <head>, before the body exists. Only fixed enum values
// reach attributes; stored text is never inserted into HTML or executed.
// Keep these two guards aligned with parsePreferences; production browser tests
// exercise the emitted script with hydration held back and malformed storage.
export const preferenceBootstrap = `(() => {
  let theme = 'system', motion = 'system';
  try {
    const value = JSON.parse(localStorage.getItem(${JSON.stringify(preferenceKey)}) || 'null');
    if (value && typeof value === 'object') {
      if (value.theme === 'light' || value.theme === 'dark') theme = value.theme;
      if (value.motion === 'reduced') motion = value.motion;
    }
  } catch {}
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.motion = motion;
})();`;
