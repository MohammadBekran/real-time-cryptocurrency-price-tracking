export const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Real-Time Cryptocurrency Price Tracking',
  url: 'https://real-time-cryptocurrency-price-trac.vercel.app',
  description:
    'Track cryptocurrency prices in real-time with advanced charts. Built with Next.js, React and TypeScript',
  potentialAction: [
    {
      '@type': 'TrackAction',
      target: 'https://real-time-cryptocurrency-price-trac.vercel.app/track/{crypto_id}',
      'query-input': 'required name=crypto_id',
    },
    {
      '@type': 'TradeAction',
      target: 'https://real-time-cryptocurrency-price-trac.vercel.app/trade/{crypto_id}',
      'query-input': 'required name=crypto_id',
    },
  ],
};

export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Real-Time Cryptocurrency Price Tracking',
  url: 'https://real-time-cryptocurrency-price-trac.vercel.app',
  sameAs: ['https://github.com/MohammadBekran', 'https://www.linkedin.com/in/mohammad-bekran'],
};

export const breadcrumbJsonLd = (items: { name: string; item: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.item,
  })),
});

export const tradingDashboardJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Cryptocurrency Trading Dashboard',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    category: 'Cryptocurrency Trading',
    price: '0',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
  },
  featureList: [
    'Real-time price chart',
    'Market overview statistics',
    'Order placement interface',
    'Recent trades tracking',
    'Live price updates via WebSocket',
  ],
  screenshot: 'https://real-time-cryptocurrency-price-trac.vercel.app/screenshot.png',
  softwareVersion: '0.1.0',
  browserRequirements: 'Requires JavaScript. Requires HTML5.',
};
