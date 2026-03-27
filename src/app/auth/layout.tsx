import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — Craftwell",
  description: "Sign in or create an account to access personalized health protocols.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
