// components/DeleteConfirmationDialog.tsx
"use client";
import React from "react";
import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
};

export default function deleteConfimation({
  open,
  onClose,
  onConfirm,
  title = "Delete Link?",
  description = "Are you sure you want to delete this link? This action cannot be undone.",
}: Props) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm space-y-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-gray-600">{description}</p>
        <div className="flex justify-end gap-2 pt-4">
          <button
            onClick={onClose}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
