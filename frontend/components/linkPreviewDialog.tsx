"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { LinkData } from "@/features/links/types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  data: LinkData;
};

export default function LinkPreviewDialog({ isOpen, onClose, data }: Props) {
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Mount portal only on client
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Escape key closes dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Click outside closes dialog
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!mounted || !isOpen) return null;

  const statusColor = {
    Active: "bg-black text-white text-xs px-3 py-1 rounded-full",
    Protected: "bg-gray-200 text-gray-800",
    Expired: "bg-red-100 text-red-800",
  };

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center">
      <div
        ref={dialogRef}
        className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl shadow-lg p-6 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-2xl"
        >
          ×
        </button>

        <h2 className="text-xl font-semibold mb-4">Link Preview</h2>

        {data.thumbnail && (
          <img
            src={data.thumbnail}
            alt="Link Thumbnail"
            className="rounded mb-4 w-full h-40 object-cover"
          />
        )}

        <div className="space-y-4">
          <div>
            <p className="font-medium">Title</p>
            <p className="text-gray-800">{data.title}</p>
          </div>

          <div>
            <p className="font-medium">Original URL</p>
            <a
              href={data.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline break-all"
            >
              {data.originalUrl}
            </a>
          </div>

          <div>
            <p className="font-medium mb-1">Short URL</p>
            <div className="relative">
              <input
                readOnly
                className="w-full px-2 py-1 pr-16 rounded border bg-gray-100 text-sm"
                value={data.shortUrl}
              />
              <button
                onClick={() => navigator.clipboard.writeText(data.shortUrl)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-blue-600 hover:underline"
              >
                Copy
              </button>
            </div>
          </div>

          <div>
            <p className="font-medium">Clicks</p>
            <p className="text-lg font-bold text-gray-900">{data.clicks}</p>
          </div>

          <div>
            <p className="font-medium">Created At</p>
            <p className="text-gray-700">{data.createdAt}</p>
          </div>

          <div className="flex gap-2 mt-4">
            <span
              className={`px-2 py-1 text-sm rounded-full ${
                statusColor[data.status]
              }`}
            >
              {data.status}
            </span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
