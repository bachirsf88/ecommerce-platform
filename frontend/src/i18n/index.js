import {
  createElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import ar from './translations/ar';
import en from './translations/en';
import fr from './translations/fr';

export const DEFAULT_LANGUAGE = 'en';
export const LANGUAGE_STORAGE_KEY = 'flora-language';

export const languageConfig = {
  en: { code: 'en', dir: 'ltr', locale: 'en-US' },
  fr: { code: 'fr', dir: 'ltr', locale: 'fr-FR' },
  ar: { code: 'ar', dir: 'rtl', locale: 'ar-DZ-u-nu-arab' },
};

const translations = { en, fr, ar };
const languageOptions = ['en', 'fr', 'ar'];
const I18nContext = createContext(null);

let activeLanguage = DEFAULT_LANGUAGE;

function resolveNestedValue(source, key) {
  return key.split('.').reduce((current, segment) => current?.[segment], source);
}

function interpolate(value, params = {}) {
  if (typeof value !== 'string') {
    return value;
  }

  return value.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? `{${key}}`));
}

export function normalizeLanguage(value) {
  return languageOptions.includes(value) ? value : DEFAULT_LANGUAGE;
}

export function getCurrentLanguage() {
  if (typeof window === 'undefined') {
    return activeLanguage;
  }

  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

  return normalizeLanguage(stored || activeLanguage);
}

export function getLocaleForLanguage(language = getCurrentLanguage()) {
  return languageConfig[normalizeLanguage(language)].locale;
}

export function getDirectionForLanguage(language = getCurrentLanguage()) {
  return languageConfig[normalizeLanguage(language)].dir;
}

export function translate(key, params = {}, language = getCurrentLanguage()) {
  const normalizedLanguage = normalizeLanguage(language);
  const localizedValue = resolveNestedValue(translations[normalizedLanguage], key);
  const fallbackValue = resolveNestedValue(translations[DEFAULT_LANGUAGE], key);
  const resolvedValue = localizedValue ?? fallbackValue;

  if (typeof resolvedValue === 'undefined') {
    return key;
  }

  return interpolate(resolvedValue, params);
}

function readInitialLanguage() {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE;
  }

  return normalizeLanguage(window.localStorage.getItem(LANGUAGE_STORAGE_KEY) || DEFAULT_LANGUAGE);
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(readInitialLanguage);

  const setLanguage = useCallback((nextLanguage) => {
    const normalizedLanguage = normalizeLanguage(nextLanguage);

    activeLanguage = normalizedLanguage;
    setLanguageState(normalizedLanguage);
  }, []);

  useEffect(() => {
    activeLanguage = language;
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
    document.documentElement.dir = getDirectionForLanguage(language);
  }, [language]);

  const value = useMemo(() => {
    const dir = getDirectionForLanguage(language);
    const locale = getLocaleForLanguage(language);

    return {
      language,
      setLanguage,
      dir,
      locale,
      isRTL: dir === 'rtl',
      t: (key, params) => translate(key, params, language),
    };
  }, [language, setLanguage]);

  return createElement(I18nContext.Provider, { value }, children);
}

export function useTranslation() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }

  return context;
}

export function useLanguage() {
  return useTranslation();
}

export const supportedLanguages = languageOptions.map((code) => ({
  code,
  dir: languageConfig[code].dir,
}));
