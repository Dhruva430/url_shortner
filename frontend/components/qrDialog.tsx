"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { LinkData } from "@/features/links/types";
import { saveAs } from "file-saver";
type Props = {
  link: LinkData;
  open: boolean;
  onClose: () => void;
};

export default function QrDialog({ open, onClose, link }: Props) {
  const url =
    "http://localhost:8080/api/protected/shorten/qr/" +
    link.short_url.split("/").pop();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || !open) return null;
  const downloadQR = () => saveAs(url, "image.png");
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      <div
        className="relative bg-white p-6 rounded-xl shadow-xl w-full max-w-sm text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-1">QR Code</h2>
        <p className="text-sm text-gray-500 mb-4">
          Scan this QR code to access your shortened link
        </p>

        <div className="w-48 h-48 mx-auto mb-6 flex items-center justify-center border border-gray-300 rounded-lg">
          <img
            src={url}
            alt="QR Code"
            className="w-full h-full object-contain"
          />
        </div>

        <p className="text-base font-semibold">{link.title}</p>
        <p className="text-sm text-gray-600 mb-6">{link.short_url}</p>

        <div className="flex gap-4 justify-center">
          {/* TODO: download the QR */}
          <button
            onClick={downloadQR}
            className="px-4 py-2 border rounded-md text-sm hover:bg-gray-100 cursor-pointer"
          >
            Download QR Code
          </button>
          <button
            onClick={() =>
              window.navigator.clipboard.writeText.bind(link.short_url)
            }
            className="px-4 py-2 border rounded-md text-sm hover:bg-gray-100 cursor-pointer"
          >
            Copy Link
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
