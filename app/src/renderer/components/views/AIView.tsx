import { useState, useEffect, useRef, useCallback } from "react";
import {
  Sparkles,
  Send,
  Square,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronRight,
  FileText,
  Settings,
  PenTool,
  Palette,
  Code2,
  Wrench,
  AlertTriangle,
} from "lucide-react";
import { useAIStore, type ChatMessage, type ProjectContext } from "../../stores/ai";
import { useProjectStore } from "../../stores/project";
import { useEditorStore } from "../../stores/editor";
import { useUIStore } from "../../stores/ui";
import { renderMarkdown } from "../../utils/markdown";

// --- Tool Call Indicator ---

function ToolCallIndicator({
  toolCall,
  toolResult,
}: {
  toolCall: { id: string; name: string; arguments: Record<string, unknown> };
  toolResult?: { toolCallId: string; content: string; isError: boolean };
}) {
  const [expanded, setExpanded] = useState(false);

  const toolLabels: Record<string, string> = {
    read_file: "Reading file",
    write_file: "Writing file",
    list_files: "Listing project files",
    read_site_config: "Reading site config",
    update_site_config: "Updating site config",
    create_page: "Creating page",
    update_frontmatter: "Updating frontmatter",
  };

  const label = toolLabels[toolCall.name] || toolCall.name;
  const detail =
    (toolCall.arguments.file_path as string) ||
    (toolCall.arguments.slug as string) ||
    "";

  return (
    <div className="my-1.5 text-xs">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-ink-400 hover:text-ink-300 transition-colors"
      >
        {expanded ? (
          <ChevronDown className="w-3 h-3" />
        ) : (
          <ChevronRight className="w-3 h-3" />
        )}
        <FileText className="w-3 h-3" />
        <span>
          {label}
          {detail ? `: ${detail}` : ""}
        </span>
        {toolResult && (
          <span
            className={`ml-1 ${toolResult.isError ? "text-red-400" : "text-emerald-400"}`}
          >
            {toolResult.isError ? "(error)" : "(done)"}
          </span>
        )}
        {!toolResult && (
          <Loader2 className="w-3 h-3 animate-spin text-amber-400 ml-1" />
        )}
      </button>
      {expanded && toolResult && (
        <pre className="mt-1 ml-5 p-2 bg-ink-950 rounded text-[11px] text-ink-400 overflow-x-auto max-h-40 overflow-y-auto">
          {toolResult.content.substring(0, 2000)}
          {toolResult.content.length > 2000 ? "\n..." : ""}
        </pre>
      )}
    </div>
  );
}

// --- Message Bubble ---

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-accent/20 border border-accent/30 rounded-lg px-3 py-2 text-sm text-ink-50 whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    );
  }

  const toolCalls = message.toolCalls || [];
  const toolResults = message.toolResults || [];

  return (
    <div className="flex justify-start">
      <div className="max-w-[90%]">
        {toolCalls.map((tc) => (
          <ToolCallIndicator
            key={tc.id}
            toolCall={tc}
            toolResult={toolResults.find((r) => r.toolCallId === tc.id)}
          />
        ))}

        {message.content && (
          <div
            className="text-sm text-ink-200 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
          />
        )}

        {message.streaming && (
          <div className="flex items-center gap-2 text-accent text-xs mt-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            {!message.content && toolCalls.length === 0
              ? "Thinking..."
              : toolCalls.length > toolResults.length
                ? "Running tools..."
                : "Writing..."}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Quick Actions ---

const QUICK_ACTIONS = [
  { label: "Create a page", icon: PenTool, prompt: "Create a new page for " },
  { label: "Edit templates", icon: Code2, prompt: "List the templates in this project and suggest improvements to the layout and structure." },
  { label: "Update styles", icon: Palette, prompt: "Review the CSS/Tailwind styles and suggest visual improvements for the site's design." },
  { label: "Site config", icon: Wrench, prompt: "Review the current site configuration and suggest optimizations for SEO and metadata." },
];

// --- Setup Prompt ---

function SetupPrompt() {
  const setView = useUIStore((s) => s.setView);

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-amber-400" />
        </div>
        <h3 className="text-sm font-semibold text-ink-50 mb-2">
          API Key Required
        </h3>
        <p className="text-xs text-ink-400 mb-4">
          To use the AI assistant, add your Anthropic or OpenAI API key in
          Settings.
        </p>
        <button
          onClick={() => setView("settings")}
          className="flex items-center gap-1.5 mx-auto px-3 py-1.5 rounded-lg text-xs font-medium bg-accent hover:bg-accent-hover text-white transition-colors"
        >
          <Settings className="w-3.5 h-3.5" />
          Open Settings
        </button>
      </div>
    </div>
  );
}

// --- Main AIView ---

export default function AIView() {
  const projectPath = useProjectStore((s) => s.current?.path);
  const siteName = useProjectStore((s) => s.current?.siteName || "");
  const siteUrl = useProjectStore((s) => s.current?.siteUrl || "");
  const activeTabPath = useEditorStore((s) => s.activeTabPath);
  const activeTab = useEditorStore((s) =>
    s.tabs.find((t) => t.filePath === s.activeTabPath)
  );

  const messages = useAIStore((s) => s.messages);
  const isStreaming = useAIStore((s) => s.isStreaming);
  const config = useAIStore((s) => s.config);
  const configLoaded = useAIStore((s) => s.configLoaded);
  const loadConfig = useAIStore((s) => s.loadConfig);
  const sendMessage = useAIStore((s) => s.sendMessage);
  const stopGeneration = useAIStore((s) => s.stopGeneration);
  const clearMessages = useAIStore((s) => s.clearMessages);
  const appendChunk = useAIStore((s) => s.appendChunk);
  const addToolCall = useAIStore((s) => s.addToolCall);
  const addToolResult = useAIStore((s) => s.addToolResult);
  const finishMessage = useAIStore((s) => s.finishMessage);
  const setError = useAIStore((s) => s.setError);

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load config on mount
  useEffect(() => {
    if (!configLoaded) loadConfig();
  }, [configLoaded, loadConfig]);

  // Subscribe to stream events — only process site agent events
  useEffect(() => {
    const unsub = window.ink.ai.onStream((event) => {
      if (event.agentType === "content") return;

      switch (event.type) {
        case "chunk":
          if (event.content) appendChunk(event.messageId, event.content);
          break;
        case "tool_call":
          if (event.toolCall) addToolCall(event.messageId, event.toolCall);
          break;
        case "tool_result":
          if (event.toolResult) addToolResult(event.messageId, event.toolResult);
          break;
        case "done":
          finishMessage(event.messageId);
          break;
        case "error":
          setError(event.messageId, event.error || "Unknown error");
          break;
      }
    });
    return unsub;
  }, [appendChunk, addToolCall, addToolResult, finishMessage, setError]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming || !projectPath) return;

    setInput("");

    const context: ProjectContext = {
      projectPath,
      siteName,
      siteUrl,
      currentFilePath: activeTabPath || undefined,
      currentFile: activeTab?.content.raw || undefined,
      agentType: "site",
    };

    await sendMessage(text, context);
  }, [input, isStreaming, projectPath, siteName, siteUrl, activeTabPath, activeTab, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    textareaRef.current?.focus();
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  // Not configured
  if (configLoaded && (!config || !config.apiKey)) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-6 py-4 border-b border-ink-700">
          <h2 className="text-lg font-semibold text-ink-50 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Site AI
          </h2>
        </div>
        <SetupPrompt />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-ink-700">
        <div>
          <h2 className="text-lg font-semibold text-ink-50 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Site AI
          </h2>
          <p className="text-xs text-ink-500 mt-0.5">
            Templates, styles, and site configuration
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isStreaming && (
            <button
              onClick={stopGeneration}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
            >
              <Square className="w-3 h-3" />
              Stop
            </button>
          )}
          {messages.length > 0 && !isStreaming && (
            <button
              onClick={clearMessages}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-ink-400 hover:text-ink-300 hover:bg-ink-800 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-amber-400" />
            </div>
            <p className="text-sm font-medium text-ink-300 mb-1">
              How can I help with your site?
            </p>
            <p className="text-xs text-ink-500 max-w-xs">
              I can create pages, edit templates, update styles, and manage your
              site configuration.
            </p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {messages.length === 0 && (
        <div className="px-6 pb-2">
          <div className="max-w-2xl mx-auto flex flex-wrap gap-2">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => handleQuickAction(action.prompt)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-ink-400 bg-ink-800/50 border border-ink-700/50 hover:text-ink-300 hover:border-ink-600 transition-colors"
              >
                <action.icon className="w-3 h-3" />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-6 pb-6 pt-2">
        <div className="max-w-2xl mx-auto flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isStreaming ? "Waiting for response..." : "Ask about templates, styles, or site config..."}
            disabled={isStreaming}
            rows={1}
            className="flex-1 bg-ink-900 border border-ink-600 rounded-lg px-4 py-3 text-sm text-ink-50 placeholder:text-ink-500 focus:border-accent focus:outline-none resize-none disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors flex-shrink-0 ${
              input.trim() && !isStreaming
                ? "bg-accent hover:bg-accent-hover text-white"
                : "bg-ink-800 text-ink-500 cursor-not-allowed"
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="max-w-2xl mx-auto text-[10px] text-ink-600 mt-1.5 text-center">
          {config?.provider === "anthropic" ? "Claude" : "GPT"} ·{" "}
          {config?.model || "no model"} · Enter to send, Shift+Enter for newline
        </p>
      </div>
    </div>
  );
}
