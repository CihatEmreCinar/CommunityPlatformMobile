import React, { useEffect, useCallback, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Image, TextInput,
  Modal, KeyboardAvoidingView, Platform, Share, Dimensions, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFeed } from '../../../hooks/useFeed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useComments, useShare } from '../../../hooks/useSocial';
import { useAuth } from '../../../contexts/AuthContext';
import { formatNotificationTime } from '../../../utils/notificationUtils';
import type { FeedPost, FeedPostMedia } from '../../../types/feed.types';
import type { CommentResponse } from '../../../types/social.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ACCENT = '#0F766E';

// ─── Avatar ──────────────────────────────────────────────────────────────────

function Avatar({ url, name, size = 40 }: { url: string | null; name: string; size?: number }) {
  const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  if (url) return <Image source={{ uri: url }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  return (
    <View style={[styles.avatarFallback, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.avatarInitials, { fontSize: size * 0.36 }]}>{initials}</Text>
    </View>
  );
}

// ─── Media ───────────────────────────────────────────────────────────────────

function MediaStrip({ media }: { media: FeedPostMedia[] }) {
  if (!media || media.length === 0) return null;
  if (media.length === 1) return <Image source={{ uri: media[0].url }} style={styles.mediaSingle} resizeMode="cover" />;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 4 }}>
      {media.map((m) => <Image key={m.id} source={{ uri: m.url }} style={styles.mediaThumb} resizeMode="cover" />)}
    </ScrollView>
  );
}

// ─── Comment item ─────────────────────────────────────────────────────────────

function CommentItem({ comment }: { comment: CommentResponse }) {
  return (
    <View style={styles.commentItem}>
      <Avatar url={comment.authorAvatarUrl} name={comment.authorName} size={32} />
      <View style={styles.commentBody}>
        <Text style={styles.commentAuthor}>{comment.authorName}</Text>
        <Text style={styles.commentText}>{comment.content}</Text>
        <Text style={styles.commentTime}>{formatNotificationTime(comment.createdAt)}</Text>
      </View>
    </View>
  );
}

// ─── Comments Modal ───────────────────────────────────────────────────────────

function CommentsModal({ visible, post, onClose }: { visible: boolean; post: FeedPost | null; onClose: () => void }) {
  const { comments, loading, submitting, fetchComments, addComment } = useComments();
  const [text, setText] = useState('');

  useEffect(() => { if (visible && post) fetchComments(post.id); }, [visible, post?.id]);

  const handleSend = useCallback(async () => {
    if (!post || !text.trim()) return;
    await addComment(post.id, { content: text.trim() });
    setText('');
  }, [post, text, addComment]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.modalContainer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Yorumlar</Text>
          <TouchableOpacity onPress={onClose}><Ionicons name="close" size={22} color="#374151" /></TouchableOpacity>
        </View>
        {loading
          ? <View style={styles.centered}><ActivityIndicator color={ACCENT} /></View>
          : <FlatList
              data={comments}
              keyExtractor={(c) => c.id}
              renderItem={({ item }) => <CommentItem comment={item} />}
              contentContainerStyle={styles.commentsList}
              ListEmptyComponent={
                <View style={styles.commentsEmpty}>
                  <Ionicons name="chatbubble-outline" size={36} color="#D1D5DB" />
                  <Text style={styles.commentsEmptyText}>Henüz yorum yok</Text>
                </View>
              }
            />
        }
        <View style={styles.commentInput}>
          <TextInput
            style={styles.commentTextInput}
            placeholder="Yorum yaz..." placeholderTextColor="#9CA3AF"
            value={text} onChangeText={setText} multiline maxLength={500}
          />
          <TouchableOpacity
            onPress={handleSend} disabled={submitting || !text.trim()}
            style={[styles.sendBtn, (!text.trim() || submitting) && styles.sendBtnDisabled]}
          >
            {submitting ? <ActivityIndicator size="small" color="#FFF" /> : <Ionicons name="send" size={16} color="#FFF" />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────
// NOT: Feed'deki her post bir employer'a ait (backend kuralı) — authorRole/roleLabel
// belirsizliği yok, her zaman "Eğitmen" gösterilir. Kendi postuna da rozet eklendi.

function PostCard({ post, onLike, onComment, onShare, isMine }: {
  post: FeedPost;
  onLike: (id: string) => void;
  onComment: (post: FeedPost) => void;
  onShare: (post: FeedPost) => void;
  isMine: boolean;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.authorRow}>
          <Avatar url={post.employerAvatarUrl} name={post.employerName} size={40} />
          <View style={styles.authorInfo}>
            <View style={styles.authorNameRow}>
              <Text style={styles.authorName}>{post.employerName}</Text>
              {isMine && (
                <View style={styles.mineChip}><Text style={styles.mineChipText}>Sen</Text></View>
              )}
            </View>
            <View style={styles.authorMeta}>
              <View style={styles.roleChip}><Text style={styles.roleText}>Eğitmen</Text></View>
              {post.workshopTitle ? (
                <Text style={styles.workshopTitle} numberOfLines={1}>{post.workshopTitle}</Text>
              ) : null}
              <Text style={styles.postTime}>{formatNotificationTime(post.publishedAt ?? '')}</Text>
            </View>
          </View>
        </View>
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
          <Ionicons name={post.isLikedByMe ? 'heart' : 'heart-outline'} size={20} color={post.isLikedByMe ? '#EF4444' : '#6B7280'} />
          <Text style={[styles.actionText, post.isLikedByMe && styles.actionTextLiked]}>Beğen</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onComment(post)}>
          <Ionicons name="chatbubble-outline" size={20} color="#6B7280" />
          <Text style={styles.actionText}>Yorum</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onShare(post)}>
          <Ionicons name="share-social-outline" size={20} color="#6B7280" />
          <Text style={styles.actionText}>Paylaş</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Ana ekran ────────────────────────────────────────────────────────────────

export default function EmployerFeedScreen() {
  const router = useRouter();
  const { user } = useAuth();
  // employer kendi feed'inde herkesi görmeli → explore mode
  const { posts, loading, loadingMore, refreshing, error, hasMore, refresh, loadMore, toggleLike } =
    useFeed(20, { mode: 'explore' });
  const { getShareUrl } = useShare();
  const [commentPost, setCommentPost] = useState<FeedPost | null>(null);

  const currentEmployerId = user?.role === 'employer' ? user.id : null;

  useEffect(() => { refresh(); }, []);

  const handleShare = useCallback(async (post: FeedPost) => {
    const url = await getShareUrl(post.id);
    await Share.share({ message: url ?? post.caption?.slice(0, 80) ?? 'Atolium paylaşımı', title: 'Atolium' });
  }, [getShareUrl]);

  const renderItem = useCallback(({ item }: { item: FeedPost }) => (
    <PostCard
      post={item}
      onLike={toggleLike}
      onComment={setCommentPost}
      onShare={handleShare}
      isMine={currentEmployerId === item.employerId}
    />
  ), [toggleLike, handleShare, currentEmployerId]);

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color={ACCENT} /></View>;

  if (error && posts.length === 0) {
    return (
      <View style={styles.centered}>
        <Ionicons name="cloud-offline-outline" size={48} color="#D1D5DB" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={refresh}><Text style={styles.retryText}>Tekrar dene</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Akış</Text>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="newspaper-outline" size={52} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>Feed boş</Text>
              <Text style={styles.emptyDesc}>İlk paylaşımı sen yap.</Text>
            </View>
          ) : null
        }
        ListFooterComponent={loadingMore ? <View style={styles.listFooter}><ActivityIndicator size="small" color={ACCENT} /></View> : null}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={ACCENT} />}
        contentContainerStyle={posts.length === 0 ? styles.flatListEmpty : styles.flatListContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews maxToRenderPerBatch={8} windowSize={10}
      />

      <CommentsModal visible={!!commentPost} post={commentPost} onClose={() => setCommentPost(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#F3F4F6' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, backgroundColor: '#FFFFFF', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  createBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: ACCENT, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  createBtnText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  flatListContent: { paddingVertical: 8, gap: 8 },
  flatListEmpty: { flexGrow: 1 },
  listFooter: { paddingVertical: 16, alignItems: 'center' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, marginHorizontal: 8, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  cardHeader: { padding: 14, paddingBottom: 10 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  authorInfo: { flex: 1, gap: 2 },
  authorNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  authorName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  mineChip: { backgroundColor: ACCENT, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 },
  mineChipText: { fontSize: 9, fontWeight: '700', color: '#FFFFFF' },
  authorMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  roleChip: { backgroundColor: '#F0FDFA', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 },
  roleText: { fontSize: 10, fontWeight: '600', color: ACCENT },
  workshopTitle: { fontSize: 11, color: '#6B7280', flex: 1 },
  postTime: { fontSize: 11, color: '#9CA3AF' },
  cardContent: { fontSize: 14, color: '#374151', lineHeight: 21, paddingHorizontal: 14, paddingBottom: 10 },
  mediaSingle: { width: '100%', height: 220 },
  mediaThumb: { width: SCREEN_WIDTH * 0.65, height: 200, borderRadius: 8 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: 14, paddingVertical: 6 },
  tagChip: { backgroundColor: '#F0FDFA', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  tagText: { fontSize: 12, color: ACCENT, fontWeight: '500' },
  counters: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 6 },
  counterText: { fontSize: 12, color: '#6B7280' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#E5E7EB', marginHorizontal: 14 },
  actions: { flexDirection: 'row', paddingVertical: 4 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 10 },
  actionText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  actionTextLiked: { color: '#EF4444' },
  avatarFallback: { backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { color: '#FFFFFF', fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 80, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginTop: 4 },
  emptyDesc: { fontSize: 13, color: '#9CA3AF', textAlign: 'center' },
  errorText: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: ACCENT, borderRadius: 8, marginTop: 4 },
  retryText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  modalContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB' },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  commentsList: { padding: 16, gap: 16 },
  commentItem: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  commentBody: { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 10, padding: 10, gap: 3 },
  commentAuthor: { fontSize: 13, fontWeight: '600', color: '#111827' },
  commentText: { fontSize: 13, color: '#374151', lineHeight: 19 },
  commentTime: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  commentsEmpty: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 8 },
  commentsEmptyText: { fontSize: 14, color: '#9CA3AF' },
  commentInput: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, padding: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E5E7EB', backgroundColor: '#FFFFFF' },
  commentTextInput: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#111827', maxHeight: 100 },
  sendBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: '#99D6D0' },
});