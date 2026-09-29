import { ref } from 'vue';
import en, { type I18nKey } from './locales/en';

export type { I18nKey } from './locales/en';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

type Messages = Record<I18nKey, string>;

/* Peaches ships in English only. The lookup table is kept as a seam for
   future locales rather than being collapsed to a bare import. */
const messages: Record<'en', Messages> = { en };

/* ------------------------------------------------------------------ */
/*  Shared state (singleton across components)                        */
/* ------------------------------------------------------------------ */

const THEME_KEY = 'peaches-theme';

const isDark = ref<boolean>(
  typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false,
);

const toggleDarkMode = (): void => {
  const next = !isDark.value;
  isDark.value = next;
  document.documentElement.classList.toggle('dark', next);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
  }
};

/* ------------------------------------------------------------------ */
/*  Composable                                                        */
/* ------------------------------------------------------------------ */

/**
 * Translation lookup plus theme control.
 *
 * `isDark` and `toggleDarkMode` are module-level on purpose: a per-instance
 * ref here would give each component its own copy, and the class list is the
 * real source of truth. Keep them at module scope.
 */
export function useI18n() {
  const t = (key: I18nKey): string => messages.en[key];

  return { t, isDark, toggleDarkMode };
}
