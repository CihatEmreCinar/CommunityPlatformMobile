import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet,
  ActivityIndicator, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Icon } from '../ui/Icon';
import { useComments } from '../../hooks/useSocial';
import { formatNotificationTime } from '../../utils/notificationUtils';
import { AuthorAvatar } from './AuthorAvatar';
import { Colors, Pastel, Typography, Spacing, Radius } from '../../constants/theme';
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
          <TouchableOpacity onPress={onClose}><Icon name="close" size={22} color={Colors.onSurfaceVariant} /></TouchableOpacity>
        </View>
        {loading
          ? <View style={styles.centered}><ActivityIndicator color={Colors.primary} /></View>
          : <FlatList
              data={comments}
              keyExtractor={(c) => c.id}
              renderItem={({ item }) => <CommentItem comment={item} />}
              contentContainerStyle={styles.commentsList}
              ListEmptyComponent={
                <View style={styles.commentsEmpty}>
                  <Icon name="chatbubbleOutline" size={36} color={Colors.outline} />
                  <Text style={styles.commentsEmptyText}>Henüz yorum yok</Text>
                </View>
              }
            />
        }
        <View style={styles.commentInput}>
          <TextInput
            style={styles.commentTextInput}
            placeholder="Yorum yaz..."
            placeholderTextColor={Colors.outlineVariant}
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
              ? <ActivityIndicator size="small" color={Colors.onPrimary} />
              : <Icon name="send" size={16} color={Colors.onPrimary} />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  modalContainer: { flex: 1, backgroundColor: Colors.background },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.containerMargin, paddingVertical: Spacing.md },
  modalTitle: { ...Typography.serifTitle, color: Colors.onSurface },
  commentsList: { padding: Spacing.md, gap: Spacing.md },
  commentItem: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
  commentBody: { flex: 1, backgroundColor: Pastel.teal.tint, borderRadius: Radius.lg, padding: Spacing.sm, gap: 3 },
  commentAuthor: { ...Typography.labelMd, fontSize: 13, color: Colors.onSurface },
  commentText: { ...Typography.bodyMd, fontSize: 13, color: Colors.onSurface, lineHeight: 19 },
  commentTime: { ...Typography.labelSm, color: Colors.outline, marginTop: 2 },
  commentsEmpty: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: Spacing.sm },
  commentsEmptyText: { ...Typography.bodyMd, color: Colors.outline },
  commentInput: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm, padding: Spacing.md, backgroundColor: Colors.background },
  commentTextInput: { flex: 1, backgroundColor: Colors.surfaceContainer, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2, ...Typography.bodyMd, color: Colors.onSurface, maxHeight: 100 },
  sendBtn: { width: 36, height: 36, borderRadius: Radius.full, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: Colors.outlineVariant },
});
