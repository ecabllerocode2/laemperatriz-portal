import type { ShippingProgressStep } from "@emperatriz/types";

interface ShippingProgressTrackerProps {
  steps: ShippingProgressStep[];
  compact?: boolean;
}

export default function ShippingProgressTracker({
  steps,
  compact = false,
}: ShippingProgressTrackerProps) {
  const hasProgress = steps.some((s) => s.done || s.active);
  if (!hasProgress) return null;

  return (
    <div className={compact ? "mt-2" : "mt-3"}>
      <div className="flex items-center justify-between gap-1">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex w-full items-center">
              {index > 0 ? (
                <div
                  className={`h-0.5 flex-1 ${step.done || step.active ? "bg-brand-red" : "bg-neutral-200"}`}
                />
              ) : (
                <div className="flex-1" />
              )}
              <div
                className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  step.done
                    ? "bg-brand-red text-white"
                    : step.active
                      ? "border-2 border-brand-red bg-white text-brand-red"
                      : "bg-neutral-100 text-neutral-400"
                }`}
              >
                {index + 1}
              </div>
              {index < steps.length - 1 ? (
                <div
                  className={`h-0.5 flex-1 ${steps[index + 1]?.done || steps[index + 1]?.active ? "bg-brand-red" : "bg-neutral-200"}`}
                />
              ) : (
                <div className="flex-1" />
              )}
            </div>
            <span
              className={`text-center text-[10px] font-medium leading-tight ${
                step.active ? "text-brand-red" : step.done ? "text-brand-night" : "text-neutral-400"
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
