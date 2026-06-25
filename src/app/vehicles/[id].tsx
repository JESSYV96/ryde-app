import { useLocalSearchParams } from 'expo-router';

import { VehicleDetailView } from '@/features/fleet/view/VehicleDetailView';

const VehicleDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <VehicleDetailView vehicleId={id} />;
};

export default VehicleDetailScreen;
