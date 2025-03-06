// lib/contentful.ts
import { createClient } from 'contentful';

const isPreview = process.env.NEXT_PUBLIC_CONTENTFUL_PREVIEW === 'true';
const space = process.env.NEXT_PUBLIC_SPACE_ID;
const environment = process.env.NEXT_PUBLIC_ENVIRONMENT || 'master';
const accessToken = isPreview
  ? process.env.NEXT_PUBLIC_CONTENTFUL_PREVIEW_ACCESS_TOKEN
  : process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN;

if (!space || !accessToken) {
  throw new Error('Missing Contentful environment variables.');
}

console.log('Contentful Config:', {
  space,
  environment,
  accessToken,
});

const client = createClient({
  space,
  environment,
  accessToken,
  host: isPreview ? 'preview.contentful.com' : 'cdn.contentful.com',
});

export default client;
