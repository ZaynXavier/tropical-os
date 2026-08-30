// TropicalOS Mobile API Client
import AsyncStorage from '@react-native-async-storage/async-storage';

// Default to localhost, configurable in Profile screen for testing on physical devices (e.g. 192.168.1.3:8000)
export const DEFAULT_API_BASE_URL = 'http://localhost:8000/api/v1';

export async function getApiBaseUrl(): Promise<string> {
  const custom = await AsyncStorage.getItem('TROPICAL_API_HOST');
  return custom || DEFAULT_API_BASE_URL;
}

export async function setApiBaseUrl(url: string): Promise<void> {
  await AsyncStorage.setItem('TROPICAL_API_HOST', url);
}

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<any> {
  const baseUrl = await getApiBaseUrl();
  const token = await AsyncStorage.getItem('TROPICAL_STAFF_TOKEN');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
    });
    return await res.json();
  } catch (err) {
    console.warn(`[Mobile API] Error calling ${endpoint}:`, err);
    return { success: false, message: 'Gagal terhubung ke server backend.' };
  }
}
