import { create } from 'zustand';

import { PhotoPhase, type RentalCustomer } from '@/features/rental/model/rental.types';

export type CapturedPhotoDraft = {
  id: string;
  uri: string;
  phase: typeof PhotoPhase.Before;
  takenAt: string;
};

type InspectionDraft = {
  mileageAtStart: number | null;
  fuelLevelAtStart: number | null;
  conditionNotes: string;
};

type RentalDraft = {
  customer: RentalCustomer;
  vehicleId: string | null;
  startDate: string | null;
  endDate: string | null;
  inspection: InspectionDraft;
  photos: CapturedPhotoDraft[];
};

type RentalDraftState = {
  draft: RentalDraft;
  setCustomer: (customer: RentalCustomer) => void;
  setVehicleAndDates: (input: { vehicleId: string; startDate: string; endDate: string }) => void;
  setInspection: (input: { mileageAtStart: number; fuelLevelAtStart: number; conditionNotes: string }) => void;
  addPhoto: (photo: CapturedPhotoDraft) => void;
  removePhoto: (photoId: string) => void;
  reset: () => void;
};

const initialDraft: RentalDraft = {
  customer: {
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    licensePhotoFrontUri: "",
    licensePhotoBackUri: ""
  },
  vehicleId: null,
  startDate: null,
  endDate: null,
  inspection: { mileageAtStart: null, fuelLevelAtStart: null, conditionNotes: '' },
  photos: [],
};

export const useRentalDraftStore = create<RentalDraftState>((set) => ({
  draft: initialDraft,
  setCustomer: (customer) => set((state) => ({ draft: { ...state.draft, customer } })),
  setVehicleAndDates: ({ vehicleId, startDate, endDate }) =>
    set((state) => ({ draft: { ...state.draft, vehicleId, startDate, endDate } })),
  setInspection: ({ mileageAtStart, fuelLevelAtStart, conditionNotes }) =>
    set((state) => ({
      draft: { ...state.draft, inspection: { mileageAtStart, fuelLevelAtStart, conditionNotes } },
    })),
  addPhoto: (photo) => set((state) => ({ draft: { ...state.draft, photos: [...state.draft.photos, photo] } })),
  removePhoto: (photoId) =>
    set((state) => ({
      draft: { ...state.draft, photos: state.draft.photos.filter((photo) => photo.id !== photoId) },
    })),
  reset: () => set({ draft: initialDraft }),
}));
