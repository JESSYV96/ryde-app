import { useLocalSearchParams } from 'expo-router';

import { AcceptQuoteView } from '@/features/rental/view/AcceptQuoteView';

const AcceptQuoteScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <AcceptQuoteView rentalId={id} />;
};

export default AcceptQuoteScreen;
