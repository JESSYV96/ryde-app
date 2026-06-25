import { Host, Picker } from '@expo/ui';

import type { Vehicle } from '@/features/fleet/model/vehicle.types';

interface VehiclePickerViewProps {
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  onSelectVehicle: (vehicleId: string) => void;
  testID?: string;
}

export const VehiclePickerView = ({ vehicles, selectedVehicleId, onSelectVehicle, testID }: VehiclePickerViewProps) => {
  return (
    <Host matchContents>
      <Picker
        selectedValue={selectedVehicleId ?? ''}
        onValueChange={onSelectVehicle}
        appearance="wheel"
        testID={testID}
      >
        {vehicles.map((vehicle) => (
          <Picker.Item
            key={vehicle.id}
            label={`${vehicle.make} ${vehicle.model} (${vehicle.year}) — ${vehicle.licensePlate}`}
            value={vehicle.id}
          />
        ))}
      </Picker>
    </Host>
  );
};
