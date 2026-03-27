"use client";

import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { SocialLoginButton } from "@/components/auth/social-login-button";
import { EmailAuthForm } from "@/components/auth/email-auth-form";
import { PhoneAuthForm } from "@/components/auth/phone-auth-form";
import { useAuth } from "@/components/auth/use-auth";

export default function AuthPage() {
  const auth = useAuth();

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
          <SocialLoginButton provider="google" onClick={() => auth.handleSocialLogin("google")} />

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
                  variant={auth.authMode === "email" ? "default" : "outline"}
                  size="sm"
                  onClick={() => auth.switchAuthMode("email")}
                >
                  Email
                </Button>
                <Button
                  variant={auth.authMode === "phone" ? "default" : "outline"}
                  size="sm"
                  onClick={() => auth.switchAuthMode("phone")}
                >
                  Phone
                </Button>
              </div>

              {auth.authMode === "email" ? (
                <EmailAuthForm
                  email={auth.email}
                  password={auth.password}
                  loading={auth.loading}
                  mode="signin"
                  onEmailChange={auth.setEmail}
                  onPasswordChange={auth.setPassword}
                  onSubmit={auth.handleEmailSignIn}
                />
              ) : (
                <PhoneAuthForm
                  phone={auth.phone}
                  otp={auth.otp}
                  otpSent={auth.otpSent}
                  loading={auth.loading}
                  onPhoneChange={auth.setPhone}
                  onOtpChange={auth.setOtp}
                  onSendOtp={auth.handlePhoneOtp}
                  onVerifyOtp={auth.handleVerifyOtp}
                  onReset={auth.resetOtp}
                />
              )}
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <EmailAuthForm
                email={auth.email}
                password={auth.password}
                loading={auth.loading}
                mode="signup"
                onEmailChange={auth.setEmail}
                onPasswordChange={auth.setPassword}
                onSubmit={auth.handleEmailSignUp}
              />
            </TabsContent>
          </Tabs>

          {auth.message && (
            <p className="text-sm text-center text-muted-foreground">{auth.message}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
