import fs from "fs";
import path from "path";
import { app, BrowserWindow } from "electron";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { readFile, writeFile, listDirectory } from "./file";

// --- Types ---

export interface AIConfig {
  provider: "anthropic" | "openai";
  apiKey: string;
  model: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  timestamp: number;
}

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

export type AgentType = "content" | "site";

export interface AIStreamEvent {
  type: "chunk" | "tool_call" | "tool_result" | "done" | "error";
  content?: string;
  toolCall?: ToolCall;
  toolResult?: ToolResult;
  error?: string;
  messageId: string;
  agentType?: AgentType;
}

export interface ProjectContext {
  projectPath: string;
  siteName: string;
  siteUrl: string;
  currentFilePath?: string;
  currentFile?: string;
  agentType?: AgentType;
}

// --- Config ---

function configPath(): string {
  return path.join(app.getPath("userData"), "ai-config.json");
}

export async function loadAIConfig(): Promise<AIConfig | null> {
  try {
    const raw = await fs.promises.readFile(configPath(), "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function saveAIConfig(config: AIConfig): Promise<void> {
  await fs.promises.writeFile(configPath(), JSON.stringify(config, null, 2), "utf-8");
}

// --- Path Security ---

function validatePath(filePath: string, projectPath: string): string {
  const resolved = path.resolve(projectPath, filePath);
  if (!resolved.startsWith(path.resolve(projectPath))) {
    throw new Error("Path traversal detected");
  }
  return resolved;
}

// --- Tool Execution ---

async function executeTool(
  toolCall: ToolCall,
  projectPath: string
): Promise<ToolResult> {
  try {
    const args = toolCall.arguments;
    let content: string;

    switch (toolCall.name) {
      case "read_file": {
        const filePath = validatePath(args.file_path as string, projectPath);
        content = await readFile(filePath);
        break;
      }

      case "write_file": {
        const filePath = validatePath(args.file_path as string, projectPath);
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        await writeFile(filePath, args.content as string);
        content = `File written: ${args.file_path}`;
        break;
      }

      case "list_files": {
        const tree = await listDirectory(projectPath);
        content = JSON.stringify(flattenTree(tree), null, 2);
        break;
      }

      case "read_site_config": {
        const siteJsonPath = path.join(projectPath, "src", "_data", "site.json");
        content = await readFile(siteJsonPath);
        break;
      }

      case "update_site_config": {
        const siteJsonPath = path.join(projectPath, "src", "_data", "site.json");
        const existing = JSON.parse(await readFile(siteJsonPath));
        const updates = args.updates as Record<string, unknown>;
        const merged = deepMerge(existing, updates);
        await writeFile(siteJsonPath, JSON.stringify(merged, null, 2));
        content = `Site config updated: ${Object.keys(updates).join(", ")}`;
        break;
      }

      case "create_page": {
        const contentDir = args.directory as string || "content/pages";
        const slug = args.slug as string;
        const frontmatter = args.frontmatter as Record<string, unknown>;
        const body = args.body as string || "";

        const filePath = validatePath(
          path.join(contentDir, `${slug}.md`),
          projectPath
        );
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        const yaml = Object.entries(frontmatter)
          .map(([key, value]) => {
            if (typeof value === "string") return `${key}: "${value}"`;
            return `${key}: ${value}`;
          })
          .join("\n");

        await writeFile(filePath, `---\n${yaml}\n---\n${body}`);
        content = `Page created: ${contentDir}/${slug}.md`;
        break;
      }

      case "update_frontmatter": {
        const filePath = validatePath(args.file_path as string, projectPath);
        const raw = await readFile(filePath);
        const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
        if (!fmMatch) throw new Error("No frontmatter found in file");

        const fmLines = fmMatch[1].split("\n");
        const updates = args.updates as Record<string, unknown>;
        const bodyContent = fmMatch[2];

        // Update existing fields or add new ones
        const existingKeys = new Set<string>();
        const updatedLines = fmLines.map((line) => {
          const keyMatch = line.match(/^(\w[\w-]*)\s*:/);
          if (keyMatch && keyMatch[1] in updates) {
            existingKeys.add(keyMatch[1]);
            const value = updates[keyMatch[1]];
            if (typeof value === "string") return `${keyMatch[1]}: "${value}"`;
            return `${keyMatch[1]}: ${value}`;
          }
          return line;
        });

        // Add any new keys not already in frontmatter
        for (const [key, value] of Object.entries(updates)) {
          if (!existingKeys.has(key)) {
            if (typeof value === "string") updatedLines.push(`${key}: "${value}"`);
            else updatedLines.push(`${key}: ${value}`);
          }
        }

        await writeFile(filePath, `---\n${updatedLines.join("\n")}\n---\n${bodyContent}`);
        content = `Frontmatter updated: ${Object.keys(updates).join(", ")}`;
        break;
      }

      default:
        content = `Unknown tool: ${toolCall.name}`;
    }

    return { toolCallId: toolCall.id, content, isError: false };
  } catch (err) {
    return {
      toolCallId: toolCall.id,
      content: `Error: ${(err as Error).message}`,
      isError: true,
    };
  }
}

function flattenTree(
  nodes: Array<{ name: string; relativePath: string; type: string; children?: unknown[] }>,
  prefix = ""
): string[] {
  const result: string[] = [];
  for (const node of nodes) {
    result.push(`${node.type === "directory" ? "[dir] " : ""}${node.relativePath}`);
    if (node.children) {
      result.push(...flattenTree(node.children as typeof nodes, prefix + "  "));
    }
  }
  return result;
}

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result = { ...target };
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === "object" && !Array.isArray(value) && typeof result[key] === "object") {
      result[key] = deepMerge(result[key] as Record<string, unknown>, value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
}

// --- Tool Definitions ---

const TOOL_DEFINITIONS = [
  {
    name: "read_file",
    description: "Read the contents of a file in the project. Use relative paths from the project root.",
    parameters: {
      type: "object" as const,
      properties: {
        file_path: { type: "string", description: "Relative path to the file (e.g. content/pages/home.md)" },
      },
      required: ["file_path"],
    },
  },
  {
    name: "write_file",
    description: "Write content to a file. Creates the file if it doesn't exist, overwrites if it does.",
    parameters: {
      type: "object" as const,
      properties: {
        file_path: { type: "string", description: "Relative path to the file" },
        content: { type: "string", description: "The full content to write" },
      },
      required: ["file_path", "content"],
    },
  },
  {
    name: "list_files",
    description: "List all files and directories in the project (excluding node_modules, _site, .git).",
    parameters: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "read_site_config",
    description: "Read the site configuration (src/_data/site.json) which contains name, tagline, URL, contact info, social links, etc.",
    parameters: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "update_site_config",
    description: "Update fields in the site configuration (src/_data/site.json). Merges with existing config.",
    parameters: {
      type: "object" as const,
      properties: {
        updates: {
          type: "object",
          description: "Key-value pairs to merge into site.json (e.g. { name: \"New Name\", tagline: \"New tagline\" })",
        },
      },
      required: ["updates"],
    },
  },
  {
    name: "create_page",
    description: "Create a new content page with frontmatter and markdown body.",
    parameters: {
      type: "object" as const,
      properties: {
        directory: { type: "string", description: "Content directory (e.g. content/pages, content/services, content/employees)" },
        slug: { type: "string", description: "URL slug / filename without extension (e.g. photography)" },
        frontmatter: {
          type: "object",
          description: "Frontmatter fields. For pages: title, seo_title, meta_description, slug, layout, permalink, published. For services: title, slug, excerpt, featured_image, order, published, permalink. For employees: title, slug, role, photo, order, published, permalink.",
        },
        body: { type: "string", description: "Markdown body content" },
      },
      required: ["directory", "slug", "frontmatter", "body"],
    },
  },
  {
    name: "update_frontmatter",
    description: "Update specific frontmatter fields in an existing markdown file without changing the body.",
    parameters: {
      type: "object" as const,
      properties: {
        file_path: { type: "string", description: "Relative path to the markdown file" },
        updates: {
          type: "object",
          description: "Key-value pairs to update in the frontmatter",
        },
      },
      required: ["file_path", "updates"],
    },
  },
];

const CONTENT_TOOL_NAMES = new Set(["read_file", "write_file", "update_frontmatter"]);

function getToolsForAgent(agentType: AgentType = "site") {
  if (agentType === "content") {
    return TOOL_DEFINITIONS.filter((t) => CONTENT_TOOL_NAMES.has(t.name));
  }
  return TOOL_DEFINITIONS;
}

function getAnthropicTools(agentType: AgentType = "site"): Anthropic.Tool[] {
  return getToolsForAgent(agentType).map((tool) => ({
    name: tool.name,
    description: tool.description,
    input_schema: tool.parameters as Anthropic.Tool["input_schema"],
  }));
}

function getOpenAITools(agentType: AgentType = "site"): OpenAI.Chat.Completions.ChatCompletionTool[] {
  return getToolsForAgent(agentType).map((tool) => ({
    type: "function" as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  }));
}

// --- System Prompts ---

async function buildSystemPrompt(context: ProjectContext): Promise<string> {
  if (context.agentType === "content") {
    return buildContentSystemPrompt(context);
  }
  return buildSiteSystemPrompt(context);
}

function buildContentSystemPrompt(context: ProjectContext): string {
  let currentFileSection = "";
  if (context.currentFilePath && context.currentFile) {
    currentFileSection = `
## Currently Open File
Path: ${context.currentFilePath}
\`\`\`
${context.currentFile}
\`\`\``;
  }

  return `You are a content writing and SEO assistant embedded in the Ink CMS editor.
You are focused exclusively on the content file the user has open right now.

## Your Specialties
- Writing compelling, readable markdown content
- SEO optimization: meta descriptions (150-160 chars), title tags, header hierarchy, keyword placement
- Content structure: logical heading flow (H1 > H2 > H3), scannable paragraphs, effective use of lists
- Readability improvements: active voice, concise sentences, clear transitions
- Frontmatter optimization: seo_title, meta_description, excerpt, featured_image alt text
- Markdown formatting best practices

## Current Project
- Name: ${context.siteName}
- URL: ${context.siteUrl}
${currentFileSection}

## Guidelines
- Always return content as valid markdown
- When suggesting SEO improvements, be specific: give the exact replacement text
- Keep meta descriptions between 150-160 characters
- Use kebab-case for slugs
- Match the existing tone and voice of the content
- When rewriting sections, preserve the factual content; improve only the prose
- For frontmatter changes, output the exact key-value pairs to update
- Be concise. The user is looking at the editor — they want actionable edits, not essays about theory.`;
}

async function buildSiteSystemPrompt(context: ProjectContext): Promise<string> {
  let siteConfig = "{}";
  try {
    siteConfig = await readFile(path.join(context.projectPath, "src", "_data", "site.json"));
  } catch { /* ok */ }

  let fileTree = "[]";
  try {
    const tree = await listDirectory(context.projectPath);
    fileTree = flattenTree(tree).join("\n");
  } catch { /* ok */ }

  let currentFileSection = "";
  if (context.currentFilePath && context.currentFile) {
    currentFileSection = `
## Currently Open File
Path: ${context.currentFilePath}
\`\`\`
${context.currentFile}
\`\`\``;
  }

  return `You are the Site AI for Ink, a Markdown-native CMS built on Eleventy v3.
You help users with site-wide design, templating, configuration, and structural changes.

## Your Specialties
- Nunjucks template authoring and modification (layouts, includes, macros)
- CSS and Tailwind CSS styling and theming
- Eleventy v3 configuration and data cascade
- Site configuration (site.json) management
- Creating and organizing content collections
- Navigation structure and permalink design
- Multi-page scaffolding and restructuring

## Current Project
- Name: ${context.siteName}
- URL: ${context.siteUrl}

## Site Configuration
${siteConfig}

## Project Structure
${fileTree}

## Content Types
This site has these content collections:
- **Pages** in content/pages/ (layout: page.njk). Frontmatter: title, seo_title, meta_description, slug, layout, permalink, published, featured_image, excerpt, hero_headline, hero_subtitle, hero_cta_text, hero_cta_url
- **Services** in content/services/ (layout: service.njk, tags: "services"). Frontmatter: title, slug, excerpt, featured_image, order, published, permalink, price_note
- **Employees** in content/employees/ (layout: employee.njk, tags: "employees"). Frontmatter: title, slug, role, photo, order, published, permalink
${currentFileSection}

## Guidelines
- When modifying templates, show the full file contents to write
- For CSS changes, identify which file to edit and provide complete updated content
- Use the tools to read files before modifying them
- For Eleventy/11ty concepts, be precise about v3 syntax
- When creating pages, always include required fields: title, slug, published, permalink
- Use kebab-case for slugs
- Permalinks follow the pattern: /section/slug/ (e.g. /services/web-design/)
- Explain your changes so the user can learn from them
- Be concise and helpful.`;
}

// --- Streaming ---

const abortControllers = new Map<string, AbortController>();

export function stopGeneration(agentType: AgentType = "site"): void {
  const controller = abortControllers.get(agentType);
  if (controller) {
    controller.abort();
    abortControllers.delete(agentType);
  }
}

function emit(win: BrowserWindow, event: AIStreamEvent): void {
  try {
    if (!win.isDestroyed()) {
      win.webContents.send("ai:stream", event);
    }
  } catch { /* window closed */ }
}

export async function sendMessage(
  messages: ChatMessage[],
  context: ProjectContext,
  win: BrowserWindow
): Promise<ChatMessage> {
  const config = await loadAIConfig();
  if (!config || !config.apiKey) {
    throw new Error("AI not configured. Please add your API key in Settings.");
  }

  const agentType: AgentType = context.agentType || "site";
  const messageId = crypto.randomUUID();
  const controller = new AbortController();
  abortControllers.set(agentType, controller);
  const signal = controller.signal;

  try {
    const systemPrompt = await buildSystemPrompt(context);

    if (config.provider === "anthropic") {
      return await streamAnthropic(config, systemPrompt, messages, context.projectPath, messageId, win, signal, agentType);
    } else {
      return await streamOpenAI(config, systemPrompt, messages, context.projectPath, messageId, win, signal, agentType);
    }
  } catch (err) {
    if ((err as Error).name === "AbortError" || signal.aborted) {
      emit(win, { type: "done", messageId, agentType });
      return { id: messageId, role: "assistant", content: "", timestamp: Date.now() };
    }
    const errorMsg = (err as Error).message || "Unknown error";
    emit(win, { type: "error", error: errorMsg, messageId, agentType });
    throw err;
  } finally {
    abortControllers.delete(agentType);
  }
}

// --- Anthropic Streaming ---

async function streamAnthropic(
  config: AIConfig,
  systemPrompt: string,
  messages: ChatMessage[],
  projectPath: string,
  messageId: string,
  win: BrowserWindow,
  signal: AbortSignal,
  agentType: AgentType = "site"
): Promise<ChatMessage> {
  const client = new Anthropic({ apiKey: config.apiKey });

  // Convert messages to Anthropic format
  const anthropicMessages = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  let fullContent = "";
  let continueLoop = true;

  // Working messages for the tool loop
  let workingMessages = [...anthropicMessages];

  while (continueLoop) {
    if (signal.aborted) break;

    const stream = client.messages.stream(
      {
        model: config.model,
        max_tokens: 4096,
        system: systemPrompt,
        messages: workingMessages,
        tools: getAnthropicTools(agentType),
      },
      { signal }
    );

    const finalMessage = await new Promise<Anthropic.Message>((resolve, reject) => {
      stream.on("text", (text) => {
        fullContent += text;
        emit(win, { type: "chunk", content: text, messageId, agentType });
      });

      stream.on("error", reject);
      stream.finalMessage().then(resolve, reject);
    });

    // Check for tool use in the response
    const toolUseBlocks = finalMessage.content.filter(
      (block): block is Anthropic.ContentBlock & { type: "tool_use" } =>
        block.type === "tool_use"
    );

    if (toolUseBlocks.length === 0 || finalMessage.stop_reason !== "tool_use") {
      continueLoop = false;
    } else {
      // Execute tools and continue
      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const block of toolUseBlocks) {
        const toolCall: ToolCall = {
          id: block.id,
          name: block.name,
          arguments: block.input as Record<string, unknown>,
        };

        emit(win, { type: "tool_call", toolCall, messageId, agentType });

        const result = await executeTool(toolCall, projectPath);
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: result.content,
          is_error: result.isError,
        });

        emit(win, { type: "tool_result", toolResult: result, messageId, agentType });
      }

      // Add paragraph break before next iteration's text
      if (fullContent) {
        fullContent += "\n\n";
        emit(win, { type: "chunk", content: "\n\n", messageId, agentType });
      }

      // Add assistant response + tool results to continue the loop
      workingMessages = [
        ...workingMessages,
        { role: "assistant" as const, content: finalMessage.content as unknown as string },
        { role: "user" as const, content: toolResults as unknown as string },
      ];
    }
  }

  emit(win, { type: "done", messageId, agentType });
  return { id: messageId, role: "assistant", content: fullContent, timestamp: Date.now() };
}

// --- OpenAI Streaming ---

async function streamOpenAI(
  config: AIConfig,
  systemPrompt: string,
  messages: ChatMessage[],
  projectPath: string,
  messageId: string,
  win: BrowserWindow,
  signal: AbortSignal,
  agentType: AgentType = "site"
): Promise<ChatMessage> {
  const client = new OpenAI({ apiKey: config.apiKey });

  // Convert messages to OpenAI format
  const openaiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
  ];

  let fullContent = "";
  let continueLoop = true;
  let workingMessages = [...openaiMessages];

  while (continueLoop) {
    if (signal.aborted) break;

    const stream = await client.chat.completions.create(
      {
        model: config.model,
        messages: workingMessages,
        tools: getOpenAITools(agentType),
        stream: true,
      },
      { signal }
    );

    // Accumulate tool calls from chunks
    const pendingToolCalls: Map<number, { id: string; name: string; arguments: string }> = new Map();

    for await (const chunk of stream) {
      if (signal.aborted) break;

      const choice = chunk.choices[0];
      if (!choice) continue;

      const delta = choice.delta;

      if (delta?.content) {
        fullContent += delta.content;
        emit(win, { type: "chunk", content: delta.content, messageId, agentType });
      }

      if (delta?.tool_calls) {
        for (const tc of delta.tool_calls) {
          if (!pendingToolCalls.has(tc.index)) {
            pendingToolCalls.set(tc.index, { id: tc.id || "", name: tc.function?.name || "", arguments: "" });
          }
          const pending = pendingToolCalls.get(tc.index)!;
          if (tc.id) pending.id = tc.id;
          if (tc.function?.name) pending.name = tc.function.name;
          if (tc.function?.arguments) pending.arguments += tc.function.arguments;
        }
      }

      if (choice.finish_reason === "stop") {
        continueLoop = false;
      }
    }

    // Process any tool calls
    if (pendingToolCalls.size > 0) {
      const toolCallMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
      const assistantToolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[] = [];

      for (const [, tc] of pendingToolCalls) {
        const parsedArgs = JSON.parse(tc.arguments || "{}");
        const toolCall: ToolCall = { id: tc.id, name: tc.name, arguments: parsedArgs };

        assistantToolCalls.push({
          id: tc.id,
          type: "function",
          function: { name: tc.name, arguments: tc.arguments },
        });

        emit(win, { type: "tool_call", toolCall, messageId, agentType });

        const result = await executeTool(toolCall, projectPath);
        emit(win, { type: "tool_result", toolResult: result, messageId, agentType });

        toolCallMessages.push({
          role: "tool",
          tool_call_id: tc.id,
          content: result.content,
        });
      }

      // Add paragraph break before next iteration's text
      if (fullContent) {
        fullContent += "\n\n";
        emit(win, { type: "chunk", content: "\n\n", messageId, agentType });
      }

      // Add assistant message with tool calls + tool results
      workingMessages = [
        ...workingMessages,
        {
          role: "assistant",
          content: fullContent || null,
          tool_calls: assistantToolCalls,
        },
        ...toolCallMessages,
      ];

      continueLoop = true;
    }
  }

  emit(win, { type: "done", messageId, agentType });
  return { id: messageId, role: "assistant", content: fullContent, timestamp: Date.now() };
}
