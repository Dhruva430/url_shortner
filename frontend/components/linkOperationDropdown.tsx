"use client";

import { useEffect, useRef, useState } from "react";
import { SquarePen, QrCode, Eye, Menu, Trash2 } from "lucide-react";

type ThemeDropdownProps = {
  shortUrl: string;
  id: string;
  onDelete: (shortUrl: string, id: string) => void;
  onPreview?: () => void;
  onEdit?: () => void;
};

export default function ThemeDropdown({
  shortUrl,
  id,
  onDelete,
  onPreview,
  onEdit,
}: ThemeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setConfirmOpen(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const handleDeleteClick = () => {
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    onDelete(shortUrl, id);
    setConfirmOpen(false);
    setIsOpen(false);
  };

  const cancelDelete = () => {
    setConfirmOpen(false);
  };

  return (
    <div className="bg-gray-100 flex items-center justify-center">
      <div className="relative inline-block text-left" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex justify-center w-full px-2 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm"
        >
          <Menu />
        </button>

        {isOpen && (
          <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
            <div className="py-2 p-2">
              <div
                className="flex items-center gap-2 rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  onPreview?.();
                  setIsOpen(false);
                }}
              >
                <Eye className="size-4" />
                Preview
              </div>
              <div className="flex gap-2 items-center rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                <QrCode className="size-4" />
                Get QR
              </div>
              <div
                onClick={() => {
                  onEdit?.();
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <SquarePen className="size-4" />
                Edit
              </div>

              <div
                onClick={handleDeleteClick}
                className="flex items-center gap-2 rounded-md px-4 py-2 text-sm text-red-700 hover:bg-gray-100 cursor-pointer"
              >
                <Trash2 className="size-4" />
                Delete
              </div>
            </div>
          </div>
        )}

        {confirmOpen && (
          <div className="absolute top-full right-0 mt-2 w-64 p-4 bg-white border border-gray-300 shadow-md rounded-md z-50">
            <p className="text-sm text-gray-800 mb-3">
              Are you sure you want to delete this link?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={cancelDelete}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
