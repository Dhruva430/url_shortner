"use client";

import React, { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef } from "react";

type NativeInputProps = ComponentPropsWithoutRef<"input">;

export interface InputProps extends NativeInputProps {
  label?: string;

  containerClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, containerClassName, className, id: idProp, ...props }, ref) => {
    const autoId = useId();
    const inputId = idProp || autoId;

    const inputElement = (
      <input
        id={inputId}
        ref={ref}
        {...props}
        className={cn(
          "w-full  px-4 py-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus-within:border-blue-500 transition duration-150 ease-in-out",
          className
        )}
      />
    );

    // If no label prop, just render the bare input
    if (!label) return inputElement;

    return (
      <label
        className={cn("flex flex-col gap-1", containerClassName)}
        htmlFor={inputId}
      >
        <span className="text-sm font-medium text-black">{label}</span>
        {inputElement}
      </label>
    );
  }
);

Input.displayName = "Input";

export default Input;
