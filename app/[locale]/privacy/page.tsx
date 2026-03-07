'use client';

import { useTranslations } from 'next-intl';

export default function PrivacyPolicy() {
  const t = useTranslations('privacy');

  const dataCollectionItems: string[] = t.raw('dataCollection.items');
  const dataUseItems: string[] = t.raw('dataUse.items');
  const rightsItems: string[] = t.raw('rights.items');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
        <p className="text-sm text-gray-500 mb-8">{t('lastUpdated')}</p>

        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 space-y-8">
          <p className="text-gray-700">{t('intro')}</p>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">{t('dataCollection.title')}</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {dataCollectionItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">{t('dataUse.title')}</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {dataUseItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">{t('thirdParty.title')}</h2>
            <p className="text-gray-700">{t('thirdParty.description')}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">{t('retention.title')}</h2>
            <p className="text-gray-700">{t('retention.description')}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">{t('rights.title')}</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {rightsItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">{t('contact.title')}</h2>
            <p className="text-gray-700">{t('contact.description')}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
