import { useLocalSearchParams } from 'expo-router';

import { ReturnStepView } from '@/features/rental/view/ReturnStepView';

const RentalReturnScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ReturnStepView rentalId={id} />;
};

export default RentalReturnScreen;
