"use client";

import { useEffect, useState } from "react";
import { Check, Crown, Zap, Star, Shield, Infinity } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PLANS = [
  {
    key: "monthly",
    name: "Monthly Plan",
    price: "₹89",
    originalPrice: "₹149",
    description: "Perfect for getting started",
    features: [
      "Access to all features",
      "24/7 customer support",
      "Regular updates",
      "Mobile app access",
      "Basic analytics",
    ],
    icon: Zap,
    popular: false,
    savings: null,
  },
  {
    key: "lifetime",
    name: "Lifetime Plan",
    price: "₹999",
    originalPrice: "₹2999",
    description: "Best value for long-term users",
    features: [
      "Everything in Monthly",
      "Lifetime access",
      "Priority support",
      "Advanced analytics",
      "Custom integrations",
      "No recurring payments",
    ],
    icon: Crown,
    popular: true,
    savings: "Save 67%",
  },
];

export default function SubscriptionPage() {
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleSubscribe = async (plan: string) => {
    setLoading(plan);

    try {
      const res = await fetch("/api/protected/createorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });

      const order = await res.json();

      if (!order || !order.id) {
        throw new Error("Order creation failed");
      }

      const rzp = new window.Razorpay({
        key: order.razorpay_key_id,
        amount: order.amount,
        currency: order.currency,
        name: "YourApp",
        description: `${plan} Subscription`,
        order_id: order.id,
        handler: (response: any) => {
          alert("Payment Successful! 🎉");
          console.log("Razorpay Payment Response:", response);
          setLoading(null);
        },
        modal: {
          ondismiss: () => {
            setLoading(null);
          },
        },
        notes: order.notes,
        theme: {
          color: "#3B82F6",
        },
      });

      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Something went wrong. Please try again.");
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Star className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Unlock the full potential of our platform with flexible pricing
            options
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isPopular = plan.popular;
            const isLoading = loading === plan.key;

            return (
              <Card
                key={plan.key}
                className={`relative transition-all duration-300 hover:shadow-xl ${
                  isPopular
                    ? "border-2 border-blue-500 shadow-lg scale-105"
                    : "border border-gray-200 hover:border-gray-300"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 text-sm font-semibold">
                      🔥 Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div
                      className={`p-3 rounded-full ${
                        isPopular ? "bg-blue-100" : "bg-gray-100"
                      }`}
                    >
                      <Icon
                        className={`h-8 w-8 ${
                          isPopular ? "text-blue-600" : "text-gray-600"
                        }`}
                      />
                    </div>
                  </div>

                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {plan.name}
                  </CardTitle>

                  <CardDescription className="text-gray-600 mt-2">
                    {plan.description}
                  </CardDescription>

                  <div className="mt-6">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-4xl font-bold text-gray-900">
                        {plan.price}
                      </span>
                      {plan.originalPrice && (
                        <span className="text-lg text-gray-500 line-through">
                          {plan.originalPrice}
                        </span>
                      )}
                    </div>
                    {plan.savings && (
                      <Badge
                        variant="secondary"
                        className="mt-2 bg-green-100 text-green-700"
                      >
                        {plan.savings}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="px-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <div
                          className={`p-1 rounded-full ${
                            isPopular ? "bg-blue-100" : "bg-gray-100"
                          }`}
                        >
                          <Check
                            className={`h-4 w-4 ${
                              isPopular ? "text-blue-600" : "text-gray-600"
                            }`}
                          />
                        </div>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="px-6 pt-4">
                  <Button
                    onClick={() => handleSubscribe(plan.key)}
                    disabled={isLoading}
                    className={`w-full py-3 text-lg font-semibold transition-all duration-200 ${
                      isPopular
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                        : "bg-gray-900 hover:bg-gray-800 text-white"
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      <>
                        {plan.key === "lifetime" ? (
                          <div className="flex items-center gap-2">
                            <Infinity className="h-5 w-5" />
                            Get Lifetime Access
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Start Monthly Plan
                          </div>
                        )}
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="flex justify-center items-center gap-8 text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              <span>Money Back Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
