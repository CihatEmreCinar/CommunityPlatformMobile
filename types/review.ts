export interface Review {
  id: string;
  workshopId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string | null;
  employerReply: string | null;
  createdAt: string;
}

export interface ReviewRequest {
  rating: number;
  comment?: string;
}

export interface ReviewReplyRequest {
  reply: string;
}