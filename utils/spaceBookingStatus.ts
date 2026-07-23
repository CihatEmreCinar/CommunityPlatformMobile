import { Pastel } from '../constants/theme';
import type { SpaceBookingStatus } from '../services/spaceBookingService';

export interface SpaceBookingStatusStyle {
  label: string;
  color: string;
  bg: string;
}

// Durum = kategori rengi: bekleyen amber, onaylı teal, reddedilen/iptal coral, tamamlanan mor.
export const SPACE_BOOKING_STATUS_STYLES: Record<SpaceBookingStatus, SpaceBookingStatusStyle> = {
  Pending: { label: 'Bekliyor', color: Pastel.amber.text, bg: Pastel.amber.tintStrong },
  Approved: { label: 'Onaylandı', color: Pastel.teal.text, bg: Pastel.teal.tintStrong },
  Rejected: { label: 'Reddedildi', color: Pastel.coral.text, bg: Pastel.coral.tintStrong },
  Cancelled: { label: 'İptal', color: Pastel.coral.text, bg: Pastel.coral.tint },
  Completed: { label: 'Tamamlandı', color: Pastel.purple.text, bg: Pastel.purple.tintStrong },
};

export function getSpaceBookingStatusStyle(status: SpaceBookingStatus): SpaceBookingStatusStyle {
  return SPACE_BOOKING_STATUS_STYLES[status] ?? SPACE_BOOKING_STATUS_STYLES.Pending;
}
