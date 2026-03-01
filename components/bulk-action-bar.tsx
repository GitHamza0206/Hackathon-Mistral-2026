"use client";

import { ArrowRight, XCircle, X } from "@phosphor-icons/react";

interface BulkActionBarProps {
  selectedCount: number;
  onReject: () => void;
  onAdvance: () => void;
  onClearSelection: () => void;
  processing: boolean;
}

export function BulkActionBar({
  selectedCount,
  onReject,
  onAdvance,
  onClearSelection,
  processing,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="bulk-action-bar">
      <span className="bulk-count">{selectedCount} selected</span>
      <button
        type="button"
        className="secondary-button"
        onClick={onReject}
        disabled={processing}
        style={{
          padding: "0.4rem 0.85rem",
          fontSize: "0.8rem",
          color: "var(--danger)",
          borderColor: "rgba(239, 68, 68, 0.2)",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.35rem",
        }}
      >
        <XCircle weight="duotone" size={16} />
        Reject
      </button>
      <button
        type="button"
        className="primary-button"
        onClick={onAdvance}
        disabled={processing}
        style={{
          padding: "0.4rem 0.85rem",
          fontSize: "0.8rem",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.35rem",
        }}
      >
        <ArrowRight weight="bold" size={16} />
        Advance
      </button>
      <button
        type="button"
        onClick={onClearSelection}
        disabled={processing}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "0.25rem",
          color: "var(--muted)",
          display: "inline-flex",
          alignItems: "center",
        }}
        aria-label="Clear selection"
      >
        <X weight="bold" size={16} />
      </button>
    </div>
  );
}
