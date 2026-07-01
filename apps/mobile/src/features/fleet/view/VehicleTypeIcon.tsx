import { SymbolView } from 'expo-symbols';

import type { VehicleType } from '@/features/fleet/model/vehicle.types';
import { Colors } from '@/shared/ui/theme';

interface VehicleTypeIconProps {
  type: VehicleType;
  size?: number;
  color?: string;
}

// Per-platform symbol for each Vehicle Type (SF Symbols on iOS, Material Symbols
// on Android) — same convention as the tab bar icons.
const VEHICLE_TYPE_SYMBOLS = {
  car: { android: 'directions_car_filled', ios: 'car.fill' },
  motorcycle: { android: 'two_wheeler', ios: 'motorcycle' },
  truck: { android: 'local_shipping', ios: 'truck.box.fill' },
} as const satisfies Record<VehicleType, { android: string; ios: string }>;

export const VehicleTypeIcon = ({ type, size = 15, color = Colors.light.textSecondary }: VehicleTypeIconProps) => (
  <SymbolView name={VEHICLE_TYPE_SYMBOLS[type]} tintColor={color} size={size} />
);
