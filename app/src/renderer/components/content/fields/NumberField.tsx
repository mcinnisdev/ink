import FieldWrapper from "./FieldWrapper";

interface Props {
  label: string;
  value: number | string;
  required?: boolean;
  onChange: (value: number | string) => void;
}

export default function NumberField({
  label,
  value,
  required,
  onChange,
}: Props) {
  return (
    <FieldWrapper label={label} required={required}>
      <input
        type="number"
        value={value}
        onChange={(e) =>
          onChange(e.target.value === "" ? "" : Number(e.target.value))
        }
        className="w-full bg-ink-900 border border-ink-600 rounded px-2 py-1 text-xs text-ink-50 focus:border-accent focus:outline-none"
      />
    </FieldWrapper>
  );
}
