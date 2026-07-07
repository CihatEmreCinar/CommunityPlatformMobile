import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../../../components/layout/ScreenContainer';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../constants/theme';
import { spaceListingService } from '../../../services/spaceListingService';
import { cafeProfileService } from '../../../services/cafeProfileService';

export default function CafeDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [listingCount, setListingCount] = useState(0);
  const [name, setName] = useState('');

  const load = useCallback(async () => {
    try {
      const [listings, profile] = await Promise.all([spaceListingService.getMine(), cafeProfileService.getMe()]);
      setListingCount(listings.length);
      setName(profile.name ?? '');
    } catch (err) {
      console.log('dashboard load failed', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <ScreenContainer>
      <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
    </ScreenContainer>
  );

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.welcome}>Merhaba,</Text>
        <Text style={styles.name}>{name}</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>İlanlar</Text>
          <Text style={styles.cardValue}>{listingCount}</Text>
        </View>

        <View style={styles.row}>
          <TouchableOpacity style={styles.action} onPress={() => router.push('/(cafe)/(tabs)/listings')}>
            <Text style={styles.actionText}>İlanlarım</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.action} onPress={() => router.push('/(cafe)/(tabs)/profile')}>
            <Text style={styles.actionText}>Profilim</Text>
          </TouchableOpacity>
        </View>

      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: Spacing.md, gap: Spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  welcome: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  name: { ...Typography.h2, color: Colors.onSurface },
  card: { backgroundColor: Colors.surfaceContainerLowest, padding: Spacing.md, borderRadius: Radius.lg, ...Shadows.sm },
  cardTitle: { ...Typography.labelMd, color: Colors.onSurfaceVariant },
  cardValue: { ...Typography.h3, color: Colors.onSurface, marginTop: 6 },
  row: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md },
  action: { flex: 1, backgroundColor: Colors.primary, padding: Spacing.md, borderRadius: Radius.md, alignItems: 'center' },
  actionText: { ...Typography.labelMd, color: Colors.onPrimary },
});
 
