import { Linking, Platform } from 'react-native';

/**
 * "İlçe, İl" biçiminde tek satır konum metni üretir. İkisi de yoksa null
 * döner (çağıran taraf bu durumda satırı hiç göstermeyebilir).
 */
export function formatCityDistrict(
  city?: string | null,
  district?: string | null
): string | null {
  const parts = [district?.trim(), city?.trim()].filter((p): p is string => !!p);
  if (parts.length === 0) return null;
  return parts.join(', ');
}

/**
 * Verilen koordinat için cihazın harita uygulamasını (Apple Maps / Google
 * Maps) açar. react-native-maps gibi ek bir native bağımlılık gerektirmez —
 * sadece işletim sistemine göre doğru deep-link şemasını seçer.
 */
export async function openMapsForCoordinate(
  latitude: number,
  longitude: number,
  label?: string
): Promise<void> {
  const query = label ? encodeURIComponent(label) : `${latitude},${longitude}`;
  const url =
    Platform.OS === 'ios'
      ? `maps:0,0?q=${query}@${latitude},${longitude}`
      : `geo:${latitude},${longitude}?q=${latitude},${longitude}(${query})`;

  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    await Linking.openURL(url);
    return;
  }

  // Fallback: platform bağımsız web haritası
  await Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`);
}
