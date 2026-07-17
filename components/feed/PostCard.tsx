import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from '../ui/Icon';
import { AuthorAvatar } from './AuthorAvatar';
import { MediaStrip } from './MediaStrip';
import { FEED_ACCENT_COLOR } from './FeedConfiguration';
import { formatNotificationTime } from '../../utils/notificationUtils';
import type { PostCardProps } from './types';

export function PostCard({ post, onLike, onComment, onShare, isMine, onPressAuthor }: PostCardProps) {
  const isCafe = post.authorType === 'Cafe';
  const authorName = isCafe ? (post.cafeName ?? 'Kafe') : (post.employerName ?? 'Eğitmen');
  const authorAvatarUrl = isCafe ? post.cafeAvatarUrl : post.employerAvatarUrl;
  const AuthorWrapper = onPressAuthor ? TouchableOpacity : View;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <AuthorWrapper
          style={styles.authorRow}
          {...(onPressAuthor ? { onPress: onPressAuthor, activeOpacity: 0.7 } : {})}
        >
          <AuthorAvatar url={authorAvatarUrl} name={authorName} size={40} />
          <View style={styles.authorInfo}>
            <View style={styles.authorNameRow}>
              <Text style={styles.authorName}>{authorName}</Text>
              {isMine && (
                <View style={styles.mineChip}><Text style={styles.mineChipText}>Sen</Text></View>
              )}
            </View>
            <View style={styles.authorMeta}>
              <View style={styles.roleChip}><Text style={styles.roleText}>{isCafe ? 'Kafe' : 'Eğitmen'}</Text></View>
              {!isCafe && post.workshopTitle ? (
                <Text style={styles.workshopTitle} numberOfLines={1}>{post.workshopTitle}</Text>
              ) : null}
              <Text style={styles.postTime}>{formatNotificationTime(post.publishedAt ?? '')}</Text>
            </View>
          </View>
        </AuthorWrapper>
      </View>

      <Text style={styles.cardContent}>{post.caption}</Text>
      <MediaStrip media={post.media} />

      {post.tags && post.tags.length > 0 && (
        <View style={styles.tagRow}>
          {post.tags.map((t) => (
            <View key={t} style={styles.tagChip}><Text style={styles.tagText}>#{t}</Text></View>
          ))}
        </View>
      )}

      <View style={styles.counters}>
        <Text style={styles.counterText}>{post.likeCount > 0 ? `${post.likeCount} beğeni` : ''}</Text>
        <Text style={styles.counterText}>{post.commentCount > 0 ? `${post.commentCount} yorum` : ''}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onLike(post.id)}>
          <Icon name={post.isLikedByMe ? 'heartFilled' : 'heartOutline'} size={20} color={post.isLikedByMe ? '#EF4444' : '#6B7280'} />
          <Text style={[styles.actionText, post.isLikedByMe && styles.actionTextLiked]}>Beğen</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onComment(post)}>
          <Icon name="chatbubbleOutline" size={20} color="#6B7280" />
          <Text style={styles.actionText}>Yorum</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onShare(post)}>
          <Icon name="shareSocialOutline" size={20} color="#6B7280" />
          <Text style={styles.actionText}>Paylaş</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, marginHorizontal: 8, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  cardHeader: { padding: 14, paddingBottom: 10 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  authorInfo: { flex: 1, gap: 2 },
  authorNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  authorName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  mineChip: { backgroundColor: FEED_ACCENT_COLOR, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 },
  mineChipText: { fontSize: 9, fontWeight: '700', color: '#FFFFFF' },
  authorMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  roleChip: { backgroundColor: '#F0FDFA', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 },
  roleText: { fontSize: 10, fontWeight: '600', color: FEED_ACCENT_COLOR },
  workshopTitle: { fontSize: 11, color: '#6B7280', flex: 1 },
  postTime: { fontSize: 11, color: '#9CA3AF' },
  cardContent: { fontSize: 14, color: '#374151', lineHeight: 21, paddingHorizontal: 14, paddingBottom: 10 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: 14, paddingVertical: 6 },
  tagChip: { backgroundColor: '#F0FDFA', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  tagText: { fontSize: 12, color: FEED_ACCENT_COLOR, fontWeight: '500' },
  counters: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 6 },
  counterText: { fontSize: 12, color: '#6B7280' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#E5E7EB', marginHorizontal: 14 },
  actions: { flexDirection: 'row', paddingVertical: 4 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 10 },
  actionText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  actionTextLiked: { color: '#EF4444' },
});
