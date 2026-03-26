"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EmailAuthFormProps {
  email: string;
  password: string;
  loading: boolean;
  mode: "signin" | "signup";
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
}

export function EmailAuthForm({
  email,
  password,
  loading,
  mode,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: EmailAuthFormProps) {
  return (
    <div className="space-y-3">
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
      />
      <Input
        type="password"
        placeholder={mode === "signup" ? "Password (min 6 characters)" : "Password"}
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
      />
      <Button className="w-full" onClick={onSubmit} disabled={loading}>
        {loading
          ? mode === "signup" ? "Creating account..." : "Signing in..."
          : mode === "signup" ? "Create Account" : "Sign In"}
      </Button>
    </div>
  );
}
