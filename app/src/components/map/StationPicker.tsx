import { Combobox } from "@/components/common/Combobox";
import type { Station } from "@/types";

type StationPickerProps = {
  label: string;
  placeholder: string;
  stations: Station[];
  value: Station | null;
  onChange: (code: string) => void;
};

export const StationPicker = ({
  label,
  placeholder,
  stations,
  value,
  onChange,
}: StationPickerProps) => (
  <Combobox<Station>
    label={label}
    value={value}
    onChange={(s) => onChange(s?.properties.Code ?? "")}
    options={stations}
    getOptionLabel={(s) => s.properties.Name}
    getOptionValue={(s) => s.properties.Code}
    isClearable
    placeholder={placeholder}
  />
);
