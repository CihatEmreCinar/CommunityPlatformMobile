import { NotificationsScreen } from '../../../components/notifications/NotificationsScreen';
import { Colors } from '../../../constants/theme';

export default function CafeNotificationsScreen() {
  return (
    <NotificationsScreen
      accentColor={Colors.primary}
      unreadBannerBg="rgba(13,148,136,0.08)"
      emptyDescription="Başvurular, workshop güncellemeleri burada görünür."
      emptyDescPaddingHorizontal={32}
    />
  );
}
