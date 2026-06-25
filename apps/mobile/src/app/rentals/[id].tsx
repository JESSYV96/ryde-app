import { useLocalSearchParams } from 'expo-router';

import { RentalDetailView } from '@/features/rental/view/RentalDetailView';

const RentalDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <RentalDetailView rentalId={id} />;
};

export default RentalDetailScreen;
