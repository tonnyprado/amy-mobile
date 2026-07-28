import { useEffect, useState } from 'react';
import { Image } from 'react-native';
import { getToken } from '../utils/secureStorage';
import { API_BASE_URL } from '../config/api';

function isProtectedAssetUrl(uri) {
  if (!uri || uri.startsWith('data:') || uri.startsWith('file:') || uri.startsWith('blob:')) {
    return false;
  }

  return uri.includes('/api/archivos/local/')
    || uri.includes('/uploads/')
    || uri.startsWith('/api/archivos/local/')
    || uri.startsWith('/uploads/');
}

function normalizeUri(uri) {
  if (!uri) {
    return uri;
  }

  if (uri.startsWith('http://') || uri.startsWith('https://')) {
    return uri;
  }

  return `${API_BASE_URL}${uri}`;
}

export default function AuthenticatedImage({ source, ...props }) {
  const [token, setToken] = useState(null);
  const uri = source?.uri;
  const requiresAuth = isProtectedAssetUrl(uri);

  useEffect(() => {
    let mounted = true;

    async function loadToken() {
      if (!requiresAuth) {
        setToken(null);
        return;
      }

      try {
        const storedToken = await getToken();
        if (mounted) {
          setToken(storedToken ?? null);
        }
      } catch {
        if (mounted) {
          setToken(null);
        }
      }
    }

    loadToken();

    return () => {
      mounted = false;
    };
  }, [requiresAuth]);

  const resolvedSource = requiresAuth
    ? {
        uri: normalizeUri(uri),
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }
    : source;

  return <Image {...props} source={resolvedSource} />;
}
