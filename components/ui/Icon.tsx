import React from 'react';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import type { StyleProp, TextStyle } from 'react-native';

/**
 * Merkezi ikon bileşeni.
 *
 * Uygulama genelinde `Ionicons` / `MaterialIcons` doğrudan import edilmek yerine
 * bu bileşen ve semantic `IconName` kullanılır. Hangi ikon ailesinin (Ionicons
 * veya MaterialIcons) ve hangi glyph'in kullanıldığı yalnızca bu dosyada bilinir;
 * ikon kütüphanesi değişirse (bkz. Faz 2) yalnızca ICON_REGISTRY güncellenir,
 * tüketen ekranlar değişmez.
 *
 * NOT: Bu registry mevcut kullanımların birebir dökümünden üretildi; her semantic
 * isim, refactor öncesindeki tam olarak aynı (aile, glyph) çiftine karşılık gelir.
 * Böylece görsel çıktı değişmez.
 */

type IconFamily = 'ion' | 'mat';

interface IconRegistryEntry {
  family: IconFamily;
  glyph: string;
}

const ICON_REGISTRY = {
  add: { family: 'ion', glyph: 'add' },
  addAction: { family: 'mat', glyph: 'add' },
  aiMatch: { family: 'mat', glyph: 'smart-toy' },
  addCircleOutline: { family: 'mat', glyph: 'add-circle-outline' },
  alarmOutline: { family: 'ion', glyph: 'alarm-outline' },
  arrowBack: { family: 'mat', glyph: 'arrow-back' },
  arrowBackAlt: { family: 'ion', glyph: 'arrow-back' },
  badge: { family: 'mat', glyph: 'badge' },
  bolt: { family: 'mat', glyph: 'bolt' },
  briefcaseOutline: { family: 'ion', glyph: 'briefcase-outline' },
  bulbOutline: { family: 'ion', glyph: 'bulb-outline' },
  business: { family: 'mat', glyph: 'business' },
  calendarOutline: { family: 'ion', glyph: 'calendar-outline' },
  calendarToday: { family: 'mat', glyph: 'calendar-today' },
  camera: { family: 'ion', glyph: 'camera' },
  chatbubbleEllipsesOutline: { family: 'ion', glyph: 'chatbubble-ellipses-outline' },
  chatbubbleOutline: { family: 'ion', glyph: 'chatbubble-outline' },
  check: { family: 'mat', glyph: 'check' },
  checkCircle: { family: 'mat', glyph: 'check-circle' },
  checkmarkCircleOutline: { family: 'ion', glyph: 'checkmark-circle-outline' },
  checkmarkDoneOutline: { family: 'ion', glyph: 'checkmark-done-outline' },
  chevronForward: { family: 'ion', glyph: 'chevron-forward' },
  chevronRight: { family: 'mat', glyph: 'chevron-right' },
  close: { family: 'ion', glyph: 'close' },
  closeCircle: { family: 'ion', glyph: 'close-circle' },
  closeCircleOutline: { family: 'ion', glyph: 'close-circle-outline' },
  closeModal: { family: 'mat', glyph: 'close' },
  cloudOfflineOutline: { family: 'ion', glyph: 'cloud-offline-outline' },
  collapse: { family: 'mat', glyph: 'expand-less' },
  createOutline: { family: 'ion', glyph: 'create-outline' },
  dashboard: { family: 'mat', glyph: 'dashboard' },
  delete: { family: 'mat', glyph: 'delete' },
  directionsWalk: { family: 'mat', glyph: 'directions-walk' },
  documentTextOutline: { family: 'ion', glyph: 'document-text-outline' },
  dynamicFeed: { family: 'mat', glyph: 'dynamic-feed' },
  edit: { family: 'mat', glyph: 'edit' },
  ellipse: { family: 'ion', glyph: 'ellipse' },
  errorOutline: { family: 'mat', glyph: 'error-outline' },
  event: { family: 'mat', glyph: 'event' },
  eventAvailable: { family: 'mat', glyph: 'event-available' },
  eventBusy: { family: 'mat', glyph: 'event-busy' },
  eventNote: { family: 'mat', glyph: 'event-note' },
  expand: { family: 'mat', glyph: 'expand-more' },
  follow: { family: 'ion', glyph: 'person-add-outline' },
  following: { family: 'ion', glyph: 'checkmark' },
  gridOn: { family: 'mat', glyph: 'grid-on' },
  gridOutline: { family: 'ion', glyph: 'grid-outline' },
  groups: { family: 'mat', glyph: 'groups' },
  heartFilled: { family: 'ion', glyph: 'heart' },
  heartOutline: { family: 'ion', glyph: 'heart-outline' },
  home: { family: 'mat', glyph: 'home' },
  hourglassTop: { family: 'mat', glyph: 'hourglass-top' },
  howToReg: { family: 'mat', glyph: 'how-to-reg' },
  imageOutline: { family: 'ion', glyph: 'image-outline' },
  infoOutline: { family: 'mat', glyph: 'info-outline' },
  informationCircleOutline: { family: 'ion', glyph: 'information-circle-outline' },
  libraryBooks: { family: 'mat', glyph: 'library-books' },
  listAlt: { family: 'mat', glyph: 'list-alt' },
  localCafe: { family: 'mat', glyph: 'local-cafe' },
  locationOn: { family: 'mat', glyph: 'location-on' },
  locationOutline: { family: 'ion', glyph: 'location-outline' },
  lockOutline: { family: 'mat', glyph: 'lock-outline' },
  logOutOutline: { family: 'ion', glyph: 'log-out-outline' },
  logout: { family: 'mat', glyph: 'logout' },
  mailInput: { family: 'mat', glyph: 'mail-outline' },
  mailOutline: { family: 'ion', glyph: 'mail-outline' },
  map: { family: 'mat', glyph: 'map' },
  megaphoneOutline: { family: 'ion', glyph: 'megaphone-outline' },
  message: { family: 'mat', glyph: 'message' },
  myLocation: { family: 'mat', glyph: 'my-location' },
  newspaperOutline: { family: 'ion', glyph: 'newspaper-outline' },
  notifications: { family: 'mat', glyph: 'notifications' },
  notificationsOffOutline: { family: 'ion', glyph: 'notifications-off-outline' },
  notificationsOutline: { family: 'ion', glyph: 'notifications-outline' },
  palette: { family: 'mat', glyph: 'palette' },
  passwordHidden: { family: 'mat', glyph: 'visibility-off' },
  passwordVisible: { family: 'mat', glyph: 'visibility' },
  payments: { family: 'mat', glyph: 'payments' },
  pencilOutline: { family: 'ion', glyph: 'pencil-outline' },
  peopleOutline: { family: 'mat', glyph: 'people-outline' },
  person: { family: 'mat', glyph: 'person' },
  photoCamera: { family: 'mat', glyph: 'photo-camera' },
  photoLibrary: { family: 'mat', glyph: 'photo-library' },
  place: { family: 'mat', glyph: 'place' },
  playCircle: { family: 'ion', glyph: 'play-circle' },
  pricetagsOutline: { family: 'ion', glyph: 'pricetags-outline' },
  publish: { family: 'mat', glyph: 'publish' },
  qrCode2: { family: 'mat', glyph: 'qr-code-2' },
  qrCodeScanner: { family: 'mat', glyph: 'qr-code-scanner' },
  schedule: { family: 'mat', glyph: 'schedule' },
  search: { family: 'mat', glyph: 'search' },
  searchInput: { family: 'ion', glyph: 'search' },
  searchOff: { family: 'mat', glyph: 'search-off' },
  share: { family: 'mat', glyph: 'share' },
  searchOutline: { family: 'ion', glyph: 'search-outline' },
  send: { family: 'ion', glyph: 'send' },
  shareSocialOutline: { family: 'ion', glyph: 'share-social-outline' },
  shieldCheckmarkOutline: { family: 'ion', glyph: 'shield-checkmark-outline' },
  shieldOutline: { family: 'ion', glyph: 'shield-outline' },
  star: { family: 'mat', glyph: 'star' },
  starEmpty: { family: 'mat', glyph: 'star-border' },
  starOutline: { family: 'ion', glyph: 'star-outline' },
  starRate: { family: 'mat', glyph: 'star-rate' },
  timeOutline: { family: 'ion', glyph: 'time-outline' },
  trashOutline: { family: 'ion', glyph: 'trash-outline' },
  videocam: { family: 'mat', glyph: 'videocam' },
  warning: { family: 'mat', glyph: 'warning' },
  workspacePremium: { family: 'mat', glyph: 'workspace-premium' },
} as const satisfies Record<string, IconRegistryEntry>;

export type IconName = keyof typeof ICON_REGISTRY;

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export function Icon({ name, size = 24, color = '#000000', style }: IconProps) {
  const entry = ICON_REGISTRY[name];

  if (entry.family === 'ion') {
    return <Ionicons name={entry.glyph as any} size={size} color={color} style={style} />;
  }

  return <MaterialIcons name={entry.glyph as any} size={size} color={color} style={style} />;
}
