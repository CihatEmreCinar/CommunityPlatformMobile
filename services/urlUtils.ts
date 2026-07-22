import { API_ORIGIN } from './apiConfig';

function isAbsoluteUrl(value: string): boolean {
  return /^(https?:)?\/\//i.test(value) || /^(file|data|content|blob):/i.test(value);
}

function toUnixPath(value: string): string {
  return value.replace(/\\/g, '/');
}

function extractPublicPath(value: string): string | null {
  const normalized = toUnixPath(value).replace(/^\.+\//, '');

  if (normalized.startsWith('wwwroot/')) return `/${normalized.slice('wwwroot/'.length)}`;
  if (normalized.startsWith('uploads/')) return `/${normalized}`;

  const uploadIndex = normalized.toLowerCase().indexOf('/uploads/');
  return uploadIndex >= 0 ? normalized.slice(uploadIndex) : null;
}

export function normalizeApiMediaUrl(value: string | null | undefined): string | null {
  if (!value) return null;

  const trimmed = toUnixPath(value.trim());
  if (!trimmed) return null;

  const isAbsolute = isAbsoluteUrl(trimmed);
  const publicPath = extractPublicPath(trimmed);

  try {
    const api = new URL(API_ORIGIN);

    if (publicPath) return `${api.origin}${publicPath.startsWith('/') ? publicPath : `/${publicPath}`}`;
    if (trimmed.startsWith('localhost:') || trimmed.startsWith('127.0.0.1:')) {
      return `${api.protocol}//${trimmed}`;
    }
    if (!isAbsolute) return trimmed.startsWith('/') ? `${api.origin}${trimmed}` : `${api.origin}/${trimmed}`;

    const candidate = new URL(trimmed.startsWith('//') ? `${api.protocol}${trimmed}` : trimmed);
    if (candidate.hostname === 'localhost' || candidate.hostname === '127.0.0.1') {
      candidate.protocol = api.protocol;
      candidate.host = api.host;
    }
    return candidate.toString();
  } catch {
    return trimmed;
  }
}

/** @deprecated Kept for source compatibility; media URLs are never logged. */
export function debugLogMediaUrl(_label: string, _raw: string | null | undefined): void {}
