"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { SocialLoginButton } from "@/components/auth/social-login-button";
import { EmailAuthForm } from "@/components/auth/email-auth-form";
import { PhoneAuthForm } from "@/components/auth/phone-auth-form";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [authMode, setAuthMode] = useState<"email" | "phone">("email");
  const [otpSent, setOtpSent] = useState(false);

  const supabase = createClient();

  async function handleEmailSignUp() {
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/onboarding` },
    });
    setMessage(error ? error.message : "Check your email for a confirmation link.");
    setLoading(false);
  }

  async function handleEmailSignIn() {
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setMessage(error.message); } else { window.location.href = "/protocols"; }
    setLoading(false);
  }

  async function handlePhoneOtp() {
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) { setMessage(error.message); } else { setOtpSent(true); setMessage("We sent a 6-digit code to your phone."); }
    setLoading(false);
  }

  async function handleVerifyOtp() {
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: "sms" });
    if (error) { setMessage(error.message); } else { window.location.href = "/protocols"; }
    setLoading(false);
  }

  async function handleSocialLogin(provider: "google" | "apple") {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setMessage(error.message);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              C
            </div>
          </Link>
          <CardTitle className="text-2xl">Welcome</CardTitle>
          <CardDescription>Sign in to access your health protocols</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SocialLoginButton provider="google" onClick={() => handleSocialLogin("google")} />

          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              or continue with
            </span>
          </div>

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
                  onClick={() => { setAuthMode("email"); setOtpSent(false); setMessage(""); }}
                >
                  Email
                </Button>
                <Button
                  variant={authMode === "phone" ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setAuthMode("phone"); setMessage(""); }}
                >
                  Phone
                </Button>
              </div>

              {authMode === "email" ? (
                <EmailAuthForm
                  email={email}
                  password={password}
                  loading={loading}
                  mode="signin"
                  onEmailChange={setEmail}
                  onPasswordChange={setPassword}
                  onSubmit={handleEmailSignIn}
                />
              ) : (
                <PhoneAuthForm
                  phone={phone}
                  otp={otp}
                  otpSent={otpSent}
                  loading={loading}
                  onPhoneChange={setPhone}
                  onOtpChange={setOtp}
                  onSendOtp={handlePhoneOtp}
                  onVerifyOtp={handleVerifyOtp}
                  onReset={() => { setOtpSent(false); setOtp(""); setMessage(""); }}
                />
              )}
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <EmailAuthForm
                email={email}
                password={password}
                loading={loading}
                mode="signup"
                onEmailChange={setEmail}
                onPasswordChange={setPassword}
                onSubmit={handleEmailSignUp}
              />
            </TabsContent>
          </Tabs>

          {message && (
            <p className="text-sm text-center text-muted-foreground">{message}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
