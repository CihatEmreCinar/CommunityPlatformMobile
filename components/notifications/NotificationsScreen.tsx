import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Icon } from '../ui/Icon';
import { EmptyState } from '../ui/EmptyState';
import { useNotifications } from '../../hooks/useNotifications';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getNotificationConfig,
  formatNotificationTime,
  getNotificationRoute,
} from '../../utils/notificationUtils';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { useFloatingTabBarClearance } from '../layout/FloatingTabBar';
import type { Notification } from '../../types/notification.types';
import { useRouter } from 'expo-router';

export interface NotificationsScreenTheme {
  /** Rol vurgu rengi — "tümünü okundu" linki ve okunmamış banner noktasında
   *  kullanılır (rol markası, satır arka planları bildirim tipine göre boyanır). */
  accentColor: string;
  unreadBannerBg: string;
  emptyDescription: string;
  emptyDescPaddingHorizontal?: number;
}

const ICON_COLUMN_WIDTH = 40;
const ROW_PADDING_H = Spacing.containerMargin;

export function NotificationsScreen({
  accentColor,
  unreadBannerBg,
  emptyDescription,
  emptyDescPaddingHorizontal,
}: NotificationsScreenTheme) {
  const router = useRouter();
  const tabBarClearance = useFloatingTabBarClearance();
  const {
    notifications,
    unreadCount,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    markRead,
    markAllRead,
    remove,
    refresh,
  } = useNotifications({ limit: 20, pollIntervalMs: 30000 });

  React.useEffect(() => {
    refresh();
  }, []);

  const handlePress = useCallback(
    async (item: Notification) => {
      if (!item.isRead) {
        await markRead(item.id);
      }
      const route = getNotificationRoute(item);
      if (route) {
        router.push(route as any);
      }
    },
    [markRead, router]
  );

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert('Bildirimi sil', 'Bu bildirim silinsin mi?', [
        { text: 'İptal', style: 'cancel' },
        { text: 'Sil', style: 'destructive', onPress: () => remove(id) },
      ]);
    },
    [remove]
  );

  const handleMarkAllRead = useCallback(async () => {
    if (unreadCount === 0) return;
    await markAllRead();
  }, [markAllRead, unreadCount]);

  const renderItem = useCallback(
    ({ item }: { item: Notification }) => {
      const config = getNotificationConfig(item.type);
      return (
        <TouchableOpacity
          style={[
            styles.item,
            { backgroundColor: item.isRead ? config.color + '0F' : config.color + '1F' },
          ]}
          onPress={() => handlePress(item)}
          activeOpacity={0.7}
        >
          <View style={[styles.iconWrap, { backgroundColor: config.color + '24' }]}>
            <Icon name={config.icon} size={19} color={config.color} />
          </View>

          <View style={styles.body}>
            <View style={styles.bodyTop}>
              <Text style={styles.title} numberOfLines={1}>
                {item.title}
              </Text>
              {!item.isRead && <View style={[styles.dot, { backgroundColor: accentColor }]} />}
            </View>
            <Text style={styles.bodyText} numberOfLines={2}>
              {item.body}
            </Text>
            <Text style={styles.time}>{formatNotificationTime(item.createdAt)}</Text>
          </View>

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon name="trashOutline" size={15} color={Colors.outline} />
          </TouchableOpacity>
        </TouchableOpacity>
      );
    },
    [handlePress, handleDelete, accentColor]
  );

  // Ardışık bildirimler arasında ince bir "wire" — ikon sütununun ortasından geçer.
  const renderSeparator = () => (
    <View style={styles.separatorRow}>
      <View style={styles.separatorIconColumn}>
        <View style={styles.wire} />
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={accentColor} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <EmptyState
        icon="notificationsOffOutline"
        iconSize={44}
        title="Bildirim yok"
        description={emptyDescription}
        descriptionStyle={emptyDescPaddingHorizontal !== undefined ? { paddingHorizontal: emptyDescPaddingHorizontal } : undefined}
        style={styles.empty}
      />
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={accentColor} />
      </View>
    );
  }

  if (error && notifications.length === 0) {
    return (
      <EmptyState
        icon="cloudOfflineOutline"
        iconSize={44}
        description={error}
        actionLabel="Tekrar dene"
        onAction={refresh}
        actionColor={accentColor}
        style={styles.centered}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bildirimler</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={[styles.markAllText, { color: accentColor }]}>
              Tümünü okundu işaretle
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {unreadCount > 0 && (
        <View style={[styles.unreadBanner, { backgroundColor: unreadBannerBg }]}>
          <Icon name="ellipse" size={7} color={accentColor} />
          <Text style={[styles.unreadBannerText, { color: accentColor }]}>
            {unreadCount} okunmamış bildirim
          </Text>
        </View>
      )}

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={renderSeparator}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={refresh} tintColor={accentColor} />
        }
        contentContainerStyle={
          notifications.length === 0 ? styles.flatListEmpty : [styles.flatListContent, { paddingBottom: tabBarClearance }]
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ROW_PADDING_H,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background,
  },
  headerTitle: { ...Typography.serifHeading, color: Colors.onSurface },
  markAllText: { ...Typography.labelSm, fontWeight: '600' },
  unreadBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: ROW_PADDING_H,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  unreadBannerText: { ...Typography.labelSm, fontWeight: '600' },
  flatListContent: { paddingHorizontal: Spacing.sm },
  flatListEmpty: { flexGrow: 1 },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Radius.xxl,
    gap: Spacing.sm,
  },
  separatorRow: { flexDirection: 'row' },
  separatorIconColumn: { width: ICON_COLUMN_WIDTH + Spacing.md, alignItems: 'center', paddingLeft: Spacing.md },
  wire: { width: 2, height: 10, borderRadius: 1, backgroundColor: Colors.surfaceVariant },
  iconWrap: {
    width: ICON_COLUMN_WIDTH,
    height: ICON_COLUMN_WIDTH,
    borderRadius: ICON_COLUMN_WIDTH / 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  body: { flex: 1, gap: 3 },
  bodyTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { ...Typography.labelMd, fontSize: 14, color: Colors.onSurface, flex: 1 },
  dot: { width: 7, height: 7, borderRadius: 4, flexShrink: 0 },
  bodyText: { ...Typography.bodySm, color: Colors.onSurfaceVariant, lineHeight: 18 },
  time: { ...Typography.labelSm, color: Colors.outline, marginTop: 2 },
  deleteBtn: { paddingTop: 2, flexShrink: 0 },
  footer: { paddingVertical: Spacing.md, alignItems: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingTop: 80 },
});
