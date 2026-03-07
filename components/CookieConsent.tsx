'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';

const CONSENT_KEY = 'gpulaw-cookie-consent';

export default function CookieConsent() {
  const t = useTranslations('consent');
  const locale = useLocale();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ accepted: true, timestamp: new Date().toISOString() }));
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ accepted: false, timestamp: new Date().toISOString() }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-blue-600 shadow-2xl p-4 sm:p-6">
      <div className="container mx-auto max-w-4xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-sm mb-1">{t('title')}</h3>
          <p className="text-sm text-gray-600">{t('message')}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={`/${locale}/privacy`}
            className="text-sm text-blue-600 hover:underline whitespace-nowrap"
          >
            {t('learnMore')}
          </a>
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {t('decline')}
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('accept')}
          </button>
        </div>
      </div>
    </div>
  );
}
