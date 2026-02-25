import { create } from "zustand";

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolResult {
  toolCallId: string;
  content: string;
  isError: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  timestamp: number;
  streaming?: boolean;
}

export interface AIConfig {
  provider: "anthropic" | "openai";
  apiKey: string;
  model: string;
}

export interface ProjectContext {
  projectPath: string;
  siteName: string;
  siteUrl: string;
  currentFilePath?: string;
  currentFile?: string;
  agentType?: "content" | "site";
}

interface AIStore {
  messages: ChatMessage[];
  isStreaming: boolean;
  config: AIConfig | null;
  configLoaded: boolean;

  loadConfig: () => Promise<void>;
  saveConfig: (config: AIConfig) => Promise<void>;
  sendMessage: (content: string, context: ProjectContext) => Promise<void>;
  stopGeneration: () => Promise<void>;
  appendChunk: (messageId: string, chunk: string) => void;
  addToolCall: (messageId: string, toolCall: ToolCall) => void;
  addToolResult: (messageId: string, toolResult: ToolResult) => void;
  finishMessage: (messageId: string) => void;
  setError: (messageId: string, error: string) => void;
  clearMessages: () => void;
}

export const useAIStore = create<AIStore>((set, get) => ({
  messages: [],
  isStreaming: false,
  config: null,
  configLoaded: false,

  loadConfig: async () => {
    const config = await window.ink.ai.getConfig();
    set({ config: config as AIConfig | null, configLoaded: true });
  },

  saveConfig: async (config: AIConfig) => {
    await window.ink.ai.saveConfig(config);
    set({ config });
  },

  sendMessage: async (content: string, context: ProjectContext) => {
    const assistantId = crypto.randomUUID();

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: Date.now(),
    };

    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
      streaming: true,
      toolCalls: [],
      toolResults: [],
    };

    set((s) => ({
      messages: [...s.messages, userMessage, assistantMessage],
      isStreaming: true,
    }));

    try {
      // Send all user/assistant messages (not the empty streaming one)
      const allMessages = get().messages.filter(
        (m) => m.id !== assistantId
      );
      await window.ink.ai.sendMessage(allMessages, context);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      get().setError(assistantId, msg);
    }
  },

  stopGeneration: async () => {
    await window.ink.ai.stopGeneration("site");
    set((s) => ({
      messages: s.messages.map((m) =>
        m.streaming ? { ...m, streaming: false } : m
      ),
      isStreaming: false,
    }));
  },

  appendChunk: (_messageId: string, chunk: string) => {
    set((s) => ({
      messages: s.messages.map((m) =>
        m.streaming && m.role === "assistant"
          ? { ...m, content: m.content + chunk }
          : m
      ),
    }));
  },

  addToolCall: (_messageId: string, toolCall: ToolCall) => {
    set((s) => ({
      messages: s.messages.map((m) =>
        m.streaming && m.role === "assistant"
          ? { ...m, toolCalls: [...(m.toolCalls || []), toolCall] }
          : m
      ),
    }));
  },

  addToolResult: (_messageId: string, toolResult: ToolResult) => {
    set((s) => ({
      messages: s.messages.map((m) =>
        m.streaming && m.role === "assistant"
          ? { ...m, toolResults: [...(m.toolResults || []), toolResult] }
          : m
      ),
    }));
  },

  finishMessage: (_messageId: string) => {
    set((s) => ({
      messages: s.messages.map((m) =>
        m.streaming ? { ...m, streaming: false } : m
      ),
      isStreaming: false,
    }));
  },

  setError: (_messageId: string, error: string) => {
    set((s) => ({
      messages: s.messages.map((m) =>
        m.streaming && m.role === "assistant"
          ? { ...m, content: `Error: ${error}`, streaming: false }
          : m
      ),
      isStreaming: false,
    }));
  },

  clearMessages: () => set({ messages: [] }),
}));
