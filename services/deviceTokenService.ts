import { apiClient } from './apiClient';

export const deviceTokenService = {
  // Push bildirim almak için cihaz token'ını kaydeder (backend'de upsert).
  async register(expoPushToken: string, platform: 'ios' | 'android'): Promise<void> {
    await apiClient.post('/device-tokens', { expoPushToken, platform });
  },

  // Logout'ta çağrılır — kullanıcıya ait token'ı siler.
  async unregister(expoPushToken: string): Promise<void> {
    await apiClient.delete('/device-tokens', { data: { expoPushToken } });
  },
};
