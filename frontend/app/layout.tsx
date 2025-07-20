import type { Metadata } from "next";
import { Exo } from "next/font/google";
import "./globals.css";
import QueryProvider from "./providers/queryProvider";
import { AuthProvider } from "@/features/auth/hooks/authProvider";
import { PremiumProvider } from "@/features/auth/hooks/premiumProvider";
const exo = Exo({
  variable: "--font-exo",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Shrinkr",
  description: "Shorten, Scan, Analyze — with Shrinkr.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={exo.variable}>
      <body className="bg-background text-foreground antialiased">
        <QueryProvider>
          <AuthProvider>
            <PremiumProvider>{children}</PremiumProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
