import { useEffect, useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TurndownService from "turndown";
import { marked } from "marked";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  ImageIcon,
  Link as LinkIcon,
  Unlink,
  Undo,
  Redo,
  Check,
  X,
} from "lucide-react";

// Configure Turndown for HTML → Markdown
const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
  emDelimiter: "*",
  strongDelimiter: "**",
});

// Configure marked for Markdown → HTML
marked.setOptions({
  breaks: true,
  gfm: true,
});

/** Restore brackets that turndown escaped inside Nunjucks expressions */
function unescapeNunjucksBrackets(md: string): string {
  // Fix inside {{ ... }} expressions
  md = md.replace(/\{\{([\s\S]*?)\}\}/g, (match) =>
    match.replace(/\\\[/g, "[").replace(/\\\]/g, "]")
  );
  // Fix inside {% ... %} tags
  md = md.replace(/\{%([\s\S]*?)%\}/g, (match) =>
    match.replace(/\\\[/g, "[").replace(/\\\]/g, "]")
  );
  return md;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onMouseDown={(e) => {
        // Prevent stealing focus from editor so toggle commands work
        e.preventDefault();
        onClick();
      }}
      title={title}
      disabled={disabled}
      className={`p-1.5 rounded transition-colors ${
        active
          ? "bg-accent text-white"
          : disabled
            ? "text-ink-600 cursor-not-allowed"
            : "text-ink-400 hover:text-ink-200 hover:bg-ink-700"
      }`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-5 bg-ink-700 mx-1" />;
}

/** Inline input for URL entry (replaces window.prompt which is blocked in sandbox) */
function InlineUrlInput({
  placeholder,
  onSubmit,
  onCancel,
}: {
  placeholder: string;
  onSubmit: (url: string) => void;
  onCancel: () => void;
}) {
  const [url, setUrl] = useState("");
  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-ink-900 border border-ink-600 rounded">
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder={placeholder}
        autoFocus
        className="bg-transparent text-xs text-ink-100 placeholder-ink-500 outline-none w-48"
        onKeyDown={(e) => {
          if (e.key === "Enter" && url.trim()) onSubmit(url.trim());
          if (e.key === "Escape") onCancel();
        }}
      />
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          if (url.trim()) onSubmit(url.trim());
        }}
        className="text-green-400 hover:text-green-300 p-0.5"
        title="Confirm"
      >
        <Check className="w-3.5 h-3.5" />
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          onCancel();
        }}
        className="text-ink-500 hover:text-ink-300 p-0.5"
        title="Cancel"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function TipTapEditor({ value, onChange }: Props) {
  // Convert initial markdown to HTML
  const initialHtml = marked.parse(value || "") as string;

  // Track which inline input is open
  const [inputMode, setInputMode] = useState<"none" | "image" | "link">(
    "none"
  );

  // Force re-render counter for toolbar active states
  const [, setTick] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: { HTMLAttributes: { class: "tiptap-code-block" } },
      }),
      Image.configure({
        HTMLAttributes: { class: "tiptap-image" },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "tiptap-link" },
      }),
      Placeholder.configure({
        placeholder: "Start writing...",
      }),
    ],
    content: initialHtml,
    editorProps: {
      attributes: {
        class: "tiptap-editor-content",
      },
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      const md = unescapeNunjucksBrackets(turndown.turndown(html));
      onChange(md);
      setTick((t) => t + 1);
    },
    onSelectionUpdate: () => {
      // Re-render toolbar to reflect active marks/nodes at cursor
      setTick((t) => t + 1);
    },
    onTransaction: () => {
      setTick((t) => t + 1);
    },
  });

  // Sync external value changes (e.g., file reload from disk)
  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    const currentMd = turndown.turndown(currentHtml);
    // Only update if the markdown content actually differs
    if (currentMd !== value) {
      const newHtml = marked.parse(value || "") as string;
      editor.commands.setContent(newHtml, false);
    }
  }, [value, editor]);

  // Listen for insert-text events from Gallery
  useEffect(() => {
    const handler = (e: Event) => {
      if (!editor) return;
      const text = (e as CustomEvent<string>).detail;
      if (!text) return;
      editor.commands.insertContent(text);
      editor.commands.focus();
    };
    window.addEventListener("ink:insertText", handler);
    return () => window.removeEventListener("ink:insertText", handler);
  }, [editor]);

  const handleImageSubmit = useCallback(
    (url: string) => {
      if (!editor) return;
      editor.chain().focus().setImage({ src: url }).run();
      setInputMode("none");
    },
    [editor]
  );

  const handleLinkSubmit = useCallback(
    (url: string) => {
      if (!editor) return;
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
      setInputMode("none");
    },
    [editor]
  );

  const handleUnlink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
    setInputMode("none");
  }, [editor]);

  if (!editor) return null;

  const iconSize = "w-4 h-4";
  const isLink = editor.isActive("link");

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-3 py-1.5 border-b border-ink-700 bg-ink-800/50 flex-shrink-0 flex-wrap">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold (Ctrl+B)"
        >
          <Bold className={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic (Ctrl+I)"
        >
          <Italic className={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Strikethrough"
        >
          <Strikethrough className={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          title="Inline Code"
        >
          <Code className={iconSize} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className={iconSize} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List className={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Ordered List"
        >
          <ListOrdered className={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Blockquote"
        >
          <Quote className={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          <Minus className={iconSize} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() =>
            setInputMode(inputMode === "image" ? "none" : "image")
          }
          active={inputMode === "image"}
          title="Insert Image"
        >
          <ImageIcon className={iconSize} />
        </ToolbarButton>
        {isLink ? (
          <ToolbarButton
            onClick={handleUnlink}
            active
            title="Remove Link"
          >
            <Unlink className={iconSize} />
          </ToolbarButton>
        ) : (
          <ToolbarButton
            onClick={() =>
              setInputMode(inputMode === "link" ? "none" : "link")
            }
            active={inputMode === "link"}
            title="Insert Link"
          >
            <LinkIcon className={iconSize} />
          </ToolbarButton>
        )}

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo className={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          <Redo className={iconSize} />
        </ToolbarButton>
      </div>

      {/* Inline URL input */}
      {inputMode === "image" && (
        <div className="px-3 py-1.5 border-b border-ink-700 bg-ink-800/30">
          <InlineUrlInput
            placeholder="/media/photo.jpg"
            onSubmit={handleImageSubmit}
            onCancel={() => setInputMode("none")}
          />
        </div>
      )}
      {inputMode === "link" && (
        <div className="px-3 py-1.5 border-b border-ink-700 bg-ink-800/30">
          <InlineUrlInput
            placeholder="https://example.com"
            onSubmit={handleLinkSubmit}
            onCancel={() => setInputMode("none")}
          />
        </div>
      )}

      {/* Editor content */}
      <div className="flex-1 overflow-y-auto tiptap-container">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
}
