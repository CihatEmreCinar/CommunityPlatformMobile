import { workshopService } from './workshopService';
import { spaceBookingService } from './spaceBookingService';
import { Colors, Pastel } from '../constants/theme';

export type CalendarEventType = 'workshop' | 'booking' | 'booking-pending';

export interface CalendarEvent {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  type: CalendarEventType;
  color: string;
}

// Sistem paletiyle hizalı — mavi/mor gibi tema dışı renkler yerine
// teal (atölye) / mor (rezervasyon) / amber (bekleyen) metin tonları.
export const CALENDAR_EVENT_COLORS: Record<CalendarEventType, string> = {
  workshop: Colors.primary,
  booking: Pastel.purple.text,
  'booking-pending': Pastel.amber.text,
};

export const calendarService = {
  async getEmployerCalendarEvents(): Promise<CalendarEvent[]> {
    const [workshops, bookings] = await Promise.all([
      workshopService.getMyWorkshops(),
      spaceBookingService.getMine(),
    ]);

    const workshopEvents: CalendarEvent[] = workshops
      .filter((w) => w.status !== 'cancelled')
      .map((w) => ({
        id: `workshop-${w.id}`,
        title: w.title,
        startAt: w.startAt,
        endAt: w.endAt,
        type: 'workshop',
        color: CALENDAR_EVENT_COLORS.workshop,
      }));

    const bookingEvents: CalendarEvent[] = bookings
      .filter((b) => b.status === 'Approved')
      .map((b) => ({
        id: `booking-${b.id}`,
        title: b.spaceListingTitle ?? 'Rezervasyon',
        startAt: b.startDateTime,
        endAt: b.endDateTime,
        type: 'booking',
        color: CALENDAR_EVENT_COLORS.booking,
      }));

    return [...workshopEvents, ...bookingEvents];
  },

  // Cafe: kendi ilanlarına gelen rezervasyonlar (onaylı + onay bekleyen).
  async getCafeCalendarEvents(): Promise<CalendarEvent[]> {
    const bookings = await spaceBookingService.getIncoming();

    return bookings
      .filter((b) => b.status === 'Approved' || b.status === 'Pending')
      .map((b) => ({
        id: `booking-${b.id}`,
        title: b.employerWorkshopTitle ?? b.employerFullName ?? 'Rezervasyon',
        startAt: b.startDateTime,
        endAt: b.endDateTime,
        type: b.status === 'Pending' ? ('booking-pending' as const) : ('booking' as const),
        color: b.status === 'Pending' ? CALENDAR_EVENT_COLORS['booking-pending'] : CALENDAR_EVENT_COLORS.booking,
      }));
  },
};
