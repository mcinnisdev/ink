import { Check, X, Loader2, RotateCcw } from "lucide-react";
import { usePublishStore, type PublishStep } from "../../stores/publish";
import { useProjectStore } from "../../stores/project";

// Visual steps — staging and committing are internal and collapsed into "Packaging"
const VISUAL_STEPS: { label: string; internalKeys: PublishStep[] }[] = [
  { label: "Preparing your site", internalKeys: ["building"] },
  { label: "Packaging your changes", internalKeys: ["staging", "committing"] },
  { label: "Saving to the web", internalKeys: ["pushing"] },
];

const INTERNAL_ORDER: PublishStep[] = ["building", "staging", "committing", "pushing"];

function getVisualStepStatus(
  internalKeys: PublishStep[],
  currentStep: PublishStep,
  isError: boolean
): "pending" | "active" | "done" | "error" {
  if (currentStep === "done") return "done";

  const currentIdx = INTERNAL_ORDER.indexOf(currentStep);
  const stepFirstIdx = INTERNAL_ORDER.indexOf(internalKeys[0]);
  const stepLastIdx = INTERNAL_ORDER.indexOf(internalKeys[internalKeys.length - 1]);

  if (isError && internalKeys.includes(currentStep)) return "error";
  if (currentIdx > stepLastIdx) return "done";
  if (currentIdx >= stepFirstIdx && currentIdx <= stepLastIdx) return "active";
  return "pending";
}

export default function PublishProgress() {
  const step = usePublishStore((s) => s.step);
  const error = usePublishStore((s) => s.error);
  const reset = usePublishStore((s) => s.reset);
  const publish = usePublishStore((s) => s.publish);
  const projectPath = useProjectStore((s) => s.current?.path);

  const isError = step === "error";
  const isDone = step === "done";

  const handleRetry = () => {
    if (!projectPath) return;
    reset();
    publish(projectPath);
  };

  return (
    <div className="bg-ink-800/50 rounded-lg border border-ink-700/50 p-5">
      <div className="space-y-3">
        {VISUAL_STEPS.map((s, i) => {
          const status = getVisualStepStatus(s.internalKeys, step, isError);

          return (
            <div key={s.label} className="flex items-center gap-3">
              {/* Icon */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  status === "done"
                    ? "bg-green-500/20 text-green-400"
                    : status === "active"
                    ? "bg-accent/20 text-accent"
                    : status === "error"
                    ? "bg-red-500/20 text-red-400"
                    : "bg-ink-700/50 text-ink-500"
                }`}
              >
                {status === "done" ? (
                  <Check className="w-3.5 h-3.5" />
                ) : status === "active" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : status === "error" ? (
                  <X className="w-3.5 h-3.5" />
                ) : (
                  <span className="text-[10px] font-medium">{i + 1}</span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-xs font-medium ${
                  status === "done"
                    ? "text-green-400"
                    : status === "active"
                    ? "text-ink-50"
                    : status === "error"
                    ? "text-red-400"
                    : "text-ink-500"
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Error message */}
      {isError && error && (
        <div className="mt-4 rounded-lg bg-red-900/20 border border-red-800/50 p-3">
          <p className="text-xs text-red-300 break-words">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        {isError && (
          <button
            onClick={handleRetry}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-accent hover:bg-accent-hover text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Retry
          </button>
        )}
        {(isError || isDone) && (
          <button
            onClick={reset}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-ink-400 hover:text-ink-50 hover:bg-ink-700 transition-colors"
          >
            {isDone ? "Done" : "Dismiss"}
          </button>
        )}
      </div>

      {/* Done message */}
      {isDone && (
        <div className="mt-4 rounded-lg bg-green-900/20 border border-green-800/50 p-3 text-center">
          <p className="text-xs text-green-300 font-medium">
            Your site is live! Changes may take a minute to appear.
          </p>
        </div>
      )}
    </div>
  );
}
