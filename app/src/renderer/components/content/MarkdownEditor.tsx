import { useRef, useEffect } from "react";
import { EditorState, type Extension } from "@codemirror/state";
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
  drawSelection,
} from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { search, searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { html } from "@codemirror/lang-html";
import { json } from "@codemirror/lang-json";
import { languages } from "@codemirror/language-data";
import { syntaxHighlighting, HighlightStyle } from "@codemirror/language";
import { tags } from "@lezer/highlight";

// Syntax highlight style using CSS variables for theme-aware colors
const inkHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: "var(--cm-keyword)" },
  { tag: [tags.name, tags.deleted, tags.character, tags.macroName], color: "var(--cm-name)" },
  { tag: [tags.propertyName], color: "var(--cm-name)" },
  { tag: [tags.function(tags.variableName), tags.labelName], color: "var(--cm-fn)" },
  { tag: [tags.color, tags.constant(tags.name), tags.standard(tags.name)], color: "var(--cm-const)" },
  { tag: [tags.definition(tags.name), tags.separator], color: "var(--cm-def)" },
  { tag: [tags.typeName, tags.className, tags.number, tags.changed, tags.annotation, tags.modifier, tags.self, tags.namespace], color: "var(--cm-type)" },
  { tag: [tags.operator, tags.operatorKeyword, tags.url, tags.escape, tags.regexp, tags.link, tags.special(tags.string)], color: "var(--cm-op)" },
  { tag: [tags.meta, tags.comment], color: "var(--cm-comment)", fontStyle: "italic" },
  { tag: tags.strong, fontWeight: "bold", color: "var(--cm-strong)" },
  { tag: tags.emphasis, fontStyle: "italic", color: "var(--cm-em)" },
  { tag: tags.strikethrough, textDecoration: "line-through" },
  { tag: tags.link, color: "var(--cm-link)", textDecoration: "underline" },
  { tag: tags.heading, fontWeight: "bold", color: "var(--cm-heading)" },
  { tag: [tags.atom, tags.bool, tags.special(tags.variableName)], color: "var(--cm-atom)" },
  { tag: [tags.processingInstruction, tags.string, tags.inserted], color: "var(--cm-string)" },
  { tag: tags.invalid, color: "#ffffff", backgroundColor: "#e06c75" },
]);

// Theme-aware editor chrome using CSS variables
const inkTheme = EditorView.theme({
  "&": {
    backgroundColor: "rgb(var(--cm-bg))",
    color: "rgb(var(--cm-text))",
    fontSize: "14px",
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
  },
  ".cm-gutters": {
    backgroundColor: "rgb(var(--cm-gutter-bg))",
    color: "rgb(var(--cm-gutter-text))",
    borderRight: "1px solid var(--cm-gutter-border)",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "var(--cm-active-gutter-bg)",
    color: "rgb(var(--cm-active-gutter-text))",
  },
  ".cm-activeLine": {
    backgroundColor: "var(--cm-active-line)",
  },
  ".cm-cursor": {
    borderLeftColor: "rgb(var(--accent))",
    borderLeftWidth: "2px",
  },
  ".cm-selectionBackground": {
    backgroundColor: "rgba(59, 130, 246, 0.3) !important",
  },
  "&.cm-focused .cm-selectionBackground": {
    backgroundColor: "rgba(59, 130, 246, 0.3) !important",
  },
  ".cm-line": {
    padding: "0 4px",
  },
  ".cm-matchingBracket": {
    backgroundColor: "rgba(59, 130, 246, 0.25)",
    color: "var(--cm-heading)",
  },
  // Search panel styling
  ".cm-panels": {
    backgroundColor: "var(--cm-panel-bg)",
    borderBottom: "1px solid var(--cm-panel-border)",
  },
  ".cm-searchMatch": {
    backgroundColor: "rgba(234, 179, 8, 0.3)",
  },
  ".cm-searchMatch.cm-searchMatch-selected": {
    backgroundColor: "rgba(59, 130, 246, 0.4)",
  },
  ".cm-panel.cm-search": {
    padding: "8px 12px",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "4px 6px",
  },
  ".cm-panel.cm-search br": {
    display: "none",
  },
  ".cm-panel.cm-search input, .cm-panel.cm-search button": {
    fontSize: "12px",
    height: "26px",
  },
  ".cm-panel.cm-search input": {
    backgroundColor: "var(--cm-input-bg)",
    border: "1px solid var(--cm-input-border)",
    color: "var(--cm-input-text)",
    borderRadius: "4px",
    padding: "2px 8px",
    outline: "none",
    minWidth: "120px",
  },
  ".cm-panel.cm-search input:focus": {
    borderColor: "rgb(var(--accent))",
  },
  ".cm-panel.cm-search button": {
    backgroundColor: "var(--cm-btn-bg)",
    color: "var(--cm-btn-text)",
    border: "1px solid var(--cm-btn-border)",
    borderRadius: "4px",
    padding: "2px 10px",
    cursor: "pointer",
  },
  ".cm-panel.cm-search button:hover": {
    backgroundColor: "var(--cm-btn-hover)",
  },
  ".cm-panel.cm-search button[name=close]": {
    backgroundColor: "transparent",
    border: "none",
    color: "var(--cm-label-text)",
    fontSize: "16px",
    padding: "0 6px",
    marginLeft: "auto",
    lineHeight: "1",
  },
  ".cm-panel.cm-search button[name=close]:hover": {
    color: "var(--cm-input-text)",
  },
  ".cm-panel.cm-search label": {
    color: "var(--cm-label-text)",
    fontSize: "11px",
    display: "flex",
    alignItems: "center",
    gap: "3px",
    whiteSpace: "nowrap",
  },
  ".cm-panel.cm-search label input[type=checkbox]": {
    minWidth: "auto",
    height: "auto",
  },
});

const inkHighlight = syntaxHighlighting(inkHighlightStyle);

export type EditorMode = "markdown" | "html" | "json";

function getLanguageExtension(mode: EditorMode): Extension {
  switch (mode) {
    case "html":
      return html();
    case "json":
      return json();
    case "markdown":
    default:
      return markdown({ base: markdownLanguage, codeLanguages: languages });
  }
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  mode?: EditorMode;
}

export default function MarkdownEditor({ value, onChange, mode = "markdown" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Create editor once on mount
  useEffect(() => {
    if (!containerRef.current) return;

    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        drawSelection(),
        history(),
        search({ top: true }),
        highlightSelectionMatches(),
        keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap]),
        getLanguageExtension(mode),
        inkTheme,
        inkHighlight,
        EditorView.lineWrapping,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
      ],
    });

    const view = new EditorView({ state, parent: containerRef.current });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync external value changes (e.g. file reload from disk)
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const currentContent = view.state.doc.toString();
    if (value !== currentContent) {
      view.dispatch({
        changes: { from: 0, to: currentContent.length, insert: value },
      });
    }
  }, [value]);

  // Listen for insert-text events from Gallery
  useEffect(() => {
    const handler = (e: Event) => {
      const view = viewRef.current;
      if (!view) return;
      const text = (e as CustomEvent<string>).detail;
      if (!text) return;
      const cursor = view.state.selection.main.head;
      view.dispatch({
        changes: { from: cursor, to: cursor, insert: text },
        selection: { anchor: cursor + text.length },
      });
      view.focus();
    };
    window.addEventListener("ink:insertText", handler);
    return () => window.removeEventListener("ink:insertText", handler);
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-full overflow-hidden cm-container"
    />
  );
}
