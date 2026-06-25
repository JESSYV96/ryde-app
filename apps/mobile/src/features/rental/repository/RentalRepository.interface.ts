import type { Rental, RentalCreateInput, RentalReturnInput } from '@/features/rental/model/rental.types';

export interface RentalRepositoryInterface {
  getAll(): Promise<Rental[]>;
  getById(id: string): Promise<Rental | null>;
  create(input: RentalCreateInput): Promise<Rental>;
  update(id: string, patch: Partial<Pick<Rental, 'quotePdfUri' | 'returnReportPdfUri'>>): Promise<Rental>;
  acceptQuote(id: string, input: { signatureUri: string }): Promise<Rental>;
  recordReturn(id: string, input: RentalReturnInput): Promise<Rental>;
  remove(id: string): Promise<void>;
}

export const rentalQueryKeys = {
  all: () => ['rentals'] as const,
  detail: (id: string) => ['rentals', id] as const,
};
