import { Alert } from 'react-native';
import { WorkshopForm } from '../../../components/workshop/WorkshopForm';
import { workshopService } from '../../../services/workshopService';
import type { WorkshopRequest } from '../../../types/workshop';

async function handleSubmit(payload: WorkshopRequest, coverUri: string | null) {
  const created = await workshopService.create(payload);
  if (!coverUri) return;

  try {
    const extension = coverUri.split('.').pop()?.split('?')[0] ?? 'jpg';
    const formData = new FormData();
    formData.append('file', { uri: coverUri, name: `cover_${Date.now()}.${extension}`, type: 'image/jpeg' } as any);
    await workshopService.uploadCover(created.id, formData);
  } catch {
    // Atölye zaten oluşturuldu — kapak yükleme hatası tüm işlemi başarısız göstermemeli.
    Alert.alert('Uyarı', 'Atölye oluşturuldu ancak kapak fotoğrafı yüklenemedi. Düzenle ekranından tekrar deneyebilirsin.');
  }
}

export default function CreateWorkshopScreen() {
  return <WorkshopForm mode="create" onSubmit={handleSubmit} />;
}
