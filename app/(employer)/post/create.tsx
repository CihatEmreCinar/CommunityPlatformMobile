import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { postService } from '../../../services/postService';

const ACCENT = '#0F766E';
const MAX_CONTENT = 1000;
const MAX_TAGS = 5;

export default function PostCreateScreen() {
  const router = useRouter();
  // NOT: backend CreatePostRequest.workshopId zorunlu — bu ekrana
  // workshop seçimi yok, route param olarak bekleniyor.
  // Çağıran ekran (ör. profile.tsx) şu an `/employer/post/create` derken
  // workshopId GEÇMİYOR — orası da güncellenmeli, yoksa submit hep hata verir.
  const { workshopId } = useLocalSearchParams<{ workshopId?: string }>();

  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const tagInputRef = useRef<TextInput>(null);

  const addTag = useCallback(() => {
    const clean = tagInput.trim().replace(/^#/, '').toLowerCase();
    if (!clean) return;
    if (tags.includes(clean)) {
      setTagInput('');
      return;
    }
    if (tags.length >= MAX_TAGS) {
      Alert.alert('En fazla 5 etiket ekleyebilirsin.');
      return;
    }
    setTags((prev) => [...prev, clean]);
    setTagInput('');
  }, [tagInput, tags]);

  const removeTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!content.trim()) {
      Alert.alert('İçerik boş olamaz.');
      return;
    }
    if (!workshopId) {
      Alert.alert('Hata', 'Atölye bilgisi bulunamadı. Lütfen bir atölye üzerinden gönderi paylaş.');
      return;
    }
    setSubmitting(true);
    try {
      await postService.create({
        workshopId,
        caption: content.trim(),
        tagSlugs: tags,
      });
      router.back();
    } catch {
      Alert.alert('Hata', 'Gönderi paylaşılamadı. Tekrar dene.');
    } finally {
      setSubmitting(false);
    }
  }, [content, tags, workshopId, router]);

  const canSubmit = content.trim().length > 0 && !submitting;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yeni Gönderi</Text>
        <TouchableOpacity
          style={[styles.publishBtn, !canSubmit && styles.publishBtnDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.publishBtnText}>Paylaş</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
        {/* İçerik */}
        <View style={styles.section}>
          <TextInput
            style={styles.contentInput}
            placeholder="Ne paylaşmak istiyorsun?"
            placeholderTextColor="#9CA3AF"
            value={content}
            onChangeText={setContent}
            multiline
            maxLength={MAX_CONTENT}
            autoFocus
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>
            {content.length}/{MAX_CONTENT}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Etiketler */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Etiketler</Text>
          <Text style={styles.sectionHint}>En fazla 5 etiket ekleyebilirsin</Text>

          {/* Mevcut etiketler */}
          {tags.length > 0 && (
            <View style={styles.tagList}>
              {tags.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={styles.tagChip}
                  onPress={() => removeTag(t)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.tagText}>#{t}</Text>
                  <Ionicons name="close-circle" size={14} color={ACCENT} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Etiket girişi */}
          {tags.length < MAX_TAGS && (
            <View style={styles.tagInputRow}>
              <TextInput
                ref={tagInputRef}
                style={styles.tagInput}
                placeholder="Etiket ekle..."
                placeholderTextColor="#9CA3AF"
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={addTag}
                returnKeyType="done"
                autoCapitalize="none"
                maxLength={30}
              />
              <TouchableOpacity
                style={[styles.addTagBtn, !tagInput.trim() && styles.addTagBtnDisabled]}
                onPress={addTag}
                disabled={!tagInput.trim()}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* İpucu */}
        <View style={styles.tipsSection}>
          <Ionicons name="bulb-outline" size={16} color="#9CA3AF" />
          <Text style={styles.tipsText}>
            Atölye içerikleri, deneyimlerin ve ipuçlarını paylaşarak takipçilerini bilgilendirebilirsin.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // ─── Header ────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  publishBtn: {
    backgroundColor: ACCENT,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
    minWidth: 72,
    alignItems: 'center',
  },
  publishBtnDisabled: {
    backgroundColor: '#99D6D0',
  },
  publishBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // ─── Body ──────────────────────────────────────────────────────────────────
  body: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  sectionHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  divider: {
    height: 8,
    backgroundColor: '#F3F4F6',
  },
  // ─── Content input ─────────────────────────────────────────────────────────
  contentInput: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 24,
    minHeight: 160,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 8,
  },
  // ─── Tags ──────────────────────────────────────────────────────────────────
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99D6D0',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagText: {
    fontSize: 13,
    color: ACCENT,
    fontWeight: '500',
  },
  tagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tagInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  addTagBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTagBtnDisabled: {
    backgroundColor: '#99D6D0',
  },
  // ─── Tips ──────────────────────────────────────────────────────────────────
  tipsSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 16,
    paddingTop: 12,
  },
  tipsText: {
    flex: 1,
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 18,
  },
});