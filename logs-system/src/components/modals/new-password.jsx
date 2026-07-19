import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

export default function CreateNewPasswordDialog({
  open,
  onOpenChange,
  onBack,
  onSuccess,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  loading = false,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const hasLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[0-9!@#$%^&*(),.?":{}|<>]/.test(password);

  const score = [hasLength, hasUppercase, hasSpecial].filter(Boolean).length;

  const strength = useMemo(() => {
    if (score === 0) return "Weak";
    if (score === 1) return "Fair";
    if (score === 2) return "Good";
    return "Strong";
  }, [score]);

  const passwordsMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  const handleResetPassword = () => {
    if (onSuccess) {
      onSuccess();
    } else {
      onOpenChange(false);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl p-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">
            Create New Password
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 p-8">

          {/* Icon */}
          <div className="flex justify-center pt-2">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
              <Lock className="h-10 w-10 text-green-700" />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-slate-800">
              Create New Password
            </h2>

            <p className="text-sm text-gray-500 leading-relaxed px-2">
              Your new password must be different from previously used
              passwords.
            </p>
          </div>

          {/* Password */}
          <div className="space-y-2 pt-2">
            <label className="text-sm font-semibold text-slate-700">
              New Password
            </label>

            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-green-700" />

              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                className="h-12 pl-11 pr-12 rounded-xl border-2 focus-visible:ring-green-700"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>

            {/* Strength */}
            {password.length > 0 && (
              <div className="flex items-center gap-3 pt-2">
                <div className="flex flex-1 gap-1.5">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className={`h-2 flex-1 rounded-full transition-colors ${
                        score >= item
                          ? "bg-green-700"
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>

                <span className="text-sm font-semibold text-green-700 min-w-[60px]">
                  {strength}
                </span>
              </div>
            )}
          </div>

          {/* Confirm */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Confirm Password
            </label>

            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-green-700" />

              <Input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm password"
                className={`h-12 rounded-xl border-2 pl-11 pr-20 transition-colors ${
                  passwordsMatch
                    ? "border-green-700 focus-visible:ring-green-700"
                    : "focus-visible:ring-green-700"
                }`}
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                disabled={loading}
              />

              <div className="absolute right-3 top-3.5 flex items-center gap-2">
                {passwordsMatch && (
                  <CheckCircle2
                    size={20}
                    className="text-green-700"
                  />
                )}

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirm(!showConfirm)
                  }
                  className="text-gray-500 hover:text-gray-700"
                >
                  {showConfirm ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {passwordsMatch && (
              <p className="flex items-center gap-1.5 text-sm text-green-700 pt-1">
                <CheckCircle2 size={16} />
                Passwords match
              </p>
            )}
          </div>

          {/* Requirements */}
          <div className="rounded-2xl border-2 bg-gray-50 p-4">
            <h4 className="mb-3 text-sm font-semibold text-slate-700">
              Password requirements:
            </h4>

            <div className="space-y-2.5 text-sm text-slate-600">

              <div className="flex items-center gap-2.5">
                <CheckCircle2
                  size={18}
                  className={
                    hasLength
                      ? "text-green-700"
                      : "text-gray-300"
                  }
                />
                <span>At least 6 characters</span>
              </div>

              <div className="flex items-center gap-2.5">
                <CheckCircle2
                  size={18}
                  className={
                    hasUppercase
                      ? "text-green-700"
                      : "text-gray-300"
                  }
                />
                <span>One uppercase letter</span>
              </div>

              <div className="flex items-center gap-2.5">
                <CheckCircle2
                  size={18}
                  className={
                    hasSpecial
                      ? "text-green-700"
                      : "text-gray-300"
                  }
                />
                <span>
                  One number or special character
                </span>
              </div>

            </div>
          </div>

          {/* Button */}
          <Button
            onClick={handleResetPassword}
            disabled={loading || !passwordsMatch || !hasLength}
            className="h-14 w-full rounded-xl bg-green-700 text-base font-semibold hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="mr-2">Resetting...</span>
                <span className="animate-spin">⏳</span>
              </>
            ) : (
              <>
                <Lock className="mr-2 h-5 w-5" />
                Reset Password
              </>
            )}
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 border-t border-gray-200" />

            <span className="text-sm text-gray-400">
              or
            </span>

            <div className="flex-1 border-t border-gray-200" />
          </div>

          {/* Back */}
          <button 
            onClick={handleBack}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 py-2 text-sm font-semibold text-green-700 hover:underline disabled:opacity-50"
          >
            <ArrowLeft size={18} />
            Back to Login
          </button>

        </div>
      </DialogContent>
    </Dialog>
  );
}