"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RedirectPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const shortCode = searchParams.get("shortcode");
  const [password, setPassword] = useState("");
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!shortCode) {
      setError("Missing shortcode");
      return;
    }
    fetch(`/api/redirect?shortcode=${shortCode}`)
      .then(async (res) => {
        if (res.redirected) {
          window.location.href = res.url;
        } else if (res.status === 401) {
          setRequiresPassword(true);
        } else {
          const data = await res.json();
          setError(data.error || "Something went wrong");
        }
      })
      .catch(() => setError("Network error"));
  }, [shortCode]);

  const handleSubmit = async () => {
    setError("");
    const res = await fetch(
      `/api/redirect?shortcode=${shortCode}&password=${encodeURIComponent(
        password
      )}`
    );
    if (res.redirected) {
      window.location.href = res.url;
    } else {
      const data = await res.json();
      setError(data.error || "Failed to redirect");
    }
  };

  if (error && !requiresPassword) {
    return <p className="text-red-600 text-center mt-8">{error}</p>;
  }

  if (!requiresPassword) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h2 className="text-2xl font-bold mb-4">Enter Password to Continue</h2>
      <input
        type="password"
        className="border border-gray-300 p-2 rounded w-full max-w-sm"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        onClick={handleSubmit}
        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Submit
      </button>
      {error && <p className="text-red-500 mt-3">{error}</p>}
    </div>
  );
}
