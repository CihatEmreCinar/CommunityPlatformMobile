import { Tabs } from 'expo-router';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { FloatingTabBar, type FloatingTabItem } from '../../../components/layout/FloatingTabBar';

// Search ve Bildirimler artık tab bar'da değil — home.tsx üst köşesindeki
// ikon butonlarından erişiliyor (FloatingTabBar tam olarak 4 sekme için tasarlandı).
const VISIBLE_TABS: FloatingTabItem[] = [
  { key: 'home', icon: 'house', label: 'Ana Sayfa' },
  { key: 'feed', icon: 'dynamicFeed', label: 'Akış' },
  { key: 'enrollments', icon: 'eventAvailable', label: 'Kayıtlarım' },
  { key: 'profile', icon: 'person', label: 'Profil' },
];

function EmployeeTabBar({ state, navigation }: BottomTabBarProps) {
  const activeRouteName = state.routes[state.index].name;
  // Görünür 4 sekmeden biri değilse (ör. search/notifications gibi ikincil rotalar),
  // hiçbir sekmeyi seçili gösterme — aksi halde yanlışlıkla ilk sekme aktifmiş gibi görünür.
  const activeKey = VISIBLE_TABS.some((t) => t.key === activeRouteName) ? activeRouteName : '';

  return (
    <FloatingTabBar
      tabs={VISIBLE_TABS}
      activeKey={activeKey}
      onTabPress={(key) => navigation.navigate(key)}
      showCreateButton={false}
    />
  );
}

export default function EmployeeTabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <EmployeeTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="feed" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="enrollments" />
      <Tabs.Screen name="notifications" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}