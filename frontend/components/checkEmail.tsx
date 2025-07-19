"use client";

import { useEffect, useState } from "react";
import { useWatch } from "react-hook-form";

export default function EmailInput({ register, control, errors }: any) {
  const email = useWatch({ name: "email", control });
  const [isEmailValid, setEmailValid] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (email && email.length > 5) {
      setIsChecking(true);
      const timeout = setTimeout(async () => {
        try {
          const response = await fetch(
            `/api/check-email?email=${encodeURIComponent(email)}`
          );
          if (response.ok) {
            const data = await response.json();
            setEmailValid(data.available);
          }
        } catch {
          setEmailValid(true); // fallback to valid
        } finally {
          setIsChecking(false);
        }
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [email]);

  return (
    <div>
      <label
        htmlFor="email"
        className="block text-sm sm:text-base lg:text-lg mb-2"
      >
        Email <span className="text-red-500"> *</span>
      </label>
      <input
        {...register("email")}
        type="text"
        id="email"
        placeholder="Enter Email"
        className="w-full  px-4 py-3 bg-black rounded-lg border border-gray-300 focus:outline-none focus-within:border-blue-500 transition duration-150 ease-in-out"
      />
      {errors.email && (
        <p className="text-red-500 text-xs sm:text-sm mt-1">
          {errors.email.message}
        </p>
      )}
      {email && email.length > 5 && (
        <>
          {isChecking ? (
            <p className="text-yellow-500 text-xs sm:text-sm mt-1 ml-2">
              Checking email...
            </p>
          ) : !isEmailValid ? (
            <p className="text-red-500 text-xs sm:text-sm mt-1 ml-2">
              Email already registered
            </p>
          ) : (
            <p className="text-green-500 text-xs sm:text-sm mt-1 ml-2">
              Email is available
            </p>
          )}
        </>
      )}
    </div>
  );
}
