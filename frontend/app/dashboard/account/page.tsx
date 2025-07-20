"use client";
import { useQuery } from "@tanstack/react-query";

type NullableField = { String: string; Valid: boolean };
type NullableTime = { Time: string; Valid: boolean };

type AccountInfo = {
  id: number;
  username: string;
  email: string;
  ip_address: NullableField;
  provider: NullableField;
  provider_id: NullableField;
  image: NullableField;
  created_at: NullableTime;
  updated_at: NullableTime;
};

const fetchAccount = async (): Promise<AccountInfo> => {
  const res = await fetch("/api/protected/account", {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch account info");
  return res.json();
};

const formatNullableString = (field: NullableField) =>
  field.Valid ? field.String : "—";

const formatNullableTime = (field: NullableTime) =>
  field.Valid ? new Date(field.Time).toLocaleString() : "—";

export default function AccountPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["account"],
    queryFn: fetchAccount,
  });

  if (isLoading) return <p className="p-6 text-white">Loading...</p>;
  if (isError)
    return <p className="p-6 text-red-500">Failed to load account info.</p>;
  if (!data) return <p className="p-6 text-white">No account data found.</p>;

  return (
    <div className="p-6 text-black bg-gray-400 rounded-md">
      <h1 className="text-2xl font-bold mb-4">Account Information</h1>
      <div className="space-y-2">
        <p>
          <strong>ID:</strong> {data.id}
        </p>
        <p>
          <strong>Username:</strong> {data.username}
        </p>
        <p>
          <strong>Email:</strong> {data.email}
        </p>
        <p>
          <strong>IP Address:</strong> {formatNullableString(data.ip_address)}
        </p>
        <p>
          <strong>Provider:</strong> {formatNullableString(data.provider)}
        </p>
        <p>
          <strong>Provider ID:</strong> {formatNullableString(data.provider_id)}
        </p>
        <p>
          <strong>Image:</strong> {formatNullableString(data.image)}
        </p>
        <p>
          <strong>Created At:</strong> {formatNullableTime(data.created_at)}
        </p>
      </div>
    </div>
  );
}
