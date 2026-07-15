import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WorkshopForm } from '../../../../components/workshop/WorkshopForm';
import { workshopService } from '../../../../services/workshopService';
import type { Workshop, WorkshopRequest } from '../../../../types/workshop';
import { Colors, Typography } from '../../../../constants/theme';

export default function EditWorkshopScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    workshopService
      .getById(id)
      .then(setWorkshop)
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error || !workshop) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>Atölye yüklenemedi.</Text>
      </SafeAreaView>
    );
  }

  return (
    <WorkshopForm
      mode="edit"
      initialWorkshop={workshop}
      onSubmit={(payload: WorkshopRequest) => workshopService.update(workshop.id, payload).then(() => {})}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  errorText: {
    ...Typography.bodyLg,
    color: Colors.onSurfaceVariant,
  },
});
