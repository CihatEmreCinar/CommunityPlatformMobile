import { NotificationsScreen } from '../../../components/notifications/NotificationsScreen';

export default function CafeNotificationsScreen() {
  return (
    <NotificationsScreen
      accentColor="#0F766E"
      unreadBannerBg="#F0FDFA"
      emptyDescription="Başvurular, workshop güncellemeleri burada görünür."
      emptyDescPaddingHorizontal={32}
    />
  );
}
