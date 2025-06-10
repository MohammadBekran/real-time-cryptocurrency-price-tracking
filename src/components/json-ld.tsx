import Script from 'next/script';

import type { IJsonLdData } from '@/core/types';

interface IJsonLdProps {
  data: IJsonLdData;
}

const JsonLd = ({ data }: IJsonLdProps) => {
  return (
    <Script
      id="json-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};

export default JsonLd;
