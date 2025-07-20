"use client";
import { useQuery } from "@tanstack/react-query";

type NullableField<T> = { String: T; Valid: boolean } | null;
type NullableTime = { Time: string; Valid: boolean } | null;

type BillingInfo = {
  id: number;
  user_id: number;
  razorpay_order_id: string;
  razorpay_payment_id: NullableField<string>;
  amount: number;
  currency: string;
  plan: string;
  status: string;
  created_at: NullableTime;
};

const fetchBilling = async (): Promise<BillingInfo[]> => {
  const res = await fetch("/api/protected/bills", {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch billing info");
  return res.json();
};

export default function BillingPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["bills"],
    queryFn: fetchBilling,
  });

  if (isLoading) return <p className="p-6 text-white">Loading...</p>;
  if (isError)
    return <p className="p-6 text-red-500">Failed to load billing info.</p>;
  if (!data || data.length === 0)
    return <p className="p-6 text-white">No billing data available.</p>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl text-black font-bold mb-4">Billing History</h1>
      <div className="space-y-4">
        {data.map((bill) => (
          <div
            key={bill.id}
            className="border p-4 rounded-md border-gray-700 bg-gray-900"
          >
            <p>
              <strong>Status:</strong>{" "}
              {bill.status === "success" ? "Premium" : "Free"}
            </p>
            <p>
              <strong>Plan:</strong> {bill.plan}
            </p>
            <p>
              <strong>Amount:</strong> ₹{(bill.amount / 100).toFixed(2)}{" "}
              {bill.currency}
            </p>
            <p>
              <strong>Payment ID:</strong>{" "}
              {bill.razorpay_payment_id?.Valid
                ? bill.razorpay_payment_id.String
                : "—"}
            </p>
            <p>
              <strong>Order ID:</strong> {bill.razorpay_order_id}
            </p>
            <p>
              <strong>Created:</strong>{" "}
              {bill.created_at?.Valid
                ? new Date(bill.created_at.Time).toLocaleString()
                : "—"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
