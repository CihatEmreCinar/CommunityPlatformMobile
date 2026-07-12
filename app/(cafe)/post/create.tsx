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
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { postService } from '../../../services/postService';

const ACCENT = '#0F766E';
const MAX_CONTENT = 1000;
const MAX_MEDIA = 4;

type LocalMediaItem = {
  uri: string;
  type: 'image' | 'video';
  name: string;
  mime: string;
};

// NOT: Cafe post'unda workshop yok — sadece Caption + medya. Atölye/etiket
// seçimi (employer/post/create.tsx'teki gibi) burada bilinçli olarak yok.
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

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.7,
    });

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
      const post = await postService.create({
        caption: content.trim(),
      });
      createdPostId = post.id;

      for (let index = 0; index < mediaFiles.length; index += 1) {
        const media = mediaFiles[index];
        const formData = new FormData();
        formData.append('file', {
          uri: media.uri,
          name: media.name,
          type: media.mime,
        } as any);
        await postService.uploadMedia(post.id, formData, index);
      }

      router.back();
    } catch {
      // Medya yükleme post oluşturulduktan SONRA yapılıyor. Buradan bir hata
      // fırlarsa (ör. HEIC/HEIF 400) post DB'de zaten var demektir — kullanıcıya
      // "paylaşılamadı" deyip fotoğrafsız bir post'u ortada bırakmamak için
      // rollback yapıp gerçekten sil.
      if (createdPostId) {
        try {
          await postService.delete(createdPostId);
        } catch {
          // rollback da başarısız olursa yine de kullanıcıyı bilgilendiriyoruz
        }
      }
      Alert.alert('Hata', 'Fotoğraf/video yüklenemedi, gönderi paylaşılmadı. Lütfen farklı bir dosya deneyin.');
    } finally {
      setSubmitting(false);
    }
  }, [content, mediaFiles, router]);

  const canSubmit = content.trim().length > 0 && !submitting;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
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
                    <Ionicons name="play-circle" size={28} color="#FFFFFF" />
                  </View>
                )}
                <TouchableOpacity style={styles.removeMediaBtn} onPress={() => removeMedia(index)}>
                  <Ionicons name="close" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.addMediaBtn, mediaFiles.length >= MAX_MEDIA && styles.addMediaBtnDisabled]}
            onPress={pickMedia}
            disabled={mediaFiles.length >= MAX_MEDIA}
          >
            <Ionicons name="image-outline" size={18} color="#FFFFFF" />
            <Text style={styles.addMediaText}>Medya Ekle</Text>
          </TouchableOpacity>
          <Text style={styles.sectionHint}>{mediaFiles.length}/{MAX_MEDIA} medya eklendi</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>İçerik</Text>
          <TextInput
            style={[styles.contentInput, styles.contentInputSmall]}
            placeholder="Ne paylaşmak istiyorsun?"
            placeholderTextColor="#9CA3AF"
            value={content}
            onChangeText={setContent}
            multiline
            maxLength={MAX_CONTENT}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{content.length}/{MAX_CONTENT}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.tipsSection}>
          <Ionicons name="bulb-outline" size={16} color="#9CA3AF" />
          <Text style={styles.tipsText}>
            Kafenle ilgili duyuruları, etkinlikleri veya atmosferi paylaşarak takipçilerini bilgilendirebilirsin.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
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
    marginTop: 4,
  },
  divider: {
    height: 8,
    backgroundColor: '#F3F4F6',
  },
  contentInput: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 24,
    minHeight: 160,
    textAlignVertical: 'top',
  },
  contentInputSmall: {
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 8,
  },
  mediaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  mediaPreview: {
    width: 88,
    height: 88,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F3F4F6',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  mediaVideoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
  },
  removeMediaBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMediaBtn: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: ACCENT,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignSelf: 'flex-start',
  },
  addMediaBtnDisabled: {
    opacity: 0.5,
  },
  addMediaText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
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
