import { ReactNode, useState } from 'react';
import { LayoutAnimation, Platform, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';
import { Icon } from '../ui/Icon';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type CollapsibleFilterPanelProps = {
  /** Panel başlığı, örn. "Filtreler" */
  title?: string;
  /** Panel kapalıyken başlığın altında gösterilecek özet, örn. "İstanbul · 100-300₺" */
  summary?: string;
  /** İlk yüklemede açık mı kapalı mı başlasın. Varsayılan: açık. */
  defaultOpen?: boolean;
  children: ReactNode;
};

/**
 * Arama ekranlarındaki filtreleri açılır/kapanır bir kutu içine alır.
 * - İlk sayfa yüklendiğinde açık gelir (defaultOpen=true).
 * - Kullanıcı başlığa dokunarak kapatabilir/açabilir.
 * - Kapalıyken, aktif filtreleri özetleyen tek satır gösterilir (summary),
 *   böylece kullanıcı neyi aradığını hatırlamak için tekrar açmak zorunda kalmaz.
 * - Açılma/kapanma LayoutAnimation ile yumuşak geçer.
 */
export function CollapsibleFilterPanel({
  title = 'Filtreler',
  summary,
  defaultOpen = true,
  children,
}: CollapsibleFilterPanelProps) {
  const [open, setOpen] = useState(defaultOpen);

  function toggle() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((prev) => !prev);
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={toggle} activeOpacity={0.7}>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>{title}</Text>
          {!open && summary ? (
            <Text style={styles.headerSummary} numberOfLines={1}>
              {summary}
            </Text>
          ) : null}
        </View>
        <Icon
          name={open ? 'collapse' : 'expand'}
          size={24}
          color={Colors.onSurfaceVariant}
        />
      </TouchableOpacity>

      {open ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  headerTextWrap: { flex: 1, gap: 2, marginRight: Spacing.sm },
  headerTitle: { ...Typography.labelMd, color: Colors.onSurface },
  headerSummary: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  body: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceVariant,
  },
});
