import { useRef, useEffect } from "react";
import { EditorState } from "@codemirror/state";
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
  drawSelection,
} from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import {
  syntaxHighlighting,
  defaultHighlightStyle,
} from "@codemirror/language";

// Custom ink dark theme
const inkTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "#0f172a",
      color: "#e2e8f0",
      fontSize: "14px",
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
    },
    ".cm-gutters": {
      backgroundColor: "#0f172a",
      color: "#475569",
      borderRight: "1px solid #1e293b",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "#1e293b",
      color: "#94a3b8",
    },
    ".cm-activeLine": {
      backgroundColor: "rgba(30, 41, 59, 0.5)",
    },
    ".cm-cursor": {
      borderLeftColor: "#3b82f6",
      borderLeftWidth: "2px",
    },
    ".cm-selectionBackground": {
      backgroundColor: "rgba(59, 130, 246, 0.25) !important",
    },
    "&.cm-focused .cm-selectionBackground": {
      backgroundColor: "rgba(59, 130, 246, 0.25) !important",
    },
    ".cm-line": {
      padding: "0 4px",
    },
  },
  { dark: true }
);

// Ink-flavored syntax highlighting
const inkHighlight = syntaxHighlighting(defaultHighlightStyle);

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function MarkdownEditor({ value, onChange }: Props) {
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
        keymap.of([...defaultKeymap, ...historyKeymap]),
        markdown({ base: markdownLanguage, codeLanguages: languages }),
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

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-hidden cm-container"
    />
  );
}
