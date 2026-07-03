import React, { useState, useEffect, useCallback } from 'react';
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
import type { Post } from '../../../types/post.types';

const ACCENT = '#0F766E';
const MAX_CONTENT = 1000;
const MAX_TAGS = 5;

export default function PostEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [post, setPost] = useState<Post | null>(null);
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ─── Post'u yükle ──────────────────────────────────────────────────────────
  // NOT: backend alanı caption (content değil)
  useEffect(() => {
    if (!id) return;
    postService
      .getById(id)
      .then((p) => {
        setPost(p);
        setContent(p.caption ?? '');
        setTags(p.tags ?? []);
      })
      .catch(() => Alert.alert('Hata', 'Gönderi yüklenemedi.'))
      .finally(() => setLoading(false));
  }, [id]);

  // ─── Tag işlemleri ─────────────────────────────────────────────────────────
  const addTag = useCallback(() => {
    const clean = tagInput.trim().replace(/^#/, '').toLowerCase();
    if (!clean || tags.includes(clean)) { setTagInput(''); return; }
    if (tags.length >= MAX_TAGS) { Alert.alert('En fazla 5 etiket ekleyebilirsin.'); return; }
    setTags((prev) => [...prev, clean]);
    setTagInput('');
  }, [tagInput, tags]);

  const removeTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  // ─── Kaydet ────────────────────────────────────────────────────────────────
  // NOT: UpdatePostRequest → { caption?, tagSlugs? } — content/tags değil
  const handleSave = useCallback(async () => {
    if (!id || !content.trim()) return;
    setSubmitting(true);
    try {
      await postService.update(id, { caption: content.trim(), tagSlugs: tags });
      router.back();
    } catch {
      Alert.alert('Hata', 'Gönderi güncellenemedi.');
    } finally {
      setSubmitting(false);
    }
  }, [id, content, tags, router]);

  // ─── Sil ───────────────────────────────────────────────────────────────────
  const handleDelete = useCallback(() => {
    Alert.alert(
      'Gönderiyi sil',
      'Bu gönderi kalıcı olarak silinecek. Emin misin?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            if (!id) return;
            setDeleting(true);
            try {
              await postService.delete(id);
              router.back();
            } catch {
              Alert.alert('Hata', 'Gönderi silinemedi.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  }, [id, router]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    );
  }

  const canSave =
    content.trim().length > 0 &&
    !submitting &&
    !deleting &&
    (content.trim() !== (post?.caption ?? '') || JSON.stringify(tags) !== JSON.stringify(post?.tags));

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gönderiyi Düzenle</Text>
        <TouchableOpacity
          style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={!canSave}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveBtnText}>Kaydet</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
        {/* İçerik */}
        <View style={styles.section}>
          <TextInput
            style={styles.contentInput}
            placeholder="İçerik..."
            placeholderTextColor="#9CA3AF"
            value={content}
            onChangeText={setContent}
            multiline
            maxLength={MAX_CONTENT}
            textAlignVertical="top"
            autoFocus
          />
          <Text style={styles.charCount}>{content.length}/{MAX_CONTENT}</Text>
        </View>

        <View style={styles.divider} />

        {/* Etiketler */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Etiketler</Text>
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
          {tags.length < MAX_TAGS && (
            <View style={styles.tagInputRow}>
              <TextInput
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

        {/* Sil butonu */}
        <TouchableOpacity
          style={styles.deleteRow}
          onPress={handleDelete}
          disabled={deleting}
          activeOpacity={0.7}
        >
          {deleting ? (
            <ActivityIndicator size="small" color="#EF4444" />
          ) : (
            <>
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
              <Text style={styles.deleteText}>Gönderiyi Sil</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  saveBtn: { backgroundColor: ACCENT, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 8, minWidth: 72, alignItems: 'center' },
  saveBtnDisabled: { backgroundColor: '#99D6D0' },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  body: { flex: 1 },
  section: { padding: 16 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 10 },
  divider: { height: 8, backgroundColor: '#F3F4F6' },
  contentInput: { fontSize: 16, color: '#111827', lineHeight: 24, minHeight: 160, textAlignVertical: 'top' },
  charCount: { fontSize: 12, color: '#9CA3AF', textAlign: 'right', marginTop: 8 },
  tagList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  tagChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F0FDFA', borderWidth: 1, borderColor: '#99D6D0', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 5 },
  tagText: { fontSize: 13, color: ACCENT, fontWeight: '500' },
  tagInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tagInput: { flex: 1, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#111827' },
  addTagBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center' },
  addTagBtnDisabled: { backgroundColor: '#99D6D0' },
  deleteRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 20, marginTop: 8 },
  deleteText: { fontSize: 15, fontWeight: '600', color: '#EF4444' },
});