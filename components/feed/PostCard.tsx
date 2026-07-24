import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from '../ui/Icon';
import { AuthorAvatar } from './AuthorAvatar';
import { MediaStrip } from './MediaStrip';
import { Colors, Pastel, Typography, Spacing, Radius } from '../../constants/theme';
import { formatNotificationTime } from '../../utils/notificationUtils';
import type { PostCardProps } from './types';

export function PostCard({ post, onLike, onComment, onShare, isMine, onPressAuthor }: PostCardProps) {
  const isCafe = post.authorType === 'Cafe';
  const authorName = isCafe ? (post.cafeName ?? 'Kafe') : (post.employerName ?? 'Eğitmen');
  const authorAvatarUrl = isCafe ? post.cafeAvatarUrl : post.employerAvatarUrl;
  const AuthorWrapper = onPressAuthor ? TouchableOpacity : View;
  // Kategori kodlaması: kafe paylaşımları coral, atölye/eğitmen paylaşımları teal.
  const palette = isCafe ? Pastel.coral : Pastel.teal;

  return (
    <View style={[styles.card, { backgroundColor: palette.tint }]}>
      <View style={styles.cardHeader}>
        <AuthorWrapper
          style={styles.authorRow}
          {...(onPressAuthor ? { onPress: onPressAuthor, activeOpacity: 0.7 } : {})}
        >
          <AuthorAvatar url={authorAvatarUrl} name={authorName} size={40} variant={isCafe ? 'coral' : 'teal'} />
          <View style={styles.authorInfo}>
            <View style={styles.authorNameRow}>
              <Text style={styles.authorName}>{authorName}</Text>
              {isMine && (
                <View style={[styles.mineChip, { backgroundColor: Colors.primary }]}>
                  <Text style={styles.mineChipText}>Sen</Text>
                </View>
              )}
            </View>
            <View style={styles.authorMeta}>
              <View style={[styles.roleChip, { backgroundColor: palette.tintStrong }]}>
                <Text style={[styles.roleText, { color: palette.text }]}>{isCafe ? 'Kafe' : 'Eğitmen'}</Text>
              </View>
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
            <View key={t} style={[styles.tagChip, { backgroundColor: palette.tintStrong }]}>
              <Text style={[styles.tagText, { color: palette.text }]}>#{t}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.counters}>
        <Text style={styles.counterText}>{post.likeCount > 0 ? `${post.likeCount} beğeni` : ''}</Text>
        <Text style={styles.counterText}>{post.commentCount > 0 ? `${post.commentCount} yorum` : ''}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onLike(post.id)}>
          <Icon name={post.isLikedByMe ? 'heartFilled' : 'heartOutline'} size={20} color={post.isLikedByMe ? Colors.like : Colors.outline} />
          <Text style={[styles.actionText, post.isLikedByMe && styles.actionTextLiked]}>Beğen</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onComment(post)}>
          <Icon name="chatbubbleOutline" size={20} color={Colors.outline} />
          <Text style={styles.actionText}>Yorum</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onShare(post)}>
          <Icon name="shareSocialOutline" size={20} color={Colors.outline} />
          <Text style={styles.actionText}>Paylaş</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.xxl, marginHorizontal: Spacing.sm, overflow: 'hidden' },
  cardHeader: { padding: Spacing.md, paddingBottom: Spacing.sm },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  authorInfo: { flex: 1, gap: 2 },
  authorNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  authorName: { ...Typography.labelMd, fontSize: 14, color: Colors.onSurface },
  mineChip: { borderRadius: Radius.sm, paddingHorizontal: 6, paddingVertical: 1 },
  mineChipText: { fontSize: 9, fontWeight: '700', color: Colors.onPrimary },
  authorMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  roleChip: { borderRadius: Radius.sm, paddingHorizontal: 6, paddingVertical: 1 },
  roleText: { fontSize: 10, fontWeight: '600' },
  workshopTitle: { ...Typography.labelSm, color: Colors.onSurfaceVariant, flex: 1 },
  postTime: { ...Typography.labelSm, color: Colors.outline },
  cardContent: { ...Typography.bodyMd, color: Colors.onSurface, paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
  tagChip: { borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  tagText: { fontSize: 12, fontWeight: '500' },
  counters: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
  counterText: { ...Typography.labelSm, color: Colors.onSurfaceVariant },
  actions: { flexDirection: 'row', paddingVertical: 2 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: Spacing.sm },
  actionText: { ...Typography.labelSm, fontSize: 13, color: Colors.onSurfaceVariant, fontWeight: '500' },
  actionTextLiked: { color: Colors.like },
});
