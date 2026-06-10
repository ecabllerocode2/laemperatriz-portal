import { AlertTriangle, Clock, Info } from "lucide-react";
import type { PortalLiquidationAlert } from "@emperatriz/types";
import { formatCountdown } from "@/lib/format";

interface LiquidationAlertsBannerProps {
  alerts: PortalLiquidationAlert[];
}

function toneClasses(severity: PortalLiquidationAlert["severity"]): string {
  switch (severity) {
    case "urgent":
      return "border-red-200 bg-red-50 text-red-900";
    case "warning":
      return "border-amber-200 bg-amber-50 text-amber-900";
    default:
      return "border-sky-200 bg-sky-50 text-sky-900";
  }
}

function Icon({ severity }: { severity: PortalLiquidationAlert["severity"] }) {
  if (severity === "info") return <Info className="mt-0.5 h-4 w-4 shrink-0" />;
  return <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />;
}

export default function LiquidationAlertsBanner({ alerts }: LiquidationAlertsBannerProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`flex gap-2.5 rounded-xl border px-3.5 py-3 text-sm ${toneClasses(alert.severity)}`}
        >
          <Icon severity={alert.severity} />
          <div className="min-w-0 flex-1">
            <p>{alert.message}</p>
            {alert.remainingMs && alert.remainingMs > 0 ? (
              <p className="mt-1 flex items-center gap-1 text-xs font-semibold opacity-90">
                <Clock className="h-3.5 w-3.5" />
                {formatCountdown(alert.remainingMs)}
              </p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
