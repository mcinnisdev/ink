import FieldWrapper from "./FieldWrapper";

interface Props {
  label: string;
  value: boolean;
  required?: boolean;
  onChange: (value: boolean) => void;
}

export default function BooleanField({
  label,
  value,
  onChange,
}: Props) {
  return (
    <FieldWrapper label={label}>
      <button
        className={`relative w-8 h-4 rounded-full transition-colors ${
          value ? "bg-accent" : "bg-ink-600"
        }`}
        onClick={() => onChange(!value)}
      >
        <span
          className={`absolute top-0.5 w-3 h-3 rounded-full bg-ink-50 transition-transform ${
            value ? "left-4" : "left-0.5"
          }`}
        />
      </button>
    </FieldWrapper>
  );
}
