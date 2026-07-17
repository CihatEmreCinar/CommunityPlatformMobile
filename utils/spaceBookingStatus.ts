import { Colors } from '../constants/theme';
import type { SpaceBookingStatus } from '../services/spaceBookingService';

export interface SpaceBookingStatusStyle {
  label: string;
  color: string;
  bg: string;
}

/**
 * employer/bookings.tsx ve (cafe)/(tabs)/bookings.tsx içinde birebir aynı
 * tanımlıydı — buraya değişiklik yapılmadan taşındı.
 */
export const SPACE_BOOKING_STATUS_STYLES: Record<SpaceBookingStatus, SpaceBookingStatusStyle> = {
  Pending: { label: 'Bekliyor', color: Colors.secondary, bg: Colors.secondaryContainer },
  Approved: { label: 'Onaylandı', color: Colors.primary, bg: Colors.primaryContainer },
  Rejected: { label: 'Reddedildi', color: Colors.error, bg: Colors.errorContainer },
  Cancelled: { label: 'İptal', color: Colors.outline, bg: Colors.surfaceContainer },
  Completed: { label: 'Tamamlandı', color: '#0F766E', bg: '#CCFBF1' },
};

export function getSpaceBookingStatusStyle(status: SpaceBookingStatus): SpaceBookingStatusStyle {
  return SPACE_BOOKING_STATUS_STYLES[status] ?? SPACE_BOOKING_STATUS_STYLES.Pending;
}
