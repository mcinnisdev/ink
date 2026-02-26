import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import {
  TextField,
  TextareaField,
  NumberField,
  BooleanField,
  DateField,
  MediaField,
  ReferenceField,
} from "./fields";

interface FieldSchema {
  key: string;
  type: "string" | "text" | "number" | "boolean" | "date" | "reference";
  required?: boolean;
  label?: string;
  default?: unknown;
  collection?: string;
}

interface Props {
  frontmatter: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  schema?: FieldSchema[] | null;
}

function toLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Keys that are managed by directory defaults / layout and shouldn't be shown. */
const HIDDEN_KEYS = new Set(["layout", "tags", "og_type"]);

/** Determine if a key likely represents a path/URL value that should start with /. */
function looksLikePath(key: string): boolean {
  const k = key.toLowerCase();
  return (
    k === "permalink" ||
    k.includes("url") ||
    k.includes("href") ||
    k.includes("path") ||
    k.includes("slug")
  );
}

/** Return a warning string if a path-like field value is missing a leading /. */
function pathWarning(key: string, value: unknown): string | undefined {
  if (typeof value !== "string" || !value || !looksLikePath(key)) return undefined;
  if (!value.startsWith("/")) return "Path should start with / (e.g. /blog/my-post/)";
  return undefined;
}

/** Determine if a key likely represents a media/image path. */
function looksLikeMedia(key: string, value: unknown): boolean {
  if (typeof value !== "string") return false;
  const k = key.toLowerCase();
  return (
    k.includes("image") ||
    k.includes("photo") ||
    k.includes("logo") ||
    k.includes("avatar") ||
    k.includes("thumbnail") ||
    (typeof value === "string" && value.startsWith("/media/"))
  );
}

function SchemaField({
  field,
  value,
  onChange,
}: {
  field: FieldSchema;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const label = field.label || toLabel(field.key);

  switch (field.type) {
    case "boolean":
      return (
        <BooleanField
          label={label}
          value={Boolean(value ?? field.default ?? false)}
          onChange={onChange}
        />
      );
    case "number":
      return (
        <NumberField
          label={label}
          value={typeof value === "number" ? value : (value as string) ?? ""}
          required={field.required}
          onChange={onChange}
        />
      );
    case "date":
      return (
        <DateField
          label={label}
          value={String(value ?? "")}
          required={field.required}
          onChange={onChange}
        />
      );
    case "text":
      return (
        <TextareaField
          label={label}
          value={String(value ?? "")}
          required={field.required}
          onChange={onChange}
        />
      );
    case "reference":
      return (
        <ReferenceField
          label={label}
          value={String(value ?? "")}
          collection={field.collection ?? ""}
          required={field.required}
          onChange={onChange}
        />
      );
    case "string":
    default:
      // Detect media fields by key name or value pattern
      if (looksLikeMedia(field.key, value)) {
        return (
          <MediaField
            label={label}
            value={String(value ?? "")}
            required={field.required}
            onChange={onChange}
          />
        );
      }
      return (
        <TextField
          label={label}
          value={String(value ?? "")}
          required={field.required}
          warning={pathWarning(field.key, value)}
          onChange={onChange}
        />
      );
  }
}

/** Generic (non-schema) field — fallback for unknown content types. */
function GenericField({
  fieldKey,
  value,
  onChange,
}: {
  fieldKey: string;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const isLong = typeof value === "string" && value.length > 80;
  const isBool = typeof value === "boolean";
  const isNumber = typeof value === "number";

  if (isBool) {
    return (
      <BooleanField
        label={toLabel(fieldKey)}
        value={value}
        onChange={onChange}
      />
    );
  }
  if (isNumber) {
    return (
      <NumberField
        label={toLabel(fieldKey)}
        value={value}
        onChange={onChange}
      />
    );
  }
  if (looksLikeMedia(fieldKey, value)) {
    return (
      <MediaField
        label={toLabel(fieldKey)}
        value={String(value ?? "")}
        onChange={onChange}
      />
    );
  }
  if (isLong) {
    return (
      <TextareaField
        label={toLabel(fieldKey)}
        value={String(value ?? "")}
        onChange={onChange}
      />
    );
  }
  return (
    <TextField
      label={toLabel(fieldKey)}
      value={String(value ?? "")}
      warning={pathWarning(fieldKey, value)}
      onChange={onChange}
    />
  );
}

export default function FrontmatterForm({
  frontmatter,
  onChange,
  schema,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const entries = Object.entries(frontmatter);

  if (entries.length === 0 && (!schema || schema.length === 0)) return null;

  // Collect keys already rendered by schema to avoid duplicates
  const schemaKeys = new Set(schema?.map((f) => f.key) ?? []);

  // Extra keys in frontmatter that aren't in the schema and aren't hidden
  const extraKeys = entries
    .map(([key]) => key)
    .filter((key) => !schemaKeys.has(key) && !HIDDEN_KEYS.has(key));

  // Total visible field count
  const fieldCount = schema
    ? schema.filter((f) => !HIDDEN_KEYS.has(f.key)).length + extraKeys.length
    : entries.filter(([key]) => !HIDDEN_KEYS.has(key)).length;

  return (
    <div className="border-b border-ink-700 flex-shrink-0">
      <button
        className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-ink-400 uppercase tracking-wider hover:bg-ink-800/50 transition-colors"
        onClick={() => setCollapsed(!collapsed)}
      >
        <span className="text-ink-500">
          {collapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </span>
        Frontmatter
        <span className="text-ink-600 font-normal normal-case">
          ({fieldCount} fields)
        </span>
      </button>
      {!collapsed && (
        <div className="px-4 pb-3 grid grid-cols-2 gap-x-4 gap-y-2 max-h-[300px] overflow-y-auto">
          {schema
            ? // ─── Schema-driven rendering ───
              <>
                {schema
                  .filter((f) => !HIDDEN_KEYS.has(f.key))
                  .map((field) => (
                    <SchemaField
                      key={field.key}
                      field={field}
                      value={frontmatter[field.key] ?? field.default}
                      onChange={(v) => onChange(field.key, v)}
                    />
                  ))}
                {extraKeys.length > 0 && (
                  <>
                    <div className="col-span-2 border-t border-ink-700 mt-1 pt-1">
                      <span className="text-[9px] text-ink-600 uppercase tracking-wider">
                        Additional Fields
                      </span>
                    </div>
                    {extraKeys.map((key) => (
                      <GenericField
                        key={key}
                        fieldKey={key}
                        value={frontmatter[key]}
                        onChange={(v) => onChange(key, v)}
                      />
                    ))}
                  </>
                )}
              </>
            : // ─── Generic fallback rendering ───
              entries
                .filter(([key]) => !HIDDEN_KEYS.has(key))
                .map(([key, value]) => (
                  <GenericField
                    key={key}
                    fieldKey={key}
                    value={value}
                    onChange={(v) => onChange(key, v)}
                  />
                ))}
        </div>
      )}
    </div>
  );
}
