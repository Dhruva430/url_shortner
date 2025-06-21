import { type ComponentPropsWithoutRef } from "react";

type InputProps = ComponentPropsWithoutRef<"input">;
export default function Input({ className, ...props }: InputProps) {
  return (
    <input
      {...props}
      className="flex w-full rounded-md border-[1px] bg-black px-3 py-6 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-50 h-12 border-gray-600 focus:border-accent "
    />
  );
}
