import { Directory, File, Paths } from 'expo-file-system';

import { nowIso } from '@/shared/utils/date';
import { generateId } from '@/shared/utils/id';
import type { DriverLicenseSide, PhotoPhase } from '@/features/rental/model/rental.types';

const PHOTOS_DIR_NAME = 'rental-photos';

const getPhotosDirectory = (): Directory => {
  const directory = new Directory(Paths.document, PHOTOS_DIR_NAME);
  if (!directory.exists) {
    directory.create({ intermediates: true });
  }
  return directory;
};

export interface CopyToPermanentStorageInput {
  tempUri: string;
  rentalDraftId: string;
  phase: PhotoPhase;
}

export interface CopyToPermanentStorageResult {
  id: string;
  uri: string;
  phase: PhotoPhase;
  takenAt: string;
}

export const copyToPermanentStorage = async (
  input: CopyToPermanentStorageInput
): Promise<CopyToPermanentStorageResult> => {
  const sourceFile = new File(input.tempUri);
  const destinationFile = new File(getPhotosDirectory(), `${input.rentalDraftId}-${generateId()}.jpg`);
  await sourceFile.copy(destinationFile);
  return { id: generateId(), uri: destinationFile.uri, phase: input.phase, takenAt: nowIso() };
};

export interface CopyLicensePhotoToPermanentStorageInput {
  tempUri: string;
  rentalDraftId: string;
  side: DriverLicenseSide;
}

export const copyLicensePhotoToPermanentStorage = async (
  input: CopyLicensePhotoToPermanentStorageInput
): Promise<string> => {
  const sourceFile = new File(input.tempUri);
  const destinationFile = new File(
    getPhotosDirectory(),
    `${input.rentalDraftId}-license-${input.side}-${generateId()}.jpg`
  );
  await sourceFile.copy(destinationFile);
  return destinationFile.uri;
};

export interface SaveSignatureInput {
  base64Png: string;
  rentalId: string;
}

export const saveSignature = (input: SaveSignatureInput): string => {
  const destinationFile = new File(getPhotosDirectory(), `${input.rentalId}-signature.png`);
  destinationFile.write(input.base64Png, { encoding: 'base64' });
  return destinationFile.uri;
};

export const deletePhotos = async (uris: string[]): Promise<void> => {
  for (const uri of uris) {
    const file = new File(uri);
    if (file.exists) {
      file.delete();
    }
  }
};
