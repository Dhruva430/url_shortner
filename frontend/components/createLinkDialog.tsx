"use client";
import React, { useState } from "react";
import { createPortal } from "react-dom";
import { XIcon } from "lucide-react";
import CreateLinkForm from "@/features/links/createLinkForm";
export default function CreateLinkDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [password, setPassword] = useState(false);
  if (!open) return null;
  return createPortal(
    <div
      className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-50"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="bg-white p-6 rounded shadow-lg w-full max-w-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-black">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl  font-bold ">Create New Link</h2>
            <XIcon
              className="cursor-pointer"
              onClick={() => onOpenChange(false)}
            />
          </div>
          <p className="text-gray-600 mt-2">
            Create a shortened link with advanced features
          </p>
        </div>
        <CreateLinkForm />
      </div>
    </div>,
    typeof window !== "undefined" ? document.body : (null as any)
  );
}
