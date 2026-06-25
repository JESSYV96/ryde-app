import { create } from 'zustand';

import { PhotoPhase } from '@/features/rental/model/rental.types';

export type CapturedReturnPhotoDraft = {
  id: string;
  uri: string;
  phase: typeof PhotoPhase.After;
  takenAt: string;
};

type RentalReturnDraft = {
  mileageAtEnd: number | null;
  fuelLevelAtEnd: number | null;
  endConditionNotes: string;
  photos: CapturedReturnPhotoDraft[];
};

type RentalReturnDraftState = {
  draft: RentalReturnDraft;
  setInspection: (input: { mileageAtEnd: number; fuelLevelAtEnd: number; endConditionNotes: string }) => void;
  addPhoto: (photo: CapturedReturnPhotoDraft) => void;
  removePhoto: (photoId: string) => void;
  reset: () => void;
};

const initialDraft: RentalReturnDraft = {
  mileageAtEnd: null,
  fuelLevelAtEnd: null,
  endConditionNotes: '',
  photos: [],
};

export const useRentalReturnDraftStore = create<RentalReturnDraftState>((set) => ({
  draft: initialDraft,
  setInspection: ({ mileageAtEnd, fuelLevelAtEnd, endConditionNotes }) =>
    set((state) => ({
      draft: { ...state.draft, mileageAtEnd, fuelLevelAtEnd, endConditionNotes },
    })),
  addPhoto: (photo) => set((state) => ({ draft: { ...state.draft, photos: [...state.draft.photos, photo] } })),
  removePhoto: (photoId) =>
    set((state) => ({
      draft: { ...state.draft, photos: state.draft.photos.filter((photo) => photo.id !== photoId) },
    })),
  reset: () => set({ draft: initialDraft }),
}));
