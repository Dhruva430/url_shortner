"use client";

import React, { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  /**
   * Initial hex value, defaults to #000000
   */
  value?: string;
  /**
   * Callback fired whenever the user picks a new color
   */
  onChange?: (hex: string) => void;
  /**
   * Optional text label displayed above the picker
   */
  label?: string;
  /**
   * Extra class names for the root container
   */
  className?: string;
}

const ColorBadge: React.FC<{ hex: string }> = ({ hex }) => (
  <span
    className="inline-block w-5 h-5 mr-2 rounded-full border border-muted-foreground"
    style={{ backgroundColor: hex }}
  />
);

export default function ColorPicker({
  value = "#000000",
  onChange,
  label,
  className,
}: ColorPickerProps) {
  const [color, setColor] = useState<string>(value);

  const handleChange = (hex: string) => {
    setColor(hex);
    onChange?.(hex);
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && <label className="text-sm font-medium">{label}</label>}

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="justify-start w-full h-10 cursor-pointer text-left"
          >
            <ColorBadge hex={color} />
            <span className="font-mono">{color.toUpperCase()}</span>
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-60 p-4">
          <HexColorPicker color={color} onChange={handleChange} />
          <div className="mt-4 flex items-center justify-between">
            <ColorBadge hex={color} />
            <span className="font-mono text-sm">{color.toUpperCase()}</span>
            <Button
              size="sm"
              onClick={() => navigator.clipboard.writeText(color)}
            >
              Copy
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
