import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet,
  ActivityIndicator, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Icon } from '../ui/Icon';
import { useComments } from '../../hooks/useSocial';
import { formatNotificationTime } from '../../utils/notificationUtils';
import { AuthorAvatar } from './AuthorAvatar';
import { FEED_ACCENT_COLOR } from './FeedConfiguration';
import type { FeedPost } from '../../types/feed.types';
import type { CommentResponse } from '../../types/social.types';

function CommentItem({ comment }: { comment: CommentResponse }) {
  return (
    <View style={styles.commentItem}>
      <AuthorAvatar url={comment.authorAvatarUrl} name={comment.authorName} size={32} />
      <View style={styles.commentBody}>
        <Text style={styles.commentAuthor}>{comment.authorName}</Text>
        <Text style={styles.commentText}>{comment.content}</Text>
        <Text style={styles.commentTime}>{formatNotificationTime(comment.createdAt)}</Text>
      </View>
    </View>
  );
}

type CommentsModalProps = {
  visible: boolean;
  post: FeedPost | null;
  onClose: () => void;
};

export function CommentsModal({ visible, post, onClose }: CommentsModalProps) {
  const { comments, loading, submitting, fetchComments, addComment } = useComments();
  const [text, setText] = useState('');

  useEffect(() => {
    if (visible && post) fetchComments(post.id);
  }, [visible, post?.id]);

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
          <TouchableOpacity onPress={onClose}><Icon name="close" size={22} color="#374151" /></TouchableOpacity>
        </View>
        {loading
          ? <View style={styles.centered}><ActivityIndicator color={FEED_ACCENT_COLOR} /></View>
          : <FlatList
              data={comments}
              keyExtractor={(c) => c.id}
              renderItem={({ item }) => <CommentItem comment={item} />}
              contentContainerStyle={styles.commentsList}
              ListEmptyComponent={
                <View style={styles.commentsEmpty}>
                  <Icon name="chatbubbleOutline" size={36} color="#D1D5DB" />
                  <Text style={styles.commentsEmptyText}>Henüz yorum yok</Text>
                </View>
              }
            />
        }
        <View style={styles.commentInput}>
          <TextInput
            style={styles.commentTextInput}
            placeholder="Yorum yaz..."
            placeholderTextColor="#9CA3AF"
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={submitting || !text.trim()}
            style={[styles.sendBtn, (!text.trim() || submitting) && styles.sendBtnDisabled]}
          >
            {submitting
              ? <ActivityIndicator size="small" color="#FFF" />
              : <Icon name="send" size={16} color="#FFF" />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
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
  sendBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: FEED_ACCENT_COLOR, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: '#99D6D0' },
});
