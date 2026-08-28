'use client';

import { useState } from 'react';
import { Languages } from 'lucide-react';

export default function LanguageToggle() {
  const [lang, setLang] = useState<'EN' | 'KN'>('EN');

  const toggleLanguage = () => {
    const nextLang = lang === 'EN' ? 'KN' : 'EN';
    setLang(nextLang);
    document.documentElement.lang = nextLang === 'KN' ? 'kn' : 'en';
  };

  return (
    <button
      onClick={toggleLanguage}
      type="button"
      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-xs backdrop-blur-xs transition hover:border-blue-300 hover:text-blue-600"
      title="Switch Language / ಭಾಷೆ ಬದಲಾಯಿಸಿ"
    >
      <Languages className="h-3.5 w-3.5 text-blue-600" />
      <span>{lang === 'EN' ? 'ಕನ್ನಡ' : 'English'}</span>
    </button>
  );
}