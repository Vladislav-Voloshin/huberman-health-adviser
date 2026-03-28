"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useAuth() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [authMode, setAuthMode] = useState<"email" | "phone">("email");
  const [otpSent, setOtpSent] = useState(false);

  const supabase = createClient();

  // Pick up OAuth errors passed as ?error= query param (e.g. from callback)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get("error");
    if (errorParam) {
      setMessage(decodeURIComponent(errorParam));
      // Clean the URL so the error doesn't persist on refresh
      window.history.replaceState({}, "", "/auth");
    }
  }, []);

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
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message);
    } else if (data.user) {
      const { data: profile } = await supabase
        .from("users")
        .select("onboarding_completed")
        .eq("id", data.user.id)
        .maybeSingle();
      window.location.href = profile?.onboarding_completed ? "/protocols" : "/onboarding";
    }
    setLoading(false);
  }

  async function handlePhoneOtp() {
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) {
      setMessage(error.message);
    } else {
      setOtpSent(true);
      setMessage("We sent a 6-digit code to your phone.");
    }
    setLoading(false);
  }

  async function handleVerifyOtp() {
    setLoading(true);
    setMessage("");
    const { error, data } = await supabase.auth.verifyOtp({ phone, token: otp, type: "sms" });
    if (error) {
      setMessage(error.message);
    } else if (data.user) {
      const { data: profile } = await supabase
        .from("users")
        .select("onboarding_completed")
        .eq("id", data.user.id)
        .maybeSingle();
      window.location.href = profile?.onboarding_completed ? "/protocols" : "/onboarding";
    }
    setLoading(false);
  }

  async function handleSocialLogin(provider: "google" | "apple") {
    setSocialLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    if (error) {
      setMessage(error.message);
      setSocialLoading(false);
    }
    // On success the browser navigates away, so no need to reset loading
  }

  function switchAuthMode(mode: "email" | "phone") {
    setAuthMode(mode);
    if (mode === "email") setOtpSent(false);
    setMessage("");
  }

  function resetOtp() {
    setOtpSent(false);
    setOtp("");
    setMessage("");
  }

  return {
    email, setEmail, phone, setPhone, otp, setOtp, password, setPassword,
    loading, socialLoading, message, authMode, otpSent,
    handleEmailSignUp, handleEmailSignIn, handlePhoneOtp, handleVerifyOtp,
    handleSocialLogin, switchAuthMode, resetOtp,
  };
}
