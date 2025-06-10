export interface IJsonLdData {
  '@context': string;
  '@type': string;
  name?: string;
  url?: string;
  description?: string;
  potentialAction?: IJsonLdAction[];
  sameAs?: string[];
  applicationCategory?: string;
  operatingSystem?: string;
  offers?: IJsonLdOffer;
  featureList?: string[];
  screenshot?: string;
  softwareVersion?: string;
  browserRequirements?: string;
}

interface IJsonLdAction {
  '@type': string;
  target: string;
  'query-input': string;
}

interface IJsonLdOffer {
  '@type': string;
  category: string;
  price: string;
  priceCurrency: string;
  availability: string;
}
