const rawApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

if (!rawApiUrl) {
  throw new Error('EXPO_PUBLIC_API_URL must be set to the API origin, for example https://api.example.com.');
}

let parsedApiUrl: URL;
try {
  parsedApiUrl = new URL(rawApiUrl);
} catch {
  throw new Error('EXPO_PUBLIC_API_URL must be an absolute HTTP(S) URL.');
}

if (parsedApiUrl.protocol !== 'http:' && parsedApiUrl.protocol !== 'https:') {
  throw new Error('EXPO_PUBLIC_API_URL must use HTTP or HTTPS.');
}

export const API_ORIGIN = parsedApiUrl.origin;
export const API_BASE_URL = new URL('/api/v1/', parsedApiUrl).toString().replace(/\/$/, '');
