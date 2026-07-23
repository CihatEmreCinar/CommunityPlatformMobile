import { Tabs } from 'expo-router';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { FloatingTabBar, type FloatingTabItem } from '../../../components/layout/FloatingTabBar';

// Search ve Bildirimler artık tab bar'da değil — home.tsx üst köşesindeki
// ikon butonlarından erişiliyor (FloatingTabBar tam olarak 4 sekme için tasarlandı).
const VISIBLE_TABS: FloatingTabItem[] = [
  { key: 'home', icon: 'house' },
  { key: 'feed', icon: 'dynamicFeed' },
  { key: 'enrollments', icon: 'eventAvailable' },
  { key: 'profile', icon: 'person' },
];

function EmployeeTabBar({ state, navigation }: BottomTabBarProps) {
  const activeRouteName = state.routes[state.index].name;
  const activeKey = VISIBLE_TABS.some((t) => t.key === activeRouteName) ? activeRouteName : VISIBLE_TABS[0].key;

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