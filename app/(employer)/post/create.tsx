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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { postService } from '../../../services/postService';
import { workshopService } from '../../../services/workshopService';
import type { Workshop } from '../../../types/workshop';

const ACCENT = '#0F766E';
const MAX_CONTENT = 1000;
const MAX_TAGS = 5;
const MAX_MEDIA = 4;

type LocalMediaItem = {
  uri: string;
  type: 'image' | 'video';
  name: string;
  mime: string;
};

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
  const [commentsEnabled, setCommentsEnabled] = useState(true);
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

        if (!routeWorkshopId && list.length === 1) {
          setSelectedWorkshopId(list[0].id);
        }
      } catch {
        if (isMounted) {
          Alert.alert('Hata', 'Atölyelerin yüklenmesi sırasında bir sorun oluştu.');
        }
      } finally {
        if (isMounted) {
          setLoadingWorkshops(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [routeWorkshopId]);

  const selectedWorkshop = workshops.find((w) => w.id === selectedWorkshopId) ?? null;
  const availableWorkshopTags = selectedWorkshop?.tags.map((tag) => tag.toLowerCase()) ?? [];

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
      mediaTypes: ImagePicker.MediaTypeOptions.All,
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

    if (!selectedWorkshop) {
      Alert.alert('Hata', 'Bir atölye seçmelisin.');
      return;
    }

    setSubmitting(true);

    try {
      const post = await postService.create({
        workshopId: selectedWorkshop.id,
        caption: content.trim(),
        tagSlugs: tags,
        allowComments: commentsEnabled,
      });

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
      Alert.alert('Hata', 'Gönderi paylaşılamadı. Tekrar dene.');
    } finally {
      setSubmitting(false);
    }
  }, [commentsEnabled, content, selectedWorkshop, tags, mediaFiles, router]);

  const canSubmit = content.trim().length > 0 && !submitting && !!selectedWorkshop;

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
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Atölye</Text>
          {loadingWorkshops ? (
            <ActivityIndicator color={ACCENT} />
          ) : workshops.length === 0 ? (
            <Text style={styles.sectionHint}>
              Henüz bir atölyen yok. Atölye oluşturduktan sonra gönderi paylaşabilirsin.
            </Text>
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
                    <Text style={[styles.workshopName, selected && styles.workshopNameSelected]} numberOfLines={1}>
                      {workshop.title}
                    </Text>
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

        <View style={styles.divider} />

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
          <Text style={styles.sectionLabel}>Yorumlar</Text>
          <TouchableOpacity
            style={[styles.commentToggle, commentsEnabled ? styles.commentToggleActive : styles.commentToggleInactive]}
            onPress={() => setCommentsEnabled((prev) => !prev)}
            activeOpacity={0.8}
          >
            <Ionicons name={commentsEnabled ? 'chatbubble-ellipses' : 'chatbubble-outline'} size={18} color={commentsEnabled ? '#FFFFFF' : '#374151'} />
            <Text style={[styles.commentToggleText, commentsEnabled && styles.commentToggleTextActive]}>
              {commentsEnabled ? 'Yorumlara izin ver' : 'Yorumları kapat'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.sectionHint}>
            Yorum seçeneği, gönderin yayınlandıktan sonra takipçilerinin geri bildirimde bulunmasını sağlar.
          </Text>
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

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Etiketler</Text>
          <Text style={styles.sectionHint}>En fazla 5 etiket ekleyebilirsin</Text>

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
  workshopList: {
    gap: 8,
  },
  workshopItem: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  workshopItemSelected: {
    borderColor: ACCENT,
    backgroundColor: '#ECFDF5',
  },
  workshopName: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  workshopNameSelected: {
    color: ACCENT,
  },
  workshopSelectedLabel: {
    fontSize: 12,
    color: ACCENT,
    fontWeight: '700',
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
  commentToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  commentToggleActive: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  commentToggleInactive: {
    backgroundColor: '#F9FAFB',
  },
  commentToggleText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  commentToggleTextActive: {
    color: '#FFFFFF',
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