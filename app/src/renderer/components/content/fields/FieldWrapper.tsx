interface Props {
  label: string;
  required?: boolean;
  fullWidth?: boolean;
  warning?: string;
  children: React.ReactNode;
}

export default function FieldWrapper({
  label,
  required,
  fullWidth,
  warning,
  children,
}: Props) {
  return (
    <div className={fullWidth ? "col-span-2" : "col-span-1"}>
      <label className="block text-[10px] font-medium text-ink-500 mb-1">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {warning && (
        <p className="mt-0.5 text-[10px] text-yellow-500">{warning}</p>
      )}
    </div>
  );
}
