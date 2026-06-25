export const getDirtyErrorMessage = (isDirty: boolean, message: string | undefined): string | undefined =>
  isDirty ? message : undefined;
