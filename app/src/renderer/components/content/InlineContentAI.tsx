import { useState, useEffect, useRef, useCallback } from "react";
import {
  Sparkles,
  Send,
  Square,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronUp,
  Search,
  PenTool,
  FileText,
  Expand,
} from "lucide-react";
import { useEditorStore } from "../../stores/editor";
import { useProjectStore } from "../../stores/project";
import { useAIStore, type ChatMessage, type ProjectContext } from "../../stores/ai";
import { renderMarkdown } from "../../utils/markdown";

interface LocalMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  timestamp: number;
}

const QUICK_ACTIONS = [
  { label: "Improve SEO", icon: Search, prompt: "Analyze the SEO of this content and suggest specific improvements to the title, meta description, headings, and keyword usage." },
  { label: "Rewrite", icon: PenTool, prompt: "Rewrite this content to be more engaging and readable while preserving the key information." },
  { label: "Meta description", icon: FileText, prompt: "Write an optimized 150-160 character meta description for this content." },
  { label: "Expand content", icon: Expand, prompt: "Expand this content with more detail, supporting information, and examples where appropriate." },
];

export default function InlineContentAI() {
  const projectPath = useProjectStore((s) => s.current?.path);
  const siteName = useProjectStore((s) => s.current?.siteName || "");
  const siteUrl = useProjectStore((s) => s.current?.siteUrl || "");
  const activeTabPath = useEditorStore((s) => s.activeTabPath);
  const activeTab = useEditorStore((s) =>
    s.tabs.find((t) => t.filePath === s.activeTabPath)
  );

  const config = useAIStore((s) => s.config);
  const configLoaded = useAIStore((s) => s.configLoaded);
  const loadConfig = useAIStore((s) => s.loadConfig);

  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentAssistantId, setCurrentAssistantId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load config on mount
  useEffect(() => {
    if (!configLoaded) loadConfig();
  }, [configLoaded, loadConfig]);

  // Clear messages when switching files
  useEffect(() => {
    setMessages([]);
    setInput("");
    setIsStreaming(false);
    setCurrentAssistantId(null);
  }, [activeTabPath]);

  // Subscribe to content stream events
  useEffect(() => {
    const unsub = window.ink.ai.onStream((event) => {
      if (event.agentType !== "content") return;

      switch (event.type) {
        case "chunk":
          if (event.content) {
            setMessages((prev) =>
              prev.map((m) =>
                m.streaming && m.role === "assistant"
                  ? { ...m, content: m.content + event.content }
                  : m
              )
            );
          }
          break;
        case "done":
          setMessages((prev) =>
            prev.map((m) =>
              m.streaming ? { ...m, streaming: false } : m
            )
          );
          setIsStreaming(false);
          setCurrentAssistantId(null);
          break;
        case "error":
          setMessages((prev) =>
            prev.map((m) =>
              m.streaming && m.role === "assistant"
                ? { ...m, content: `Error: ${event.error || "Unknown error"}`, streaming: false }
                : m
            )
          );
          setIsStreaming(false);
          setCurrentAssistantId(null);
          break;
      }
    });
    return unsub;
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 80)}px`;
    }
  }, [input]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming || !projectPath) return;

    setInput("");

    const assistantId = crypto.randomUUID();
    setCurrentAssistantId(assistantId);

    const userMessage: LocalMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    const assistantMessage: LocalMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
      streaming: true,
    };

    const updatedMessages = [...messages, userMessage, assistantMessage];
    setMessages(updatedMessages);
    setIsStreaming(true);

    const context: ProjectContext = {
      projectPath,
      siteName,
      siteUrl,
      currentFilePath: activeTabPath || undefined,
      currentFile: activeTab?.content.raw || undefined,
      agentType: "content",
    };

    try {
      // Send all messages except the empty streaming one
      const historyMessages = updatedMessages
        .filter((m) => m.id !== assistantId)
        .map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
        }));
      await window.ink.ai.sendMessage(historyMessages, context);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: `Error: ${msg}`, streaming: false }
            : m
        )
      );
      setIsStreaming(false);
      setCurrentAssistantId(null);
    }
  }, [input, isStreaming, projectPath, siteName, siteUrl, activeTabPath, activeTab, messages]);

  const handleStop = useCallback(async () => {
    await window.ink.ai.stopGeneration("content");
    if (currentAssistantId) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === currentAssistantId ? { ...m, streaming: false } : m
        )
      );
    }
    setIsStreaming(false);
    setCurrentAssistantId(null);
  }, [currentAssistantId]);

  const handleClear = () => {
    setMessages([]);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    setExpanded(true);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  // Don't render if no file open or AI not configured
  if (!activeTabPath || !configLoaded || !config?.apiKey) return null;

  // Collapsed bar
  if (!expanded) {
    return (
      <div className="border-t border-ink-700">
        <button
          onClick={() => setExpanded(true)}
          className="w-full flex items-center gap-2 px-4 py-2 text-xs text-ink-400 hover:text-ink-300 hover:bg-ink-800/50 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-medium">Content AI</span>
          <ChevronUp className="w-3 h-3 ml-auto" />
        </button>
      </div>
    );
  }

  // Expanded drawer
  return (
    <div className="border-t border-ink-700 flex flex-col" style={{ height: 280 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-ink-700/50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-medium text-ink-300">Content AI</span>
          {activeTab && (
            <span className="text-[10px] px-1.5 py-0.5 bg-ink-800 rounded text-ink-500 truncate max-w-[150px]">
              {activeTab.filePath.split(/[/\\]/).pop()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {isStreaming && (
            <button
              onClick={handleStop}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
            >
              <Square className="w-2.5 h-2.5" />
              Stop
            </button>
          )}
          {messages.length > 0 && !isStreaming && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] text-ink-500 hover:text-ink-400 hover:bg-ink-800 transition-colors"
            >
              <Trash2 className="w-2.5 h-2.5" />
            </button>
          )}
          <button
            onClick={() => setExpanded(false)}
            className="p-0.5 text-ink-500 hover:text-ink-400 transition-colors"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 min-h-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-[11px] text-ink-500 mb-2">
              Ask about this file's content, SEO, or writing
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleQuickAction(action.prompt)}
                  className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium text-ink-400 bg-ink-800/50 border border-ink-700/50 hover:text-ink-300 hover:border-ink-600 transition-colors"
                >
                  <action.icon className="w-2.5 h-2.5" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((msg) => (
              <div key={msg.id}>
                {msg.role === "user" ? (
                  <div className="flex justify-end">
                    <div className="max-w-[85%] bg-accent/20 border border-accent/30 rounded px-2.5 py-1.5 text-xs text-ink-50 whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-start">
                    <div className="max-w-[90%]">
                      {msg.content && (
                        <div
                          className="text-xs text-ink-200 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                        />
                      )}
                      {msg.streaming && !msg.content && (
                        <div className="flex items-center gap-1.5 text-ink-400 text-xs">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Thinking...
                        </div>
                      )}
                      {msg.streaming && msg.content && (
                        <span className="inline-block w-1 h-3 bg-accent animate-pulse ml-0.5 align-text-bottom" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-2 border-t border-ink-700/50 flex-shrink-0">
        <div className="flex items-end gap-1.5">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isStreaming ? "Waiting..." : "Ask about this content..."}
            disabled={isStreaming}
            rows={1}
            className="flex-1 bg-ink-900 border border-ink-600 rounded px-3 py-1.5 text-xs text-ink-50 placeholder:text-ink-500 focus:border-accent focus:outline-none resize-none disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className={`flex items-center justify-center w-7 h-7 rounded transition-colors flex-shrink-0 ${
              input.trim() && !isStreaming
                ? "bg-accent hover:bg-accent-hover text-white"
                : "bg-ink-800 text-ink-500 cursor-not-allowed"
            }`}
          >
            <Send className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
