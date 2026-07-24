import { Tabs, useRouter } from 'expo-router';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { FloatingTabBar, type FloatingTabItem } from '../../../components/layout/FloatingTabBar';

// Rezervasyonlar ve Bildirimler tab bar'da değil — rezervasyonlar dashboard'daki
// istatistik kartı/hızlı işlemden, bildirimler header zil ikonundan erişiliyor
// (FloatingTabBar tam olarak 4 sekme için tasarlandı).
const VISIBLE_TABS: FloatingTabItem[] = [
  { key: 'dashboard', icon: 'cakeSlice', label: 'Panel' },
  { key: 'feed', icon: 'dynamicFeed', label: 'Akış' },
  { key: 'listings', icon: 'eventNote', label: 'İlanlar' },
  { key: 'profile', icon: 'person', label: 'Profil' },
];

function CafeTabBar({ state, navigation }: BottomTabBarProps) {
  const router = useRouter();
  const activeRouteName = state.routes[state.index].name;
  // Görünür 4 sekmeden biri değilse (ör. bookings/notifications gibi ikincil rotalar),
  // hiçbir sekmeyi seçili gösterme — aksi halde yanlışlıkla ilk sekme aktifmiş gibi görünür.
  const activeKey = VISIBLE_TABS.some((t) => t.key === activeRouteName) ? activeRouteName : '';

  return (
    <FloatingTabBar
      tabs={VISIBLE_TABS}
      activeKey={activeKey}
      onTabPress={(key) => navigation.navigate(key)}
      showCreateButton
      onCreatePress={() => router.push('/(cafe)/post/create')}
      createLabel="Gönderi oluştur"
    />
  );
}

export default function CafeTabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CafeTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="feed" />
      <Tabs.Screen name="listings" />
      <Tabs.Screen name="bookings" />
      <Tabs.Screen name="notifications" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
