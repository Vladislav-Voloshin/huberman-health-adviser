"use client";

import { X, FlaskConical } from "lucide-react";

export interface ProtocolContext {
  id: string;
  title: string;
  description: string;
}

export function ProtocolContextBanner({
  protocol,
  onDismiss,
}: {
  protocol: ProtocolContext;
  onDismiss: () => void;
}) {
  return (
    <div className="mx-4 mt-3 mb-1 flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
      <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight">
          Asking about: {protocol.title}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
          {protocol.description}
        </p>
      </div>
      <button
        onClick={onDismiss}
        className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        aria-label="Dismiss protocol context"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
