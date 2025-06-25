import { type ComponentPropsWithoutRef } from "react";

type InputProps = ComponentPropsWithoutRef<"input">;
export default function Input({ className, ...props }: InputProps) {
  return (
    <input
      {...props}
      className="w-full px-4 py-3 rounded-lg focus:outline-none focus-within:border-blue-500 border border-gray-300 transition duration-150 ease-in-out"
    />
  );
}
