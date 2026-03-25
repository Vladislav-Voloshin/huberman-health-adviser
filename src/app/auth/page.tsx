"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [authMode, setAuthMode] = useState<"email" | "phone">("email");

  async function handleEmailSignUp() {
    setLoading(true);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/onboarding` },
    });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Check your email for a confirmation link.");
    }
    setLoading(false);
  }

  async function handleEmailSignIn() {
    setLoading(true);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setMessage(error.message);
    } else {
      window.location.href = "/protocols";
    }
    setLoading(false);
  }

  async function handlePhoneSignIn() {
    setLoading(true);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Check your phone for an OTP code.");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              V
            </div>
          </Link>
          <CardTitle className="text-2xl">Welcome</CardTitle>
          <CardDescription>
            Sign in to access your health protocols
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={authMode === "email" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAuthMode("email")}
                >
                  Email
                </Button>
                <Button
                  variant={authMode === "phone" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAuthMode("phone")}
                >
                  Phone
                </Button>
              </div>

              {authMode === "email" ? (
                <div className="space-y-3">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button
                    className="w-full"
                    onClick={handleEmailSignIn}
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Input
                    type="tel"
                    placeholder="+1234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <Button
                    className="w-full"
                    onClick={handlePhoneSignIn}
                    disabled={loading}
                  >
                    {loading ? "Sending OTP..." : "Send OTP"}
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <div className="space-y-3">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  className="w-full"
                  onClick={handleEmailSignUp}
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {message && (
            <p className="mt-4 text-sm text-center text-muted-foreground">
              {message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
