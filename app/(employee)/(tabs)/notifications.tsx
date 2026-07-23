import { NotificationsScreen } from '../../../components/notifications/NotificationsScreen';
import { Pastel } from '../../../constants/theme';

export default function EmployeeNotificationsScreen() {
  return (
    <NotificationsScreen
      accentColor={Pastel.purple.text}
      unreadBannerBg={Pastel.purple.tint}
      emptyDescription="Yeni bildirimler burada görünür."
    />
  );
}
