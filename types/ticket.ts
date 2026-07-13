export interface Ticket {
  ticketId: string;
  enrollmentId: string;
  workshopId: string;
  workshopTitle: string;
  workshopLocationType: string;
  workshopLocationDetail: string | null;
  workshopStartAt: string;
  workshopEndAt: string;
  employerName: string;
  participantName: string;
  enrollmentStatus: string;
  attendanceStatus: 'Pending' | 'Attended' | 'NoShow';
  qrPayload: string;
  expiresAt: string;
}

export interface TicketPreview {
  ticketId: string;
  enrollmentId: string;
  participantName: string;
  workshopTitle: string;
  attendanceStatus: 'Pending' | 'Attended' | 'NoShow';
  alreadyUsed: boolean;
  usedAt: string | null;
}

export interface CheckInResult {
  enrollmentId: string;
  participantName: string;
  attendanceStatus: 'Pending' | 'Attended' | 'NoShow';
  attendedAt: string;
}

export interface Participant {
  id: string;
  userId: string;
  userName: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  attendanceStatus: 'Pending' | 'Attended' | 'NoShow';
  enrolledAt: string;
  attendedAt: string | null;
}
