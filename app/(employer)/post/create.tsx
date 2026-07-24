import React, { useState, useCallback, useEffect, useRef } from 'react';
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
import { Image } from 'expo-image';
import { Icon } from '../../../components/ui/Icon';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { postService } from '../../../services/postService';
import { workshopService } from '../../../services/workshopService';
import type { Workshop } from '../../../types/workshop';
import { Colors, Pastel, Typography, Spacing, Radius } from '../../../constants/theme';

const ACCENT = Colors.primary;
const MAX_CONTENT = 1000;
const MAX_TAGS = 5;
const MAX_MEDIA = 4;

type LocalMediaItem = { uri: string; type: 'image' | 'video'; name: string; mime: string };

export default function PostCreateScreen() {
  const router = useRouter();
  const { workshopId: routeWorkshopId } = useLocalSearchParams<{ workshopId?: string }>();

  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string | null>(routeWorkshopId ?? null);
  const [loadingWorkshops, setLoadingWorkshops] = useState(true);
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [mediaFiles, setMediaFiles] = useState<LocalMediaItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const tagInputRef = useRef<TextInput>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const list = await workshopService.getMyWorkshops();
        if (!isMounted) return;
        setWorkshops(list);
        if (routeWorkshopId && list.some((workshop) => workshop.id === routeWorkshopId)) {
          setSelectedWorkshopId(routeWorkshopId);
          return;
        }
        if (!routeWorkshopId && list.length === 1) setSelectedWorkshopId(list[0].id);
      } catch {
        if (isMounted) Alert.alert('Hata', 'Atölyelerin yüklenmesi sırasında bir sorun oluştu.');
      } finally {
        if (isMounted) setLoadingWorkshops(false);
      }
    })();
    return () => { isMounted = false; };
  }, [routeWorkshopId]);

  const selectedWorkshop = workshops.find((w) => w.id === selectedWorkshopId) ?? null;
  const availableWorkshopTags = selectedWorkshop?.tags.map((tag) => tag.toLowerCase()) ?? [];

  const addTag = useCallback(() => {
    const clean = tagInput.trim().replace(/^#/, '').toLowerCase();
    if (!clean) return;
    if (tags.includes(clean)) { setTagInput(''); return; }
    if (tags.length >= MAX_TAGS) { Alert.alert('En fazla 5 etiket ekleyebilirsin.'); return; }
    if (availableWorkshopTags.length > 0 && !availableWorkshopTags.includes(clean)) {
      Alert.alert('Etiket yalnızca seçili atölyenin etiketleri arasında olabilir.');
      return;
    }
    setTags((prev) => [...prev, clean]);
    setTagInput('');
  }, [tagInput, tags, availableWorkshopTags]);

  const removeTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  const pickMedia = useCallback(async () => {
    if (mediaFiles.length >= MAX_MEDIA) { Alert.alert('En fazla 4 medya ekleyebilirsin.'); return; }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('İzin gerekli', 'Medya eklemek için medya erişim izni vermelisiniz.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images', 'videos'], quality: 0.7 });
    if (result.canceled) return;
    const asset = result.assets?.[0];
    if (!asset?.uri) return;
    const type = (asset.type ?? 'image') as 'image' | 'video';

    if (type === 'video') {
      const name = `media_${Date.now()}.mp4`;
      setMediaFiles((prev) => [...prev, { uri: asset.uri, type, name, mime: 'video/mp4' }]);
      return;
    }

    // Backend post medyası yalnızca WEBP (görsel) veya MP4 (video) kabul ediyor —
    // galeriden gelen JPEG/PNG'yi yüklemeden önce WEBP'e çeviriyoruz.
    const converted = await ImageManipulator.manipulateAsync(asset.uri, [], {
      format: ImageManipulator.SaveFormat.WEBP,
      compress: 0.85,
    });
    const name = `media_${Date.now()}.webp`;
    setMediaFiles((prev) => [...prev, { uri: converted.uri, type, name, mime: 'image/webp' }]);
  }, [mediaFiles.length]);

  const removeMedia = useCallback((index: number) => {
    setMediaFiles((prev) => prev.filter((_, idx) => idx !== index));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!content.trim()) { Alert.alert('İçerik boş olamaz.'); return; }
    if (!selectedWorkshop) { Alert.alert('Hata', 'Bir atölye seçmelisin.'); return; }
    setSubmitting(true);
    try {
      const post = await postService.create({ workshopId: selectedWorkshop.id, caption: content.trim(), tagSlugs: tags });
      for (let index = 0; index < mediaFiles.length; index += 1) {
        const media = mediaFiles[index];
        const formData = new FormData();
        formData.append('file', { uri: media.uri, name: media.name, type: media.mime } as any);
        await postService.uploadMedia(post.id, formData, index);
      }
      router.back();
    } catch {
      Alert.alert('Hata', 'Gönderi paylaşılamadı. Tekrar dene.');
    } finally {
      setSubmitting(false);
    }
  }, [content, selectedWorkshop, tags, mediaFiles, router]);

  const canSubmit = content.trim().length > 0 && !submitting && !!selectedWorkshop;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Kapat">
          <Icon name="close" size={19} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yeni Gönderi</Text>
        <TouchableOpacity style={[styles.publishBtn, !canSubmit && styles.publishBtnDisabled]} onPress={handleSubmit} disabled={!canSubmit}>
          {submitting ? <ActivityIndicator size="small" color={Colors.white} /> : <Text style={styles.publishBtnText}>Paylaş</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.body} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.bodyContent}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Atölye</Text>
          {loadingWorkshops ? (
            <ActivityIndicator color={ACCENT} />
          ) : workshops.length === 0 ? (
            <Text style={styles.sectionHint}>Henüz bir atölyen yok. Atölye oluşturduktan sonra gönderi paylaşabilirsin.</Text>
          ) : (
            <View style={styles.workshopList}>
              {workshops.map((workshop) => {
                const selected = workshop.id === selectedWorkshopId;
                return (
                  <TouchableOpacity
                    key={workshop.id}
                    style={[styles.workshopItem, selected && styles.workshopItemSelected]}
                    onPress={() => setSelectedWorkshopId(workshop.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.workshopName, selected && styles.workshopNameSelected]} numberOfLines={1}>{workshop.title}</Text>
                    {selected && <Text style={styles.workshopSelectedLabel}>Seçili</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
          {selectedWorkshop ? (
            <Text style={styles.sectionHint}>
              Atölye etiketleri: {availableWorkshopTags.length > 0 ? availableWorkshopTags.map((tag) => `#${tag}`).join(' ') : 'Etiket listesi boş. İstediğin etiketleri kullanabilirsin.'}
            </Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Medya</Text>
          <Text style={styles.sectionHint}>Fotoğraf veya video ekleyebilirsin.</Text>
          <View style={styles.mediaRow}>
            {mediaFiles.map((file, index) => (
              <View key={`${file.uri}-${index}`} style={styles.mediaPreview}>
                {file.type === 'image' ? (
                  <Image source={{ uri: file.uri }} style={styles.mediaImage} />
                ) : (
                  <View style={styles.mediaVideoPlaceholder}>
                    <Icon name="playCircle" size={26} color={Colors.white} />
                  </View>
                )}
                <TouchableOpacity style={styles.removeMediaBtn} onPress={() => removeMedia(index)} accessibilityRole="button" accessibilityLabel="Medyayı kaldır">
                  <Icon name="close" size={15} color={Colors.white} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <TouchableOpacity style={[styles.addMediaBtn, mediaFiles.length >= MAX_MEDIA && styles.addMediaBtnDisabled]} onPress={pickMedia} disabled={mediaFiles.length >= MAX_MEDIA}>
            <Icon name="imageOutline" size={17} color={Colors.white} />
            <Text style={styles.addMediaText}>Medya Ekle</Text>
          </TouchableOpacity>
          <Text style={styles.sectionHint}>{mediaFiles.length}/{MAX_MEDIA} medya eklendi</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>İçerik</Text>
          <TextInput
            style={[styles.contentInput, styles.contentInputSmall]}
            placeholder="Ne paylaşmak istiyorsun?"
            placeholderTextColor={Colors.outline}
            value={content}
            onChangeText={setContent}
            multiline
            maxLength={MAX_CONTENT}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{content.length}/{MAX_CONTENT}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Etiketler</Text>
          <Text style={styles.sectionHint}>En fazla 5 etiket ekleyebilirsin</Text>

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
                ref={tagInputRef}
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
              <TouchableOpacity style={[styles.addTagBtn, !tagInput.trim() && styles.addTagBtnDisabled]} onPress={addTag} disabled={!tagInput.trim()} accessibilityRole="button" accessibilityLabel="Etiket ekle">
                <Icon name="add" size={19} color={Colors.white} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.tipsSection}>
          <Icon name="bulbOutline" size={15} color={Colors.outline} />
          <Text style={styles.tipsText}>Atölye içerikleri, deneyimlerin ve ipuçlarını paylaşarak takipçilerini bilgilendirebilirsin.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2 },
  closeBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...Typography.serifTitle, color: Colors.onSurface },
  publishBtn: { backgroundColor: ACCENT, borderRadius: Radius.full, paddingHorizontal: 18, paddingVertical: 8, minWidth: 72, alignItems: 'center' },
  publishBtnDisabled: { backgroundColor: Colors.outlineVariant },
  publishBtnText: { ...Typography.labelMd, color: Colors.white },
  body: { flex: 1 },
  bodyContent: { paddingBottom: Spacing.xl, gap: Spacing.sm },
  section: { padding: Spacing.md, backgroundColor: Pastel.teal.tint, borderRadius: Radius.xxl, marginHorizontal: Spacing.md, marginTop: Spacing.sm },
  sectionLabel: { ...Typography.labelMd, color: Colors.onSurface, marginBottom: 4 },
  sectionHint: { ...Typography.labelSm, color: Colors.onSurfaceVariant, marginTop: 4 },
  contentInput: { ...Typography.bodyLg, color: Colors.onSurface, lineHeight: 24, minHeight: 160, textAlignVertical: 'top' },
  contentInputSmall: { minHeight: 120 },
  charCount: { ...Typography.labelSm, color: Colors.outline, textAlign: 'right', marginTop: 8 },
  tagList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  tagChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Pastel.teal.tintStrong, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 5 },
  tagText: { ...Typography.labelSm, color: ACCENT, fontWeight: '600' },
  tagInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tagInput: { flex: 1, backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radius.lg, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, ...Typography.bodyMd, color: Colors.onSurface },
  addTagBtn: { width: 40, height: 40, borderRadius: Radius.full, backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center' },
  addTagBtnDisabled: { backgroundColor: Colors.outlineVariant },
  workshopList: { gap: 8 },
  workshopItem: { padding: 12, borderRadius: Radius.lg, backgroundColor: Colors.surfaceContainerLowest, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  workshopItemSelected: { backgroundColor: Pastel.teal.tintStrong },
  workshopName: { flex: 1, ...Typography.bodyMd, fontWeight: '600', color: Colors.onSurface },
  workshopNameSelected: { color: ACCENT },
  workshopSelectedLabel: { ...Typography.labelSm, color: ACCENT, fontWeight: '700' },
  mediaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  mediaPreview: { width: 84, height: 84, borderRadius: Radius.lg, overflow: 'hidden', position: 'relative', backgroundColor: Colors.surfaceContainerLowest },
  mediaImage: { width: '100%', height: '100%' },
  mediaVideoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.onSurface },
  removeMediaBtn: { position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' },
  addMediaBtn: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: ACCENT, borderRadius: Radius.lg, paddingHorizontal: 14, paddingVertical: 12, alignSelf: 'flex-start' },
  addMediaBtnDisabled: { opacity: 0.5 },
  addMediaText: { ...Typography.labelMd, color: Colors.white },
  tipsSection: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: Spacing.md },
  tipsText: { flex: 1, ...Typography.labelSm, color: Colors.onSurfaceVariant, lineHeight: 18 },
});
