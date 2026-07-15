import { useCallback, useState } from 'react';
import * as Location from 'expo-location';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * "Konumumu Kullan" butonlarının ortak mantığı: izin iste, GPS koordinatını
 * al. Cafe profili (adres pin'i) ve atölye oluşturma ekranında aynı akış
 * kullanılır; employee ana sayfasındaki "Yakınımdakiler" bölümü de aynı
 * hook'u sessizce (izin reddedilirse backend'in fallback zincirine düşerek)
 * kullanır.
 */
export function useCurrentLocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = useCallback(async (): Promise<Coordinates | null> => {
    setLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Konum izni verilmedi.');
        return null;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } catch {
      setError('Konum alınamadı. Lütfen konum servislerinin açık olduğundan emin olun.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { getCurrentLocation, loading, error };
}

export default useCurrentLocation;
