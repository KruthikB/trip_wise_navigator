
'use client';

import { useLanguage } from './use-language';
import { translations } from '@/lib/translations';

export const useTranslation = () => {
  const { language } = useLanguage();

  const t = (key: string, replacements?: { [key: string]: string | number }) => {
    const langKey = language as keyof typeof translations;
    const translationSet = translations[langKey] || translations.en;
    let text = translationSet[key as keyof typeof translationSet] || key;

    if (replacements) {
        Object.keys(replacements).forEach(rKey => {
            text = text.replace(`{${rKey}}`, String(replacements[rKey]));
        })
    }

    return text;
  };

  return { t };
};
