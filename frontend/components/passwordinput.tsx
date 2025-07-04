import { type ComponentPropsWithoutRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type InputProps = ComponentPropsWithoutRef<"input">;

export default function PasswordInput({ className, ...props }: InputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative w-full">
      <input
        type={show ? "text" : "password"}
        {...props}
        className={`w-full px-4 py-3 rounded-lg focus:outline-none focus-within:border-blue-500 border border-gray-300 transition duration-150 ease-in-out pr-12 ${
          className ?? ""
        }`}
      />
      <button
        type="button"
        tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );
}
