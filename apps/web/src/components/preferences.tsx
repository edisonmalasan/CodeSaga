'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { defaultPreferences, parsePreferences, preferenceKey, type Preferences } from '../preferences-model';
import { Icon } from './icons';

const PreferenceContext = createContext({ preferences: defaultPreferences, update: (_value: Partial<Preferences>) => {}, storageFailed: false });
export function PreferenceProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [storageFailed, setStorageFailed] = useState(false);
  const current = useRef<Preferences>(defaultPreferences);
  const sound = useRef(false);
  const apply = (next: Preferences) => {
    current.current = next;
    document.documentElement.dataset.theme = next.theme;
    document.documentElement.dataset.motion = next.motion;
    sound.current = next.sound;
    setPreferences(next);
  };
  useEffect(() => {
    try { apply(parsePreferences(localStorage.getItem(preferenceKey))); }
    catch { setStorageFailed(true); }
    const synchronize = (event: StorageEvent) => {
      try {
        if (event.storageArea !== window.localStorage) return;
        if (event.key === preferenceKey || event.key === null) apply(parsePreferences(event.newValue));
      } catch { setStorageFailed(true); }
    };
    window.addEventListener('storage', synchronize);
    return () => window.removeEventListener('storage', synchronize);
  }, []);
  useEffect(() => {
    const feedback = (event: MouseEvent) => {
      if (!sound.current || !(event.target instanceof Element) || !event.target.closest('a,button')) return;
      try {
        if (!window.AudioContext) return;
        const audio = new AudioContext();
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();
        oscillator.type = 'sine'; oscillator.frequency.value = 520;
        gain.gain.setValueAtTime(0.025, audio.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.045);
        oscillator.connect(gain); gain.connect(audio.destination);
        oscillator.start(); oscillator.stop(audio.currentTime + 0.05);
        oscillator.onended = () => { void audio.close().catch(() => {}); };
      } catch { /* Optional audio never prevents navigation. */ }
    };
    document.addEventListener('click', feedback);
    return () => document.removeEventListener('click', feedback);
  }, []);
  const update = (value: Partial<Preferences>) => {
    const next = { ...current.current, ...value };
    apply(next);
    try { localStorage.setItem(preferenceKey, JSON.stringify(next)); setStorageFailed(false); }
    catch { setStorageFailed(true); }
  };
  return <PreferenceContext.Provider value={{ preferences, update, storageFailed }}>{children}</PreferenceContext.Provider>;
}

export function PreferenceControls() {
  const { preferences, update, storageFailed } = useContext(PreferenceContext);
  const details = useRef<HTMLDetailsElement>(null);
  return <details className="preferences" ref={details} onKeyDown={(event) => {
    if (event.key === 'Escape' && details.current) {
      details.current.open = false; details.current.querySelector('summary')?.focus();
    }
  }}>
    <summary><Icon name="settings" /><span className="sr-only">Display and sound preferences</span></summary>
    <div className="preference-panel">
      <h2>Make yourself comfortable</h2>
      <div className="preference-field"><label htmlFor="appearance-preference">Appearance</label><select id="appearance-preference" value={preferences.theme} onChange={(event) => update({ theme: event.target.value as Preferences['theme'] })}><option value="system">Use device setting</option><option value="light">Daylight</option><option value="dark">Nightfall</option></select></div>
      <div className="preference-field"><label htmlFor="motion-preference">Motion</label><select id="motion-preference" value={preferences.motion} onChange={(event) => update({ motion: event.target.value as Preferences['motion'] })}><option value="system">Use device setting</option><option value="reduced">Reduce motion</option></select></div>
      <label className="checkbox-label"><input type="checkbox" checked={preferences.sound} onChange={(event) => update({ sound: event.target.checked })} />Quiet navigation sounds</label>
      <p>Sound is optional and off by default. Preferences stay in this browser.</p>
      {storageFailed && <p className="storage-notice" role="status">Browser storage is unavailable. Your choices work for this session.</p>}
    </div>
  </details>;
}
