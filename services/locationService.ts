import { apiClient } from './apiClient';
import { City, District } from '../types/location';

// 81 il neredeyse hiç değişmeyen statik veri — uygulama ömrü boyunca bir kez
// çekilip modül seviyesinde önbelleklenir. Her CitySelectField açılışında
// tekrar network isteği atmayı önler.
let citiesCache: City[] | null = null;
let citiesPromise: Promise<City[]> | null = null;

// İlçeler cityId bazında önbelleklenir (LRU değil, basit Map — 81 şehirden
// fazlası pratikte oturum içinde açılmaz).
const districtsCache = new Map<string, District[]>();
const districtsPromises = new Map<string, Promise<District[]>>();

export const locationService = {
  /** GET /api/v1/locations/cities — plaka koduna göre sıralı 81 il. */
  async getCities(): Promise<City[]> {
    if (citiesCache) return citiesCache;
    if (!citiesPromise) {
      citiesPromise = apiClient
        .get<City[]>('/locations/cities')
        .then(({ data }) => {
          citiesCache = data;
          return data;
        })
        .catch((error) => {
          citiesPromise = null; // hata durumunda tekrar denenebilsin
          throw error;
        });
    }
    return citiesPromise;
  },

  /** GET /api/v1/locations/cities/{cityId}/districts */
  async getDistricts(cityId: string): Promise<District[]> {
    const cached = districtsCache.get(cityId);
    if (cached) return cached;

    let promise = districtsPromises.get(cityId);
    if (!promise) {
      promise = apiClient
        .get<District[]>(`/locations/cities/${cityId}/districts`)
        .then(({ data }) => {
          districtsCache.set(cityId, data);
          return data;
        })
        .catch((error) => {
          districtsPromises.delete(cityId);
          throw error;
        });
      districtsPromises.set(cityId, promise);
    }
    return promise;
  },

  /** Sadece test/reset senaryoları için — normal akışta gerekmez. */
  clearCache() {
    citiesCache = null;
    citiesPromise = null;
    districtsCache.clear();
    districtsPromises.clear();
  },
};

export default locationService;
