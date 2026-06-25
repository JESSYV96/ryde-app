import { File } from 'expo-file-system';

import i18n from '@/shared/i18n/i18n';
import { formatDisplayDate, formatDisplayDateTime } from '@/shared/utils/date';
import type { RentalCustomer, RentalVehicle } from '@/features/rental/model/rental.types';

export interface ReturnReportPdfData {
  customer: RentalCustomer;
  vehicle: RentalVehicle;
  startDate: string;
  endDate: string;
  mileageAtStart: number;
  fuelLevelAtStart: number;
  conditionNotes: string;
  mileageAtEnd: number;
  fuelLevelAtEnd: number;
  endConditionNotes: string;
  beforePhotos: { uri: string }[];
  afterPhotos: { uri: string }[];
  generatedAt: string;
}

const buildPhotoTags = async (photos: { uri: string }[]): Promise<string> => {
  const tags = await Promise.all(
    photos.map(async (photo) => {
      const base64 = await new File(photo.uri).base64();
      return `<img src="data:image/jpeg;base64,${base64}" style="width:100%;height:160px;object-fit:cover;border-radius:8px;" />`;
    })
  );
  return tags.join('');
};

export const buildReturnReportPdfHtml = async (data: ReturnReportPdfData): Promise<string> => {
  const t = i18n.t;
  const beforePhotoTags = await buildPhotoTags(data.beforePhotos);
  const afterPhotoTags = await buildPhotoTags(data.afterPhotos);

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #111; padding: 24px; }
          h1 { font-size: 22px; margin-bottom: 4px; }
          .muted { color: #666; font-size: 12px; margin-bottom: 24px; }
          .section { margin-bottom: 20px; }
          .section h2 { font-size: 15px; margin-bottom: 8px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
          .row { display: flex; justify-content: space-between; font-size: 13px; padding: 2px 0; }
          .notes { font-size: 13px; white-space: pre-wrap; }
          .comparison { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
          .comparison h3 { font-size: 13px; margin-bottom: 6px; }
          .photos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
          footer { margin-top: 32px; font-size: 11px; color: #999; }
        </style>
      </head>
      <body>
        <h1>${t('rental:returnReportPdf.documentTitle')}</h1>
        <div class="muted">${t('rental:returnReportPdf.generatedOn', { date: formatDisplayDate(data.generatedAt) })}</div>

        <div class="section">
          <h2>${t('rental:returnReportPdf.customerSectionTitle')}</h2>
          <div class="row"><span>${t('rental:returnReportPdf.nameLabel')}</span><span>${data.customer.firstName} ${data.customer.lastName}</span></div>
        </div>

        <div class="section">
          <h2>${t('rental:returnReportPdf.vehicleSectionTitle')}</h2>
          <div class="row"><span>${t('rental:returnReportPdf.vehicleLabel')}</span><span>${data.vehicle.make} ${data.vehicle.model} (${data.vehicle.year})</span></div>
          <div class="row"><span>${t('rental:returnReportPdf.plateLabel')}</span><span>${data.vehicle.licensePlate}</span></div>
          <div class="row"><span>${t('rental:returnReportPdf.startLabel')}</span><span>${formatDisplayDateTime(data.startDate)}</span></div>
          <div class="row"><span>${t('rental:returnReportPdf.endLabel')}</span><span>${formatDisplayDateTime(data.endDate)}</span></div>
        </div>

        <div class="section">
          <h2>${t('rental:returnReportPdf.comparisonSectionTitle')}</h2>
          <div class="comparison">
            <div>
              <h3>${t('rental:returnReportPdf.mileageAtStartLabel')}</h3>
              <div>${data.mileageAtStart} km</div>
              <h3>${t('rental:returnReportPdf.fuelLevelAtStartLabel')}</h3>
              <div>${data.fuelLevelAtStart}%</div>
              <h3>${t('rental:returnReportPdf.conditionNotesAtStartLabel')}</h3>
              <div class="notes">${data.conditionNotes || t('rental:returnReportPdf.noNotes')}</div>
            </div>
            <div>
              <h3>${t('rental:returnReportPdf.mileageAtEndLabel')}</h3>
              <div>${data.mileageAtEnd} km</div>
              <h3>${t('rental:returnReportPdf.fuelLevelAtEndLabel')}</h3>
              <div>${data.fuelLevelAtEnd}%</div>
              <h3>${t('rental:returnReportPdf.conditionNotesAtEndLabel')}</h3>
              <div class="notes">${data.endConditionNotes || t('rental:returnReportPdf.noNotes')}</div>
            </div>
          </div>
        </div>

        ${
          beforePhotoTags.length > 0
            ? `<div class="section"><h2>${t('rental:returnReportPdf.beforePhotosSectionTitle')}</h2><div class="photos">${beforePhotoTags}</div></div>`
            : ''
        }

        ${
          afterPhotoTags.length > 0
            ? `<div class="section"><h2>${t('rental:returnReportPdf.afterPhotosSectionTitle')}</h2><div class="photos">${afterPhotoTags}</div></div>`
            : ''
        }

        <footer>${t('rental:returnReportPdf.footer')}</footer>
      </body>
    </html>
  `;
};
