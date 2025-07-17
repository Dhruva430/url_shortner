"use client";

import React, { useState } from "react";
import { useEffect, useRef } from "react";

type Option = {
  id: string;
  title: string;
  shortcode: string;
};

type FilterDropdownProps = {
  options: Option[];
  onSelect: (option: Option) => void;
  placeholder?: string;
};

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  options,
  onSelect,
  placeholder = "Search...",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter((opt) =>
    opt.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const path = event.composedPath?.() || [];
      if (containerRef.current && !path.includes(containerRef.current)) {
        setIsOpen(false);
      }
    }

    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-64 " ref={containerRef}>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none"
        onFocus={() => setIsOpen(true)}
        onChange={(e) => setSearchTerm(e.target.value)}
        value={searchTerm}
      />

      {isOpen && (
        <ul className="absolute z-10 w-full mt-1 max-h-48 overflow-y-auto bg-white border border-gray-300 rounded shadow-md">
          {filteredOptions.length === 0 ? (
            <li className="p-2 text-gray-500">No results found</li>
          ) : (
            filteredOptions.map((option) => (
              <li
                key={option.id}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  onSelect(option);
                  setSearchTerm(option.title);
                  setIsOpen(false);
                }}
              >
                {option.title}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default FilterDropdown;
