import { useLocalSearchParams } from 'expo-router';

import { VehicleFormView } from '@/features/fleet/view/VehicleFormView';

const EditVehicleScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <VehicleFormView vehicleId={id} />;
};

export default EditVehicleScreen;
