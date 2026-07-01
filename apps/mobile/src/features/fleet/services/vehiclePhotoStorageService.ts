import { Directory, File, Paths } from 'expo-file-system';

import { nowIso } from '@/shared/utils/date';
import { generateId } from '@/shared/utils/id';

const PHOTOS_DIR_NAME = 'vehicle-photos';

const getPhotosDirectory = (): Directory => {
  const directory = new Directory(Paths.document, PHOTOS_DIR_NAME);
  if (!directory.exists) {
    directory.create({ intermediates: true });
  }
  return directory;
};

export interface StoredVehiclePhoto {
  id: string;
  uri: string;
  takenAt: string;
}

// Copies a freshly captured/picked photo from its temporary location into the
// app's permanent vehicle-photos directory so it survives after the camera or
// picker temp file is reclaimed.
export const copyToPermanentStorage = async (tempUri: string): Promise<StoredVehiclePhoto> => {
  const sourceFile = new File(tempUri);
  const destinationFile = new File(getPhotosDirectory(), `${generateId()}.jpg`);
  await sourceFile.copy(destinationFile);
  return { id: generateId(), uri: destinationFile.uri, takenAt: nowIso() };
};

export const deletePhotos = async (uris: string[]): Promise<void> => {
  for (const uri of uris) {
    const file = new File(uri);
    if (file.exists) {
      file.delete();
    }
  }
};
