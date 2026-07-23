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
import { Icon } from '../../../components/ui/Icon';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { postService } from '../../../services/postService';
import type { Post } from '../../../types/post.types';
import { Colors, Pastel, Typography, Spacing, Radius } from '../../../constants/theme';

const ACCENT = Colors.primary;
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

  useEffect(() => {
    if (!id) return;
    postService.getById(id)
      .then((p) => {
        setPost(p);
        setContent(p.caption ?? '');
        setTags(p.tags ?? []);
      })
      .catch(() => Alert.alert('Hata', 'Gönderi yüklenemedi.'))
      .finally(() => setLoading(false));
  }, [id]);

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

  const handleDelete = useCallback(() => {
    Alert.alert('Gönderiyi sil', 'Bu gönderi kalıcı olarak silinecek. Emin misin?', [
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
    ]);
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
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.closeBtn}>
          <Icon name="close" size={19} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gönderiyi Düzenle</Text>
        <TouchableOpacity style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]} onPress={handleSave} disabled={!canSave}>
          {submitting ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.saveBtnText}>Kaydet</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.body} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.bodyContent}>
        <View style={styles.section}>
          <TextInput
            style={styles.contentInput}
            placeholder="İçerik..."
            placeholderTextColor={Colors.outline}
            value={content}
            onChangeText={setContent}
            multiline
            maxLength={MAX_CONTENT}
            textAlignVertical="top"
            autoFocus
          />
          <Text style={styles.charCount}>{content.length}/{MAX_CONTENT}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Etiketler</Text>
          {tags.length > 0 && (
            <View style={styles.tagList}>
              {tags.map((t) => (
                <TouchableOpacity key={t} style={styles.tagChip} onPress={() => removeTag(t)} activeOpacity={0.7}>
                  <Text style={styles.tagText}>#{t}</Text>
                  <Icon name="closeCircle" size={13} color={ACCENT} />
                </TouchableOpacity>
              ))}
            </View>
          )}
          {tags.length < MAX_TAGS && (
            <View style={styles.tagInputRow}>
              <TextInput
                style={styles.tagInput}
                placeholder="Etiket ekle..."
                placeholderTextColor={Colors.outline}
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={addTag}
                returnKeyType="done"
                autoCapitalize="none"
                maxLength={30}
              />
              <TouchableOpacity style={[styles.addTagBtn, !tagInput.trim() && styles.addTagBtnDisabled]} onPress={addTag} disabled={!tagInput.trim()}>
                <Icon name="add" size={19} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.deleteRow} onPress={handleDelete} disabled={deleting} activeOpacity={0.7}>
          {deleting ? (
            <ActivityIndicator size="small" color={Pastel.coral.text} />
          ) : (
            <>
              <Icon name="trashOutline" size={17} color={Pastel.coral.text} />
              <Text style={styles.deleteText}>Gönderiyi Sil</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2 },
  closeBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...Typography.serifTitle, color: Colors.onSurface },
  saveBtn: { backgroundColor: ACCENT, borderRadius: Radius.full, paddingHorizontal: 18, paddingVertical: 8, minWidth: 72, alignItems: 'center' },
  saveBtnDisabled: { backgroundColor: Colors.outlineVariant },
  saveBtnText: { ...Typography.labelMd, color: '#FFFFFF' },
  body: { flex: 1 },
  bodyContent: { paddingBottom: Spacing.xl, gap: Spacing.sm },
  section: { padding: Spacing.md, backgroundColor: Pastel.teal.tint, borderRadius: Radius.xxl, marginHorizontal: Spacing.md, marginTop: Spacing.sm },
  sectionLabel: { ...Typography.labelMd, color: Colors.onSurface, marginBottom: 10 },
  contentInput: { ...Typography.bodyLg, color: Colors.onSurface, lineHeight: 24, minHeight: 140, textAlignVertical: 'top' },
  charCount: { ...Typography.labelSm, color: Colors.outline, textAlign: 'right', marginTop: 8 },
  tagList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  tagChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Pastel.teal.tintStrong, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 5 },
  tagText: { ...Typography.labelSm, color: ACCENT, fontWeight: '600' },
  tagInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tagInput: { flex: 1, backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radius.lg, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, ...Typography.bodyMd, color: Colors.onSurface },
  addTagBtn: { width: 40, height: 40, borderRadius: Radius.full, backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center' },
  addTagBtnDisabled: { backgroundColor: Colors.outlineVariant },
  deleteRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: Spacing.md, marginTop: Spacing.sm, justifyContent: 'center' },
  deleteText: { ...Typography.labelMd, color: Pastel.coral.text },
});
