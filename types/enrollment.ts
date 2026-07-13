export interface Enrollment {
  id: string;
  workshopId: string;
  workshopTitle: string;
  workshopStartAt: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  attendanceStatus: 'Pending' | 'Attended' | 'NoShow';
  enrolledAt: string;
  attendedAt: string | null;
}

export interface EmployerEnrollment {
  id: string;
  workshopTitle: string;
  employeeName: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  appliedAt: string;
  message?: string | null;
}

export interface EnrollmentRequest {
  workshopId: string;
}
