import { ReactNode, useState } from 'react';
import { LayoutAnimation, Platform, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';
import { Icon } from '../ui/Icon';
import { Colors, Pastel, Typography, Spacing, Radius } from '../../constants/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type CollapsibleFilterPanelProps = {
  title?: string;
  summary?: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

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
            <Text style={styles.headerSummary} numberOfLines={1}>{summary}</Text>
          ) : null}
        </View>
        <Icon name={open ? 'collapse' : 'expand'} size={22} color={Pastel.teal.text} />
      </TouchableOpacity>

      {open ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  // Flat pastel panel — border kaldırıldı.
  container: {
    backgroundColor: Pastel.teal.tint,
    borderRadius: Radius.xxl,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  headerTextWrap: { flex: 1, gap: 2, marginRight: Spacing.sm },
  headerTitle: { ...Typography.labelMd, color: Colors.onSurface },
  headerSummary: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  body: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
});
