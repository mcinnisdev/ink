import { Sparkles, PenTool, Wand2, Search, MessageSquare } from "lucide-react";

const features = [
  {
    icon: PenTool,
    title: "Write Content",
    desc: "Generate blog posts, service pages, and team bios from a brief",
  },
  {
    icon: Wand2,
    title: "Rewrite & Improve",
    desc: "Refine existing content for tone, clarity, and engagement",
  },
  {
    icon: Search,
    title: "SEO Optimization",
    desc: "Generate meta descriptions, titles, and keyword suggestions",
  },
  {
    icon: MessageSquare,
    title: "Chat Assistant",
    desc: "Ask questions about your content and get smart suggestions",
  },
];

export default function AIView() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-ink-700">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          AI Assistant
        </h2>
        <p className="text-xs text-ink-500 mt-0.5">
          Content writing powered by AI
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-amber-400" />
            </div>
            <p className="text-ink-300 text-sm font-medium">
              AI features are coming soon
            </p>
            <p className="text-ink-500 text-xs mt-1">
              Here's what you'll be able to do
            </p>
          </div>

          <div className="space-y-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-3 p-4 bg-ink-800/50 rounded-lg border border-ink-700/50"
              >
                <feature.icon className="w-5 h-5 text-ink-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-ink-300">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-ink-500 mt-0.5">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
