import { MetadataRoute } from 'next';

const sitemap = (): MetadataRoute.Sitemap => {
  const baseUrl = 'https://real-time-cryptocurrency-price-trac.vercel.app';
  const currentDate = new Date().toISOString();

  return [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'never' as const,
      priority: 1,
    },
  ];
};

export default sitemap;
