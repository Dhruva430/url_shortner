"use client";

import { useEffect, useState } from "react";
import Input from "@/components/input";
import { useWatch } from "react-hook-form";

export default function UsernameInput({ register, control, errors }: any) {
  const username = useWatch({ name: "username", control });
  const [isUsernameValid, setUsernameValid] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (username && username.length >= 2) {
      setIsChecking(true);
      const timeout = setTimeout(async () => {
        const url = `/api/check-username?username=${username}`;
        try {
          const response = await fetch(url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
          if (response.ok) {
            const data = await response.json();
            setUsernameValid(data.available);
          }
        } catch (error) {
          console.error("Error:", error);
        } finally {
          setIsChecking(false);
        }
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [username]);

  return (
    <div>
      <label
        className="block text-sm sm:text-base lg:text-lg mb-2"
        htmlFor="username"
      >
        Username
        <span className="text-red-500"> *</span>
      </label>
      <input
        {...register("username")}
        type="text"
        id="username"
        placeholder="Enter Username"
        className="w-full  px-4 py-3 bg-black rounded-lg border border-gray-300 focus:outline-none focus-within:border-blue-500 transition duration-150 ease-in-out"
      />
      {errors.username && (
        <p className="text-red-500 text-xs sm:text-sm mt-1">
          {errors.username.message}
        </p>
      )}
      {username && username.length >= 2 && (
        <>
          {isChecking ? (
            <p className="text-yellow-500 text-xs sm:text-sm mt-1 ml-2">
              Checking availability...
            </p>
          ) : !isUsernameValid ? (
            <p className="text-red-500 text-xs sm:text-sm mt-1 ml-2">
              Username Already Taken
            </p>
          ) : (
            <p className="text-green-500 text-xs sm:text-sm mt-1 ml-2">
              Username is Available
            </p>
          )}
        </>
      )}
    </div>
  );
}
