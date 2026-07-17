import React, { useEffect, useCallback } from 'react';
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
import { useNotifications } from '../../hooks/useNotifications';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getNotificationConfig,
  formatNotificationTime,
  getNotificationRoute,
} from '../../utils/notificationUtils';
import type { Notification } from '../../types/notification.types';
import { useRouter } from 'expo-router';

export interface NotificationsScreenTheme {
  /** Rol vurgu rengi — ActivityIndicator, unread dot/border, "tümünü okundu" linki,
   *  retry butonu ve "ellipse" ikonunda kullanılır. */
  accentColor: string;
  /** Okunmamış bildirim banner'ının arka plan rengi (accentColor'ın açık tonu). */
  unreadBannerBg: string;
  /** Boş liste durumunda gösterilen açıklama metni (role göre değişir). */
  emptyDescription: string;
  /** emptyDesc metninin yatay padding'i — employer/cafe'de var, employee'de yok
   *  (orijinal davranış korunuyor, bkz. MANIFEST notu). */
  emptyDescPaddingHorizontal?: number;
}

export function NotificationsScreen({
  accentColor,
  unreadBannerBg,
  emptyDescription,
  emptyDescPaddingHorizontal,
}: NotificationsScreenTheme) {
  const router = useRouter();
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

  useEffect(() => {
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
            !item.isRead && [styles.itemUnread, { borderLeftColor: accentColor }],
          ]}
          onPress={() => handlePress(item)}
          activeOpacity={0.7}
        >
          {/* Sol — ikon */}
          <View style={[styles.iconWrap, { backgroundColor: config.color + '18' }]}>
            <Icon name={config.icon} size={20} color={config.color} />
          </View>

          {/* Orta — içerik */}
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

          {/* Sağ — sil */}
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon name="trashOutline" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </TouchableOpacity>
      );
    },
    [handlePress, handleDelete, accentColor]
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
      <View style={styles.empty}>
        <Icon name="notificationsOffOutline" size={48} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>Bildirim yok</Text>
        <Text
          style={[
            styles.emptyDesc,
            emptyDescPaddingHorizontal !== undefined && {
              paddingHorizontal: emptyDescPaddingHorizontal,
            },
          ]}
        >
          {emptyDescription}
        </Text>
      </View>
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
      <View style={styles.centered}>
        <Icon name="cloudOfflineOutline" size={48} color="#D1D5DB" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryBtn, { backgroundColor: accentColor }]}
          onPress={refresh}
        >
          <Text style={styles.retryText}>Tekrar dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
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

      {/* Okunmamış banner */}
      {unreadCount > 0 && (
        <View style={[styles.unreadBanner, { backgroundColor: unreadBannerBg }]}>
          <Icon name="ellipse" size={8} color={accentColor} />
          <Text style={[styles.unreadBannerText, { color: accentColor }]}>
            {unreadCount} okunmamış bildirim
          </Text>
        </View>
      )}

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={refresh} tintColor={accentColor} />
        }
        contentContainerStyle={
          notifications.length === 0 ? styles.flatListEmpty : styles.flatListContent
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#F9FAFB',
  },
  // ─── Header ────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '500',
  },
  // ─── Unread banner ─────────────────────────────────────────────────────────
  unreadBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  unreadBannerText: {
    fontSize: 12,
    fontWeight: '500',
  },
  // ─── List ──────────────────────────────────────────────────────────────────
  flatListContent: {
    paddingVertical: 8,
  },
  flatListEmpty: {
    flexGrow: 1,
  },
  // ─── Item ──────────────────────────────────────────────────────────────────
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  itemUnread: {
    backgroundColor: '#FAFAFA',
    borderLeftWidth: 3,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  body: {
    flex: 1,
    gap: 3,
  },
  bodyTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    flexShrink: 0,
  },
  bodyText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  time: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  deleteBtn: {
    paddingTop: 2,
    flexShrink: 0,
  },
  // ─── Footer ────────────────────────────────────────────────────────────────
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  // ─── Empty ─────────────────────────────────────────────────────────────────
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 4,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  // ─── Error ─────────────────────────────────────────────────────────────────
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
