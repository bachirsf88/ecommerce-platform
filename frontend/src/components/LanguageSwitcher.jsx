import { useTranslation, supportedLanguages } from '../i18n';

function LanguageSwitcher({ compact = false }) {
  const { language, setLanguage, t } = useTranslation();

  return (
    <label className="inline-flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-faint)]">
      <span className="whitespace-nowrap">{compact ? t('languageSwitcher.shortLabel') : t('languageSwitcher.label')}</span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
        aria-label={t('languageSwitcher.label')}
        className="rounded-full border border-[var(--color-border)] bg-[rgba(255,255,255,0.86)] px-3 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[var(--color-text)] outline-none"
      >
        {supportedLanguages.map((item) => (
          <option key={item.code} value={item.code}>
            {t(`languageSwitcher.${item.code}`)}
          </option>
        ))}
      </select>
    </label>
  );
}

export default LanguageSwitcher;
