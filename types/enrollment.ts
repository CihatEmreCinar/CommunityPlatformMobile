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

export interface EmployerEnrollment {
  id: string;
  workshopTitle: string;
  employeeName: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'attended';
  appliedAt: string;
  message?: string | null;
}

export interface EnrollmentRequest {
  workshopId: string;
}