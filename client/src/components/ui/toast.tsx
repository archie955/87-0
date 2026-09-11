import { CheckCircle2, Info, TriangleAlert, CircleX, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Severity } from "@/stores/notificationStore";

const ICONS: Record<Severity, typeof Info> = {
  success: CheckCircle2,
  info: Info,
  warning: TriangleAlert,
  error: CircleX,
};

interface ToastProps {
  open: boolean;
  message: string;
  severity: Severity;
  onClose: () => void;
}

function Toast({ open, message, severity, onClose }: ToastProps) {
  if (!open) {
    return null;
  }

  const Icon = ICONS[severity];
  const isError = severity === "error";

  return (
    <div className="fixed inset-x-4 bottom-4 z-100 flex justify-center sm:inset-x-auto sm:right-4 sm:justify-end">
      <output
        className={cn(
          "animate-in fade-in slide-in-from-bottom-2 bg-popover text-popover-foreground flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 text-sm shadow-lg duration-200",
          isError && "border-destructive/40",
        )}
      >
        <Icon
          className={cn(
            "mt-0.5 size-4 shrink-0",
            isError ? "text-destructive" : "text-muted-foreground",
          )}
        />
        <p className="flex-1 leading-snug">{message}</p>
        <Button
          variant="ghost"
          size="icon-sm"
          className="-mt-1 -mr-1"
          onClick={onClose}
        >
          <X />
          <span className="sr-only">Dismiss</span>
        </Button>
      </output>
    </div>
  );
}

export { Toast };
