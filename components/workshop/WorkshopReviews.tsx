import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Icon } from '../ui/Icon';
import { Colors, Pastel, Typography, Spacing, Radius } from '../../constants/theme';
import type { Review } from '../../types/review';

export interface WorkshopReviewsProps {
  reviews: Review[];
  showReviewForm: boolean;
  rating: number;
  onRatingChange: (star: number) => void;
  comment: string;
  onCommentChange: (text: string) => void;
  isSubmittingReview: boolean;
  onSubmitReview: () => void;
}

export function WorkshopReviews({
  reviews,
  showReviewForm,
  rating,
  onRatingChange,
  comment,
  onCommentChange,
  isSubmittingReview,
  onSubmitReview,
}: WorkshopReviewsProps) {
  return (
    <View style={styles.container}>
      {showReviewForm ? (
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Deneyimini Paylaş</Text>
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => onRatingChange(star)}>
                <Icon name={star <= rating ? 'star' : 'starEmpty'} size={32} color={Colors.amber} />
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.reviewInput}
            placeholder="Yorumunu yaz (opsiyonel)"
            placeholderTextColor={Colors.outline}
            value={comment}
            onChangeText={onCommentChange}
            multiline
            numberOfLines={3}
          />
          <TouchableOpacity
            style={[styles.submitButton, isSubmittingReview && styles.submitButtonDisabled]}
            onPress={onSubmitReview}
            disabled={isSubmittingReview}
            activeOpacity={0.85}
          >
            {isSubmittingReview ? (
              <ActivityIndicator color={Colors.onPrimary} />
            ) : (
              <Text style={styles.submitButtonText}>Yorumu Gönder</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>
          Değerlendirmeler {reviews.length > 0 ? `(${reviews.length})` : ''}
        </Text>
        {reviews.length === 0 ? (
          <Text style={styles.emptyText}>Henüz değerlendirme yok.</Text>
        ) : (
          reviews.map((r) => (
            <View key={r.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewUserName}>{r.userName}</Text>
                <View style={styles.reviewStars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Icon key={star} name={star <= r.rating ? 'star' : 'starEmpty'} size={14} color={Colors.amber} />
                  ))}
                </View>
              </View>
              {r.comment ? <Text style={styles.reviewComment}>{r.comment}</Text> : null}
              {r.employerReply ? (
                <View style={styles.replyBox}>
                  <Text style={styles.replyLabel}>Atölyeci Yanıtı</Text>
                  <Text style={styles.replyText}>{r.employerReply}</Text>
                </View>
              ) : null}
            </View>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.serifTitle,
    color: Colors.onSurface,
  },
  formCard: {
    backgroundColor: Pastel.teal.tint,
    borderRadius: Radius.xxl,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  starRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  reviewInput: {
    ...Typography.bodyMd,
    color: Colors.onSurface,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: Colors.outline,
  },
  submitButtonText: {
    ...Typography.labelMd,
    color: Colors.onPrimary,
  },
  listSection: {
    gap: Spacing.sm,
  },
  emptyText: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
  },
  reviewCard: {
    backgroundColor: Pastel.teal.tint,
    borderRadius: Radius.xl,
    padding: Spacing.sm,
    gap: 4,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewUserName: {
    ...Typography.bodyMd,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
  },
  replyBox: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.sm,
    padding: Spacing.xs,
    marginTop: 4,
  },
  replyLabel: {
    ...Typography.labelSm,
    color: Colors.primary,
    fontWeight: '700',
  },
  replyText: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
  },
});
