// Backend: CommunityPlatform.Application.DTOs.Locations.CityResponse / DistrictResponse
// GET /api/v1/locations/cities , GET /api/v1/locations/cities/{cityId}/districts

export interface City {
  id: string;
  name: string;
  plateCode: string;
}

export interface District {
  id: string;
  cityId: string;
  name: string;
}

/**
 * Formlarda taşınan seçim durumu — hem id hem de (backend'den geldiği gibi
 * hazır) ad bilgisini birlikte tutar, böylece "profil yüklendi ama şehir
 * listesi henüz gelmedi" durumunda bile mevcut seçim ekranda gösterilebilir.
 */
export interface LocationSelection {
  cityId: string | null;
  cityName: string | null;
  districtId: string | null;
  districtName: string | null;
}

export const EMPTY_LOCATION_SELECTION: LocationSelection = {
  cityId: null,
  cityName: null,
  districtId: null,
  districtName: null,
};
