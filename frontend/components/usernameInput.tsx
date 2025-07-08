"use client";
import React, { useEffect, useState } from "react";
import Input from "@/components/input";
import { useWatch } from "react-hook-form";

export default function UsernameInput({ register, errors, control }: any) {
  const username = useWatch({ name: "username", control });
  const [isUsernameValid, setUsernameValid] = useState(true);

  useEffect(() => {
    if (username) {
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
            if (data.available) {
              setUsernameValid(true);
            } else {
              setUsernameValid(false);
            }
          }
        } catch (error) {
          console.error("Error:", error);
        }
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [username]);

  return (
    <div className="mb-4">
      <label className="block text-[18px] mb-2" htmlFor="username">
        Username<span className="text-red-500"> *</span>
      </label>
      <Input
        {...register("username")}
        type="username"
        id="username"
        placeholder="Enter Username"
      />
      {errors.username && (
        <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
      )}
      {username && isUsernameValid && (
        <p className="text-green-500 text-sm mt-1">Username is Available</p>
      )}
    </div>
  );
}
