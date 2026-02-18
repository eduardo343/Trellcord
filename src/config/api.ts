const LOCAL_API_BASE_URL = 'http://localhost:3001/api/v1';
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1']);

function normalizeApiBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

function getFallbackApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    return LOCAL_API_BASE_URL;
  }

  return LOCAL_HOSTNAMES.has(window.location.hostname) ? LOCAL_API_BASE_URL : '/api/v1';
}

function resolveApiBaseUrl(): string {
  const configuredApiBaseUrl = process.env.REACT_APP_API_URL?.trim();

  if (configuredApiBaseUrl) {
    return normalizeApiBaseUrl(configuredApiBaseUrl);
  }

  const fallbackApiBaseUrl = getFallbackApiBaseUrl();

  if (process.env.NODE_ENV === 'production') {
    console.warn(
      `[config] REACT_APP_API_URL is not set. Using fallback API URL "${fallbackApiBaseUrl}".`
    );
  }

  return fallbackApiBaseUrl;
}

export const API_BASE_URL = resolveApiBaseUrl();
