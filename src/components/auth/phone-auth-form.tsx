"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PhoneAuthFormProps {
  phone: string;
  otp: string;
  otpSent: boolean;
  loading: boolean;
  onPhoneChange: (value: string) => void;
  onOtpChange: (value: string) => void;
  onSendOtp: () => void;
  onVerifyOtp: () => void;
  onReset: () => void;
}

export function PhoneAuthForm({
  phone,
  otp,
  otpSent,
  loading,
  onPhoneChange,
  onOtpChange,
  onSendOtp,
  onVerifyOtp,
  onReset,
}: PhoneAuthFormProps) {
  if (!otpSent) {
    return (
      <div className="space-y-3">
        <Input
          type="tel"
          placeholder="+1 (555) 123-4567"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
        />
        <Button
          className="w-full"
          onClick={onSendOtp}
          disabled={loading || !phone.trim()}
        >
          {loading ? "Sending code..." : "Send Verification Code"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground text-center">
        Enter the 6-digit code sent to {phone}
      </p>
      <Input
        type="text"
        inputMode="numeric"
        placeholder="000000"
        maxLength={6}
        value={otp}
        onChange={(e) => onOtpChange(e.target.value.replace(/\D/g, ""))}
        className="text-center text-lg tracking-widest"
      />
      <Button
        className="w-full"
        onClick={onVerifyOtp}
        disabled={loading || otp.length !== 6}
      >
        {loading ? "Verifying..." : "Verify Code"}
      </Button>
      <button
        onClick={onReset}
        className="text-xs text-muted-foreground hover:text-foreground w-full text-center"
      >
        Use a different number
      </button>
    </div>
  );
}
