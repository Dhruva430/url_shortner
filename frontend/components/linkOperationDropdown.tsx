"use client";

import { useEffect, useRef, useState } from "react";
import { SquarePen, QrCode, Eye, Menu, Trash2 } from "lucide-react";
export default function ThemeDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="bg-gray-100  flex items-center focus:outline-none justify-center">
      <div
        className="relative inline-block focus:outline-none text-left"
        ref={dropdownRef}
      >
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex  justify-center w-full px-2 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none  "
        >
          <Menu />
        </button>

        {isOpen && (
          <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
            <div
              className="py-2 p-2"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="dropdown-button"
            >
              <div
                className="flex items-center gap-2 rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 active:bg-blue-100 cursor-pointer"
                role="menuitem"
              >
                <Eye className="size-4" />
                Preview
              </div>
              <div
                className="flex gap-2 items-center rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 active:bg-blue-100 cursor-pointer"
                role="menuitem"
              >
                <QrCode className="size-4" />
                Get QR
              </div>
              <div
                className="flex items-center gap-2 rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 active:bg-blue-100 cursor-pointer"
                role="menuitem"
              >
                <SquarePen className="size-4" />
                Edit
              </div>
              <div
                className="flex items-center gap-2 rounded-md px-4 py-2 text-sm text-red-700 hover:bg-gray-100 active:bg-red-100 cursor-pointer"
                role="menuitem"
              >
                <Trash2 className="size-4" />
                Delete
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
