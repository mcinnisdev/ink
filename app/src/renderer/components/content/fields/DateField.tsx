import FieldWrapper from "./FieldWrapper";

interface Props {
  label: string;
  value: string;
  required?: boolean;
  onChange: (value: string) => void;
}

export default function DateField({
  label,
  value,
  required,
  onChange,
}: Props) {
  // Normalize value to YYYY-MM-DD for the date input
  const dateValue = typeof value === "string" ? value.slice(0, 10) : "";

  return (
    <FieldWrapper label={label} required={required}>
      <input
        type="date"
        value={dateValue}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-ink-900 border border-ink-600 rounded px-2 py-1 text-xs text-ink-50 focus:border-accent focus:outline-none [color-scheme:dark]"
      />
    </FieldWrapper>
  );
}
