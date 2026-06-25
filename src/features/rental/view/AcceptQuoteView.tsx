import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { useAcceptQuoteViewModel } from '@/features/rental/viewmodel/useAcceptQuoteViewModel';
import { LoadingIndicator } from '@/shared/ui/components/LoadingIndicator';
import { Screen } from '@/shared/ui/components/Screen';
import { Button } from '@/shared/ui/design-system/atoms/Button';
import { SignaturePad, type SignaturePadRef } from '@/shared/ui/design-system/atoms/SignaturePad';
import { Colors, Elevation, FontSize, Fonts, Radius, Spacing } from '@/shared/ui/theme';
import { formatDisplayDateTime } from '@/shared/utils/date';

interface AcceptQuoteViewProps {
  rentalId: string;
}

export const AcceptQuoteView = ({ rentalId }: AcceptQuoteViewProps) => {
  const { rental, isLoading, hasSignature, onSignatureChange, onAccept, isAccepting } =
    useAcceptQuoteViewModel(rentalId);
  const { t } = useTranslation('rental');
  const signaturePadRef = useRef<SignaturePadRef>(null);

  if (isLoading || !rental) {
    return (
      <Screen>
        <LoadingIndicator />
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.title}>{t('acceptQuoteScreen.title')}</Text>
      <Text style={styles.instruction}>{t('acceptQuoteScreen.instruction')}</Text>

      <View style={styles.section}>
        <Text style={styles.row}>
          <Text style={styles.rowLabel}>{`${t('acceptQuoteScreen.summaryCustomerLabel')}: `}</Text>
          {`${rental.customer.firstName} ${rental.customer.lastName}`}
        </Text>
        <Text style={styles.row}>
          <Text style={styles.rowLabel}>{`${t('acceptQuoteScreen.summaryVehicleLabel')}: `}</Text>
          {`${rental.vehicleSnapshot.make} ${rental.vehicleSnapshot.model} (${rental.vehicleSnapshot.year}) — ${rental.vehicleSnapshot.licensePlate}`}
        </Text>
        <Text style={styles.row}>
          <Text style={styles.rowLabel}>{`${t('acceptQuoteScreen.summaryDatesLabel')}: `}</Text>
          {t('card.dateRange', {
            startDate: formatDisplayDateTime(rental.startDate),
            endDate: formatDisplayDateTime(rental.endDate),
          })}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('acceptQuoteScreen.signatureLabel')}</Text>
        <SignaturePad ref={signaturePadRef} onChange={onSignatureChange} />
        <Button
          label={t('acceptQuoteScreen.clear')}
          variant="outlined"
          onPress={() => signaturePadRef.current?.clear()}
        />
      </View>

      <Button
        label={isAccepting ? t('acceptQuoteScreen.accepting') : t('acceptQuoteScreen.accept')}
        onPress={() => onAccept(signaturePadRef)}
        disabled={!hasSignature || isAccepting}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: {
    fontFamily: Fonts.display,
    fontSize: FontSize.heading,
    color: Colors.light.text,
  },
  instruction: {
    fontFamily: Fonts.ui,
    fontSize: FontSize.body,
    color: Colors.light.textSecondary,
  },
  section: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.background,
    ...Elevation.card,
  },
  sectionTitle: {
    fontFamily: Fonts.displaySemiBold,
    fontSize: FontSize.subhead,
    color: Colors.light.text,
    marginBottom: Spacing.half,
  },
  row: {
    fontFamily: Fonts.ui,
    fontSize: FontSize.body,
    color: Colors.light.text,
  },
  rowLabel: {
    fontFamily: Fonts.uiBold,
  },
});
