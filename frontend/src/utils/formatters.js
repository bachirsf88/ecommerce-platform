import { getLocaleForLanguage, translate } from '../i18n';

export function formatCurrency(value) {
  const amount = Number(value ?? 0);
  const locale = getLocaleForLanguage();

  if (Number.isNaN(amount)) {
    return '0 DA';
  }

  const hasFraction = !Number.isInteger(amount);
  const formattedAmount = new Intl.NumberFormat(locale, {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: hasFraction ? 2 : 2,
  }).format(amount);

  return `${formattedAmount} DA`;
}

export function formatShortDate(value) {
  const locale = getLocaleForLanguage();

  if (!value) {
    return translate('common.recently');
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return translate('common.recently');
  }

  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(value) {
  const locale = getLocaleForLanguage();

  if (!value) {
    return translate('common.recently');
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return translate('common.recently');
  }

  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}
