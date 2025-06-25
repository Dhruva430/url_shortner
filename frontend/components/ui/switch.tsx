"use client";

import { useState } from "react";

export default function ToggleSwitch({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex flex-col items-center">
      {/* Toggle Switch with Label */}
      <div className="flex items-center gap-2">
        <input
          id="switch-link"
          type="checkbox"
          onClick={() => onCheckedChange(!checked)}
          className="appearance-none relative inline-block rounded-full w-12 h-6 cursor-pointer 
            before:inline-block before:absolute before:top-0 before:left-0 before:w-full before:h-full 
            before:rounded-full before:bg-stone-200 before:transition-colors before:duration-200 before:ease-in 
            after:absolute after:top-2/4 after:left-0 after:-translate-y-2/4 after:w-6 after:h-6 
            after:border after:border-stone-200 after:bg-white after:rounded-full 
            checked:after:translate-x-full after:transition-all after:duration-200 after:ease-in 
            dark:after:bg-white checked:before:bg-stone-800 checked:after:border-stone-800"
        />
      </div>
    </div>
  );
}
