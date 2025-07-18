"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, Link2, X } from "lucide-react";
import { Card } from "@/components/ui/card";

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
  placeholder = "Search for a link...",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleSelect = (option: Option) => {
    setSelectedOption(option);
    setSearchTerm(option.title);
    setIsOpen(false);
    onSelect(option);
  };

  const handleClear = () => {
    setSelectedOption(null);
    setSearchTerm("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    if (selectedOption) {
      setSearchTerm("");
    }
  };

  return (
    <div className="relative w-full max-w-md " ref={containerRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>

        <input
          ref={inputRef}
          type="text"
          placeholder={selectedOption ? selectedOption.title : placeholder}
          className="w-full pl-10 pr-12 py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-slate-900 placeholder-slate-500"
          onFocus={handleInputFocus}
          onChange={(e) => setSearchTerm(e.target.value)}
          value={searchTerm}
        />

        <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-1">
          {selectedOption && (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-slate-100 rounded-full transition-colors duration-200"
              type="button"
            >
              <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
            </button>
          )}
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {isOpen && (
        <Card className="absolute z-50 w-full mt-2 border-0 shadow-xl bg-white/95 backdrop-blur-sm animate-in fade-in-0 zoom-in-95 duration-200">
          <div className="max-h-64 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-slate-500 text-sm">No links found</p>
                <p className="text-slate-400 text-xs mt-1">
                  Try adjusting your search terms
                </p>
              </div>
            ) : (
              <div className="p-2">
                <div className="text-xs font-medium text-slate-500 px-3 py-2 uppercase tracking-wide">
                  Your Links ({filteredOptions.length})
                </div>
                {filteredOptions.map((option) => (
                  <button
                    key={option.id}
                    className="w-full text-left p-3 hover:bg-blue-50 rounded-lg cursor-pointer transition-all duration-200 group flex items-center gap-3 border border-transparent hover:border-blue-100"
                    onClick={() => handleSelect(option)}
                    type="button"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                      <Link2 className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 truncate group-hover:text-blue-700 transition-colors duration-200">
                        {option.title}
                      </div>
                      <div className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded mt-1 inline-block">
                        /{option.shortcode}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default FilterDropdown;
