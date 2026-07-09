import { workshopService } from './workshopService';
import { spaceBookingService } from './spaceBookingService';

export type CalendarEventType = 'workshop' | 'booking';

export interface CalendarEvent {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  type: CalendarEventType;
  color: string;
}

// Sabit renkler: workshop mavi, booking mor.
export const CALENDAR_EVENT_COLORS: Record<CalendarEventType, string> = {
  workshop: '#3B82F6',
  booking: '#8B5CF6',
};

export const calendarService = {
  // Employer: kendi workshopları (iptal edilenler hariç) + onaylanmış rezervasyonları.
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

  // Cafe: sadece kendi ilanlarına gelen onaylanmış rezervasyonlar.
  async getCafeCalendarEvents(): Promise<CalendarEvent[]> {
    const bookings = await spaceBookingService.getIncoming();

    return bookings
      .filter((b) => b.status === 'Approved')
      .map((b) => ({
        id: `booking-${b.id}`,
        title: b.employerWorkshopTitle ?? b.employerFullName ?? 'Rezervasyon',
        startAt: b.startDateTime,
        endAt: b.endDateTime,
        type: 'booking' as const,
        color: CALENDAR_EVENT_COLORS.booking,
      }));
  },
};