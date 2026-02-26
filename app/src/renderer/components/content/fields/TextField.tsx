import FieldWrapper from "./FieldWrapper";

interface Props {
  label: string;
  value: string;
  required?: boolean;
  onChange: (value: string) => void;
}

export default function TextField({
  label,
  value,
  required,
  onChange,
}: Props) {
  return (
    <FieldWrapper label={label} required={required}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-ink-900 border border-ink-600 rounded px-2 py-1 text-xs text-ink-50 focus:border-accent focus:outline-none"
      />
    </FieldWrapper>
  );
}
