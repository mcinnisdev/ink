import FieldWrapper from "./FieldWrapper";

interface Props {
  label: string;
  value: string;
  required?: boolean;
  warning?: string;
  onChange: (value: string) => void;
}

export default function TextField({
  label,
  value,
  required,
  warning,
  onChange,
}: Props) {
  return (
    <FieldWrapper label={label} required={required} warning={warning}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-ink-900 border border-ink-600 rounded px-2 py-1 text-xs text-ink-50 focus:border-accent focus:outline-none"
      />
    </FieldWrapper>
  );
}
