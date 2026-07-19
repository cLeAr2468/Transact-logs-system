import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { ShieldCheck, Clock3, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function VerifyOtpDialog({
  open,
  onOpenChange,
  email = "resend.com",
  onBack,
  onVerify,
  onResend,
  otp,
  setOtp,
  loading = false,
}) {
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [isExpired, setIsExpired] = useState(false);

  // Reset timer when dialog opens
  useEffect(() => {
    if (open) {
      setTimeLeft(300);
      setIsExpired(false);
    }
  }, [open]);

  // Countdown timer
  useEffect(() => {
    if (!open || timeLeft <= 0) {
      if (timeLeft <= 0 && open) {
        setIsExpired(true);
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open, timeLeft]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleVerify = () => {
    if (isExpired) {
      return;
    }
    if (onVerify) {
      onVerify();
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      onOpenChange(false);
    }
  };

  const handleResend = async () => {
    if (onResend) {
      setResendLoading(true);
      try {
        await onResend();
        // Reset timer after successful resend
        setTimeLeft(300);
        setIsExpired(false);
        setOtp("");
      } catch (error) {
        console.error("Error resending OTP:", error);
      } finally {
        setResendLoading(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[95vw] rounded-3xl border-0 p-4 sm:p-8">
        <DialogHeader>
          <DialogTitle className="sr-only">
            Verify OTP
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center">

          {/* Icon */}
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50 sm:h-16 sm:w-16">
            <ShieldCheck className="h-7 w-7 text-green-700 sm:h-8 sm:w-8" />
          </div>

          {/* Title */}
          <h2 className="mt-4 text-2xl font-bold text-slate-800 sm:mt-6 sm:text-4xl">
            Verify OTP
          </h2>

          {/* Description */}
          <p className="mt-2 text-center text-sm text-gray-500 sm:mt-3 sm:text-base">
            We have sent a 6-digit verification code to your email
          </p>

          <p className="mt-1 text-sm font-semibold text-green-700 sm:text-base">
            {email}
          </p>

          {/* OTP */}
          <div className="mt-6 sm:mt-8">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => setOtp(value)}
              disabled={loading || isExpired}
            >
              <InputOTPGroup className="gap-1.5 sm:gap-3">
                <InputOTPSlot
                  index={0}
                  className="h-12 w-10 rounded-lg border-2 text-xl sm:h-16 sm:w-14 sm:rounded-xl sm:text-2xl"
                />
                <InputOTPSlot
                  index={1}
                  className="h-12 w-10 rounded-lg border-2 text-xl sm:h-16 sm:w-14 sm:rounded-xl sm:text-2xl"
                />
                <InputOTPSlot
                  index={2}
                  className="h-12 w-10 rounded-lg border-2 text-xl sm:h-16 sm:w-14 sm:rounded-xl sm:text-2xl"
                />
                <InputOTPSlot
                  index={3}
                  className="h-12 w-10 rounded-lg border-2 text-xl sm:h-16 sm:w-14 sm:rounded-xl sm:text-2xl"
                />
                <InputOTPSlot
                  index={4}
                  className="h-12 w-10 rounded-lg border-2 text-xl sm:h-16 sm:w-14 sm:rounded-xl sm:text-2xl"
                />
                <InputOTPSlot
                  index={5}
                  className="h-12 w-10 rounded-lg border-2 text-xl sm:h-16 sm:w-14 sm:rounded-xl sm:text-2xl"
                />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {/* Timer */}
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 sm:mt-6">
            <Clock3 size={16} className={isExpired ? "text-red-500" : ""} />
            <span>
              {isExpired ? (
                <span className="font-semibold text-red-500">
                  Code expired
                </span>
              ) : (
                <>
                  Code expires in{" "}
                  <span className={`font-semibold ${timeLeft <= 60 ? "text-red-500" : "text-green-700"}`}>
                    {formatTime(timeLeft)}
                  </span>
                </>
              )}
            </span>
          </div>

          {isExpired && (
            <p className="mt-2 text-sm text-red-500 text-center">
              Please click "Resend Code" to get a new OTP
            </p>
          )}

          {/* Verify Button */}
          <Button
            onClick={handleVerify}
            disabled={loading || otp.length !== 6 || isExpired}
            className="mt-6 h-12 w-full rounded-xl bg-green-700 text-base hover:bg-green-800 sm:mt-8 sm:h-14 sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="mr-2">Verifying...</span>
                <span className="animate-spin">⏳</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                {isExpired ? "Code Expired" : "Verify"}
              </>
            )}
          </Button>

          {/* Resend */}
          <div className="mt-6 text-center text-sm text-gray-500 sm:mt-8 sm:text-base">
            Didn't receive the code?{" "}
            <button
              onClick={handleResend}
              disabled={loading || resendLoading}
              className="font-semibold text-green-700 hover:underline disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
            >
              {resendLoading ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Sending...
                </>
              ) : (
                "Resend Code"
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="my-4 flex w-full items-center sm:my-6">
            <div className="flex-1 border-t"></div>

            <span className="mx-3 text-sm text-gray-400">
              or
            </span>

            <div className="flex-1 border-t"></div>
          </div>

          {/* Back */}
          <button
            onClick={handleBack}
            disabled={loading}
            className="flex items-center gap-2 text-sm font-semibold text-green-700 hover:underline sm:text-base disabled:opacity-50"
          >
            <ArrowLeft size={18} />
            Back to Login
          </button>

        </div>
      </DialogContent>
    </Dialog>
  );
}