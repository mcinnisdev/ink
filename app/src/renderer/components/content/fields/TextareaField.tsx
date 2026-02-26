import FieldWrapper from "./FieldWrapper";

interface Props {
  label: string;
  value: string;
  required?: boolean;
  onChange: (value: string) => void;
}

export default function TextareaField({
  label,
  value,
  required,
  onChange,
}: Props) {
  return (
    <FieldWrapper label={label} required={required} fullWidth>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="w-full bg-ink-900 border border-ink-600 rounded px-2 py-1 text-xs text-ink-50 focus:border-accent focus:outline-none resize-none"
      />
    </FieldWrapper>
  );
}
