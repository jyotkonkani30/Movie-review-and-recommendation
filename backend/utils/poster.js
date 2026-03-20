const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

const isAbsoluteUrl = (value) => /^https?:\/\//i.test(value);

// Normalizes mixed poster formats (TMDB full URL, relative path, "N/A") into a safe stored value.
export const normalizePosterPath = (posterValue) => {
  if (!posterValue || typeof posterValue !== 'string') {
    return '';
  }

  const value = posterValue.trim();

  if (!value || value.toLowerCase() === 'n/a' || value.toLowerCase() === 'null' || value.toLowerCase() === 'undefined') {
    return '';
  }

  if (value.startsWith('//')) {
    return normalizePosterPath(`https:${value}`);
  }

  if (isAbsoluteUrl(value)) {
    try {
      const parsed = new URL(value);
      const host = parsed.hostname.toLowerCase();

      if (host.includes('image.tmdb.org')) {
        const match = parsed.pathname.match(/^\/t\/p\/(?:w\d+|original)\/(.+)$/i);
        if (match && match[1]) {
          return `/${match[1]}`;
        }

        return parsed.pathname.startsWith('/') ? parsed.pathname : `/${parsed.pathname}`;
      }

      return value;
    } catch {
      return value;
    }
  }

  const tmdbSizedPathMatch = value.match(/^t\/p\/(?:w\d+|original)\/(.+)$/i);
  if (tmdbSizedPathMatch && tmdbSizedPathMatch[1]) {
    return `/${tmdbSizedPathMatch[1]}`;
  }

  return value.startsWith('/') ? value : `/${value}`;
};

export const toPosterUrl = (posterValue) => {
  const normalized = normalizePosterPath(posterValue);
  if (!normalized) {
    return '';
  }

  if (isAbsoluteUrl(normalized)) {
    return normalized;
  }

  return `${TMDB_IMAGE_BASE}${normalized}`;
};

export const normalizeMoviePosterInput = (payload = {}) => {
  return normalizePosterPath(
    payload.posterPath || payload.poster_path || payload.poster || payload.Poster || ''
  );
};

export const withNormalizedPoster = (item = {}) => {
  if (!item) {
    return item;
  }

  const posterPath = normalizePosterPath(item.posterPath);

  return {
    ...item,
    posterPath,
    posterUrl: toPosterUrl(posterPath)
  };
};

export const mapItemsWithNormalizedPoster = (items = []) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) => withNormalizedPoster(item));
};
