import React, { useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Icon } from '../ui/Icon';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';

export interface LocationPickerItem {
  id: string;
  name: string;
  /** İl için plaka kodu gibi ikincil bir bilgi — satırın sağında gösterilir. */
  subtitle?: string;
}

export interface LocationPickerModalProps {
  visible: boolean;
  title: string;
  items: LocationPickerItem[];
  selectedId?: string | null;
  loading?: boolean;
  /** Yükleme başarısız olduğunda gösterilecek mesaj. */
  errorMessage?: string | null;
  searchPlaceholder?: string;
  emptyMessage?: string;
  onSelect: (item: LocationPickerItem) => void;
  onClose: () => void;
}

/**
 * İl/ilçe gibi orta-büyük listeler (81 il, ~40'a varan ilçe) için aranabilir
 * seçim modalı. bookings.tsx'teki review modalıyla aynı slide/pageSheet
 * deseni kullanılır — uygulama genelinde tutarlı modal hissi için.
 */
export function LocationPickerModal({
  visible,
  title,
  items,
  selectedId,
  loading = false,
  errorMessage = null,
  searchPlaceholder = 'Ara...',
  emptyMessage = 'Sonuç bulunamadı.',
  onSelect,
  onClose,
}: LocationPickerModalProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('tr-TR');
    if (!term) return items;
    return items.filter((item) => item.name.toLocaleLowerCase('tr-TR').includes(term));
  }, [items, query]);

  function handleClose() {
    setQuery('');
    onClose();
  }

  function handleSelect(item: LocationPickerItem) {
    setQuery('');
    onSelect(item);
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} accessibilityRole="button" accessibilityLabel="Kapat">
            <Icon name="closeModal" size={22} color={Colors.onSurface} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchWrap}>
          <Icon name="searchInput" size={16} color={Colors.outline} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={searchPlaceholder}
            placeholderTextColor={Colors.outlineVariant}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} accessibilityRole="button" accessibilityLabel="Aramayı temizle">
              <Icon name="closeCircle" size={16} color={Colors.outline} />
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : errorMessage ? (
          <View style={styles.centered}>
            <Icon name="errorOutline" size={28} color={Colors.error} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <View style={styles.centered}>
                <Text style={styles.emptyText}>{emptyMessage}</Text>
              </View>
            }
            renderItem={({ item }) => {
              const isSelected = item.id === selectedId;
              return (
                <TouchableOpacity
                  style={styles.row}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.rowText, isSelected && styles.rowTextSelected]}>{item.name}</Text>
                  {item.subtitle ? <Text style={styles.rowSubtitle}>{item.subtitle}</Text> : null}
                  {isSelected ? (
                    <Icon name="check" size={18} color={Colors.primary} style={styles.checkIcon} />
                  ) : null}
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceContainerLowest },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceVariant,
  },
  title: { ...Typography.h3, color: Colors.onSurface },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
  },
  searchIcon: { marginRight: 2 },
  searchInput: {
    flex: 1,
    ...Typography.bodyMd,
    color: Colors.onSurface,
    paddingVertical: Spacing.sm,
  },
  listContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: Spacing.xl },
  separator: { height: 1, backgroundColor: Colors.surfaceVariant },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    gap: Spacing.xs,
  },
  rowText: { ...Typography.bodyLg, color: Colors.onSurface, flex: 1 },
  rowTextSelected: { color: Colors.primary, fontWeight: '700' },
  rowSubtitle: { ...Typography.labelSm, color: Colors.onSurfaceVariant },
  checkIcon: { marginLeft: Spacing.xs },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm },
  emptyText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  errorText: { ...Typography.bodyMd, color: Colors.error, textAlign: 'center', paddingHorizontal: Spacing.lg },
});
