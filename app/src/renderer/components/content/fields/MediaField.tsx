import { Image } from "lucide-react";
import FieldWrapper from "./FieldWrapper";

interface Props {
  label: string;
  value: string;
  required?: boolean;
  onChange: (value: string) => void;
}

export default function MediaField({
  label,
  value,
  required,
  onChange,
}: Props) {
  const handleBrowse = async () => {
    const filePath = await window.ink.dialog.pickImage();
    if (filePath) {
      // Convert absolute path to a relative /media/ path if possible
      const mediaMatch = filePath.replace(/\\/g, "/").match(/\/media\/.+$/);
      onChange(mediaMatch ? mediaMatch[0] : filePath);
    }
  };

  return (
    <FieldWrapper label={label} required={required}>
      <div className="flex gap-1">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/media/..."
          className="flex-1 bg-ink-900 border border-ink-600 rounded px-2 py-1 text-xs text-ink-50 focus:border-accent focus:outline-none"
        />
        <button
          onClick={handleBrowse}
          className="px-2 py-1 bg-ink-700 hover:bg-ink-600 border border-ink-600 rounded text-ink-300 transition-colors"
          title="Browse for image"
        >
          <Image className="w-3 h-3" />
        </button>
      </div>
    </FieldWrapper>
  );
}
