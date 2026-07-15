import { WorkshopForm } from '../../../components/workshop/WorkshopForm';
import { workshopService } from '../../../services/workshopService';
import type { WorkshopRequest } from '../../../types/workshop';

export default function CreateWorkshopScreen() {
  return (
    <WorkshopForm
      mode="create"
      onSubmit={(payload: WorkshopRequest) => workshopService.create(payload).then(() => {})}
    />
  );
}
