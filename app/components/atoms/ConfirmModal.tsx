"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button";
import { ButtonSpinner } from "./ButtonSpinner";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: "danger" | "primary";
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  variant = "danger",
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  // TODO: future enhancement — require user to type a confirmation phrase before allowing submit

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-text/20 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm rounded-xl border border-border bg-bg shadow-xl p-6 space-y-4">
        <h2 className="text-base font-semibold text-text">{title}</h2>
        <p className="text-sm text-text-muted">{message}</p>
        <div className="flex justify-end gap-3 pt-1">
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant={variant} onClick={handleConfirm} disabled={loading}>
            {loading && <ButtonSpinner className="h-4 w-4" />}
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
