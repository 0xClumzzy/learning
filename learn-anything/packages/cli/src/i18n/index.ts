import type { SupportedLocale, LocaleMessages } from './types.js';
import { SUPPORTED_LOCALES } from './types.js';
import { en } from './locales/en.js';

/* English is the only locale. The lookup table is kept so that adding a
   locale later is a one-line change here plus a new file under locales/. */
const messages: Record<SupportedLocale, LocaleMessages> = { en };

export function getMessages(_locale?: SupportedLocale): LocaleMessages {
  return messages.en;
}

/** Always `en` — retained so callers keep a single resolution path. */
export function detectSystemLocale(): SupportedLocale {
  return 'en';
}

/**
 * Resolve a locale flag. Only `en` is supported, so anything else (including
 * a previously-valid `zh-CN`) falls back to English. No warning is printed:
 * a stale flag in a script is not worth failing a command over.
 */
export function resolveLocale(cliFlag?: string): SupportedLocale {
  if (cliFlag && SUPPORTED_LOCALES.includes(cliFlag as SupportedLocale)) {
    return cliFlag as SupportedLocale;
  }
  return 'en';
}

export function getSupportedLocales(): readonly SupportedLocale[] {
  return SUPPORTED_LOCALES;
}

export type { SupportedLocale, LocaleMessages, ServeMessages } from './types.js';
