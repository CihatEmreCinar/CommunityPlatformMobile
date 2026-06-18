export interface Enrollment {
  id: string;
  workshopId: string;
  workshopTitle: string;
  workshopStartAt: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'attended';
  ticketCode: string;
  enrolledAt: string;
  attendedAt: string | null;
}

export interface EnrollmentRequest {
  workshopId: string;
}