const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, '') ?? '';

function isAbsoluteUrl(value: string): boolean {
  return /^(https?:)?\/\//i.test(value) || /^(file|data|content|blob):/i.test(value);
}

function toUnixPath(value: string): string {
  return value.replace(/\\/g, '/');
}

function extractPublicPath(value: string): string | null {
  const normalized = toUnixPath(value).replace(/^\.+\//, '');

  if (normalized.startsWith('wwwroot/')) {
    return `/${normalized.slice('wwwroot/'.length)}`;
  }

  if (normalized.startsWith('uploads/')) {
    return `/${normalized}`;
  }

  const uploadIndex = normalized.toLowerCase().indexOf('/uploads/');
  if (uploadIndex >= 0) {
    return normalized.slice(uploadIndex);
  }

  return null;
}

export function normalizeApiMediaUrl(value: string | null | undefined): string | null {
  if (!value) return null;

  const trimmed = toUnixPath(value.trim());
  if (!trimmed) return null;

  const isAbsolute = isAbsoluteUrl(trimmed);
  const publicPath = extractPublicPath(trimmed);

  if (__DEV__) {
    console.log('[URL_NORM] API_URL=', API_URL, '| input=', trimmed, '| isAbsolute=', isAbsolute, '| publicPath=', publicPath);
  }

  if (!API_URL) {
    if (isAbsolute) return trimmed;
    // Relative media URL cannot be rendered reliably in native without a base host.
    return null;
  }

  try {
    const api = new URL(API_URL);

    if (publicPath) {
      return `${api.origin}${publicPath.startsWith('/') ? publicPath : `/${publicPath}`}`;
    }

    if (trimmed.startsWith('localhost:') || trimmed.startsWith('127.0.0.1:')) {
      return `${api.protocol}//${trimmed}`;
    }

    if (!isAbsolute) {
      if (trimmed.startsWith('/')) {
        return `${api.origin}${trimmed}`;
      }
      return `${api.origin}/${trimmed}`;
    }

    const candidate = new URL(trimmed.startsWith('//') ? `${api.protocol}${trimmed}` : trimmed);
    if (candidate.hostname === 'localhost' || candidate.hostname === '127.0.0.1') {
      candidate.protocol = api.protocol;
      candidate.host = api.host;
      return candidate.toString();
    }
    return candidate.toString();
  } catch {
    return trimmed;
  }
}

export function debugLogMediaUrl(label: string, raw: string | null | undefined): void {
  if (!__DEV__) return;
  const normalized = normalizeApiMediaUrl(raw);
  console.log(`[MEDIA_DEBUG] ${label} | raw=`, JSON.stringify(raw), '| normalized=', JSON.stringify(normalized));
}