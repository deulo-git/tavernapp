export type ThemePreference = 'light' | 'dark' | 'auto';

const KEY = 'tavernapp.theme';

export function getThemePreference(): ThemePreference {
  const value = localStorage.getItem(KEY);
  return value === 'light' || value === 'dark' ? value : 'auto';
}

export function applyTheme(pref: ThemePreference = getThemePreference()) {
  const dark = pref === 'dark' || (pref === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#221b15' : '#fffdf9');
}

export function setThemePreference(pref: ThemePreference) {
  localStorage.setItem(KEY, pref);
  applyTheme(pref);
}

export function watchSystemTheme() {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => applyTheme());
}
