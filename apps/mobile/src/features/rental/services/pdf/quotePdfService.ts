import { printToFileAsync } from 'expo-print';

import { PhotoPhase, type Rental } from '@/features/rental/model/rental.types';
import { buildQuotePdfHtml } from '@/features/rental/services/pdf/templates/quotePdfTemplate';
import { buildReturnReportPdfHtml } from '@/features/rental/services/pdf/templates/returnReportPdfTemplate';
import { nowIso } from '@/shared/utils/date';

export const generateQuotePdf = async (rental: Rental): Promise<string> => {
  const html = await buildQuotePdfHtml({
    customer: rental.customer,
    vehicle: rental.vehicleSnapshot,
    startDate: rental.startDate,
    endDate: rental.endDate,
    mileageAtStart: rental.mileageAtStart,
    fuelLevelAtStart: rental.fuelLevelAtStart,
    conditionNotes: rental.conditionNotes,
    photos: rental.photos.map((photo) => ({ uri: photo.uri })),
    generatedAt: nowIso(),
  });

  const { uri } = await printToFileAsync({ html });

  return uri;
};

export const generateReturnReportPdf = async (rental: Rental): Promise<string> => {
  const html = await buildReturnReportPdfHtml({
    customer: rental.customer,
    vehicle: rental.vehicleSnapshot,
    startDate: rental.startDate,
    endDate: rental.endDate,
    mileageAtStart: rental.mileageAtStart,
    fuelLevelAtStart: rental.fuelLevelAtStart,
    conditionNotes: rental.conditionNotes,
    mileageAtEnd: rental.mileageAtEnd ?? 0,
    fuelLevelAtEnd: rental.fuelLevelAtEnd ?? 0,
    endConditionNotes: rental.endConditionNotes ?? '',
    beforePhotos: rental.photos.filter((photo) => photo.phase === PhotoPhase.Before).map((photo) => ({ uri: photo.uri })),
    afterPhotos: rental.photos.filter((photo) => photo.phase === PhotoPhase.After).map((photo) => ({ uri: photo.uri })),
    generatedAt: nowIso(),
  });

  const { uri } = await printToFileAsync({ html });

  return uri;
};
