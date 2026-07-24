import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

/**
 * Cihazın internet bağlantısı olup olmadığını izler. `isConnected` VEYA
 * `isInternetReachable` açıkça false ise offline sayılır; ilki bilinmeyen
 * (null) durumda ikinciye güvenilir — bazı platformlarda ilk event'e kadar
 * ikisi de null gelebilir, bu durumda "online" varsayılır (yanlış negatif
 * banner göstermemek için).
 */
export function useNetworkStatus() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const offline = state.isConnected === false || state.isInternetReachable === false;
      setIsOffline(offline);
    });

    return () => unsubscribe();
  }, []);

  return { isOffline };
}
