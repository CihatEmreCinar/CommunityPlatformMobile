import { Tabs, useRouter } from 'expo-router';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { FloatingTabBar, type FloatingTabItem } from '../../../components/layout/FloatingTabBar';

// Mekan Bul (search) ve Bildirimler tab bar'da değil — search dashboard'daki
// "Mekan Bul" hızlı işleminden, bildirimler header zil ikonundan erişiliyor
// (FloatingTabBar tam olarak 4 sekme için tasarlandı).
const VISIBLE_TABS: FloatingTabItem[] = [
  { key: 'dashboard', icon: 'dashboard' },
  { key: 'feed', icon: 'dynamicFeed' },
  { key: 'workshop', icon: 'projectorOutline' },
  { key: 'profile', icon: 'person' },
];

function EmployerTabBar({ state, navigation }: BottomTabBarProps) {
  const router = useRouter();
  const activeRouteName = state.routes[state.index].name;
  const activeKey = VISIBLE_TABS.some((t) => t.key === activeRouteName) ? activeRouteName : VISIBLE_TABS[0].key;

  return (
    <FloatingTabBar
      tabs={VISIBLE_TABS}
      activeKey={activeKey}
      onTabPress={(key) => navigation.navigate(key)}
      showCreateButton
      onCreatePress={() => router.push('/(employer)/post/create')}
    />
  );
}

export default function EmployerTabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <EmployerTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="feed" />
      <Tabs.Screen name="workshop" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="notifications" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}