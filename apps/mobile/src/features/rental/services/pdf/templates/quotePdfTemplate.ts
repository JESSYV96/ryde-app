import { File } from 'expo-file-system';

import i18n from '@/shared/i18n/i18n';
import { formatDisplayDate, formatDisplayDateTime } from '@/shared/utils/date';
import type { RentalCustomer, RentalVehicle } from '@/features/rental/model/rental.types';

export interface QuotePdfData {
  customer: RentalCustomer;
  vehicle: RentalVehicle;
  startDate: string;
  endDate: string;
  mileageAtStart: number;
  fuelLevelAtStart: number;
  conditionNotes: string;
  photos: { uri: string }[];
  generatedAt: string;
}

export const buildQuotePdfHtml = async (data: QuotePdfData): Promise<string> => {
  const t = i18n.t;
  const photoTags = await Promise.all(
    data.photos.map(async (photo) => {
      const base64 = await new File(photo.uri).base64();
      return `<img src="data:image/jpeg;base64,${base64}" style="width:100%;height:160px;object-fit:cover;border-radius:8px;" />`;
    })
  );

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
          .photos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
          footer { margin-top: 32px; font-size: 11px; color: #999; }
        </style>
      </head>
      <body>
        <h1>${t('rental:pdf.documentTitle')}</h1>
        <div class="muted">${t('rental:pdf.generatedOn', { date: formatDisplayDate(data.generatedAt) })}</div>

        <div class="section">
          <h2>${t('rental:pdf.customerSectionTitle')}</h2>
          <div class="row"><span>${t('rental:pdf.nameLabel')}</span><span>${data.customer.firstName} ${data.customer.lastName}</span></div>
          <div class="row"><span>${t('rental:pdf.emailLabel')}</span><span>${data.customer.email}</span></div>
          <div class="row"><span>${t('rental:pdf.phoneLabel')}</span><span>${data.customer.phoneNumber}</span></div>
        </div>

        <div class="section">
          <h2>${t('rental:pdf.vehicleSectionTitle')}</h2>
          <div class="row"><span>${t('rental:pdf.vehicleLabel')}</span><span>${data.vehicle.make} ${data.vehicle.model} (${data.vehicle.year})</span></div>
          <div class="row"><span>${t('rental:pdf.plateLabel')}</span><span>${data.vehicle.licensePlate}</span></div>
          <div class="row"><span>${t('rental:pdf.startLabel')}</span><span>${formatDisplayDateTime(data.startDate)}</span></div>
          <div class="row"><span>${t('rental:pdf.endLabel')}</span><span>${formatDisplayDateTime(data.endDate)}</span></div>
        </div>

        <div class="section">
          <h2>${t('rental:pdf.inspectionSectionTitle')}</h2>
          <div class="row"><span>${t('rental:pdf.mileageLabel')}</span><span>${data.mileageAtStart} km</span></div>
          <div class="row"><span>${t('rental:pdf.fuelLevelLabel')}</span><span>${data.fuelLevelAtStart}%</span></div>
          <div class="notes">${data.conditionNotes || t('rental:pdf.noNotes')}</div>
        </div>

        ${
          photoTags.length > 0
            ? `<div class="section"><h2>${t('rental:pdf.photosSectionTitle')}</h2><div class="photos">${photoTags.join('')}</div></div>`
            : ''
        }

        <footer>${t('rental:pdf.footer')}</footer>
      </body>
    </html>
  `;
};
