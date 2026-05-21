import { useEffect, useState } from 'react';
import { Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

const STORAGE_KEY = '@amy_user';

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
        const userData = await AsyncStorage.getItem(STORAGE_KEY);
        const user = userData ? JSON.parse(userData) : null;
        if (mounted) {
          setToken(user?.accessToken ?? null);
        }
      } catch (error) {
        console.warn('No se pudo cargar token para asset protegido:', error);
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
