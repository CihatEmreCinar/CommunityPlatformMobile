import React, { useState, useCallback } from 'react';
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
  Image,
} from 'react-native';
import { Icon } from '../../../components/ui/Icon';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { postService } from '../../../services/postService';
import { Colors, Pastel, Typography, Spacing, Radius } from '../../../constants/theme';

const ACCENT = Colors.primary;
const MAX_CONTENT = 1000;
const MAX_MEDIA = 4;

type LocalMediaItem = { uri: string; type: 'image' | 'video'; name: string; mime: string };

// NOT: Cafe post'unda workshop yok — sadece Caption + medya (employer/post/create.tsx'teki
// atölye seçimi burada bilinçli olarak yok).
export default function CafePostCreateScreen() {
  const router = useRouter();

  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState<LocalMediaItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const pickMedia = useCallback(async () => {
    if (mediaFiles.length >= MAX_MEDIA) {
      Alert.alert('En fazla 4 medya ekleyebilirsin.');
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin gerekli', 'Medya eklemek için medya erişim izni vermelisiniz.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images', 'videos'], quality: 0.7 });
    if (result.canceled) return;
    const asset = result.assets?.[0];
    if (!asset?.uri) return;
    const type = (asset.type ?? 'image') as 'image' | 'video';
    const extension = asset.uri.split('.').pop()?.split('?')[0] ?? (type === 'video' ? 'mp4' : 'jpg');
    const mime = type === 'video' ? 'video/mp4' : 'image/jpeg';
    const name = `media_${Date.now()}.${extension}`;
    setMediaFiles((prev) => [...prev, { uri: asset.uri, type, name, mime }]);
  }, [mediaFiles.length]);

  const removeMedia = useCallback((index: number) => {
    setMediaFiles((prev) => prev.filter((_, idx) => idx !== index));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!content.trim()) {
      Alert.alert('İçerik boş olamaz.');
      return;
    }

    setSubmitting(true);
    let createdPostId: string | null = null;

    try {
      // NOT: workshopId gönderilmiyor — backend Cafe post'larında nullable kabul ediyor.
      const post = await postService.create({ caption: content.trim() });
      createdPostId = post.id;

      for (let index = 0; index < mediaFiles.length; index += 1) {
        const media = mediaFiles[index];
        const formData = new FormData();
        formData.append('file', { uri: media.uri, name: media.name, type: media.mime } as any);
        await postService.uploadMedia(post.id, formData, index);
      }
      router.back();
    } catch {
      // Medya yükleme post oluşturulduktan SONRA yapılıyor — hata olursa post DB'de
      // zaten var demektir, fotoğrafsız bir post ortada bırakmamak için rollback.
      if (createdPostId) {
        try { await postService.delete(createdPostId); } catch { /* rollback başarısız olsa da bilgilendir */ }
      }
      Alert.alert('Hata', 'Fotoğraf/video yüklenemedi, gönderi paylaşılmadı. Lütfen farklı bir dosya deneyin.');
    } finally {
      setSubmitting(false);
    }
  }, [content, mediaFiles, router]);

  const canSubmit = content.trim().length > 0 && !submitting;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.closeBtn}>
          <Icon name="close" size={19} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yeni Gönderi</Text>
        <TouchableOpacity style={[styles.publishBtn, !canSubmit && styles.publishBtnDisabled]} onPress={handleSubmit} disabled={!canSubmit}>
          {submitting ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.publishBtnText}>Paylaş</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.body} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.bodyContent}>
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
                    <Icon name="playCircle" size={26} color="#FFFFFF" />
                  </View>
                )}
                <TouchableOpacity style={styles.removeMediaBtn} onPress={() => removeMedia(index)}>
                  <Icon name="close" size={15} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <TouchableOpacity style={[styles.addMediaBtn, mediaFiles.length >= MAX_MEDIA && styles.addMediaBtnDisabled]} onPress={pickMedia} disabled={mediaFiles.length >= MAX_MEDIA}>
            <Icon name="imageOutline" size={17} color="#FFFFFF" />
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

        <View style={styles.tipsSection}>
          <Icon name="bulbOutline" size={15} color={Colors.outline} />
          <Text style={styles.tipsText}>Kafenle ilgili duyuruları, etkinlikleri veya atmosferi paylaşarak takipçilerini bilgilendirebilirsin.</Text>
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
  publishBtnText: { ...Typography.labelMd, color: '#FFFFFF' },
  body: { flex: 1 },
  bodyContent: { paddingBottom: Spacing.xl, gap: Spacing.sm },
  section: { padding: Spacing.md, backgroundColor: Pastel.coral.tint, borderRadius: Radius.xxl, marginHorizontal: Spacing.md, marginTop: Spacing.sm },
  sectionLabel: { ...Typography.labelMd, color: Colors.onSurface, marginBottom: 4 },
  sectionHint: { ...Typography.labelSm, color: Colors.onSurfaceVariant, marginTop: 4 },
  contentInput: { ...Typography.bodyLg, color: Colors.onSurface, lineHeight: 24, minHeight: 160, textAlignVertical: 'top' },
  contentInputSmall: { minHeight: 120 },
  charCount: { ...Typography.labelSm, color: Colors.outline, textAlign: 'right', marginTop: 8 },
  mediaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  mediaPreview: { width: 84, height: 84, borderRadius: Radius.lg, overflow: 'hidden', position: 'relative', backgroundColor: Colors.surfaceContainerLowest },
  mediaImage: { width: '100%', height: '100%' },
  mediaVideoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.onSurface },
  removeMediaBtn: { position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' },
  addMediaBtn: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: ACCENT, borderRadius: Radius.lg, paddingHorizontal: 14, paddingVertical: 12, alignSelf: 'flex-start' },
  addMediaBtnDisabled: { opacity: 0.5 },
  addMediaText: { ...Typography.labelMd, color: '#FFFFFF' },
  tipsSection: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: Spacing.md },
  tipsText: { flex: 1, ...Typography.labelSm, color: Colors.onSurfaceVariant, lineHeight: 18 },
});
