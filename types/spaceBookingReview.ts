// GÖREV NOTU: Backend'de bu şekle karşılık gelen bir ReviewResponse DTO'su henüz
// yok (bkz. rapor). Alan adları mevcut workshop ReviewResponse (types/review.ts)
// ile birebir aynı pattern izlenerek tahmin edildi. Backend implement edilirken
// bu dosya gerçek DTO'ya göre güncellenmeli.

export interface SpaceBookingReview {
  id: string;
  spaceBookingId: string;
  cafeProfileId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface SpaceBookingReviewRequest {
  rating: number;
  comment?: string;
}