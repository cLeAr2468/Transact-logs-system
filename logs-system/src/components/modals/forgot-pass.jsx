import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Lock, Mail, Send, ArrowLeft } from "lucide-react";

export default function ForgotPasswordDialog({
  open,
  onOpenChange,
  email,
  setEmail,
  onSubmit,
  onBack,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          sm:max-w-md
          rounded-3xl
          border
          p-0
          overflow-hidden
          shadow-2xl
        "
      >
        <div className="p-8">

          {/* Lock Icon */}
          <div className="flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <Lock className="h-8 w-8 text-green-700" />
            </div>
          </div>

          {/* Title */}
          <DialogHeader className="mt-6 space-y-2 text-center">
            <h2 className="text-3xl font-bold text-slate-900">
              Forgot Password?
            </h2>

            <p className="mx-auto max-w-sm text-sm leading-6 text-slate-500">
              Enter your email address and we'll send you a code to
              reset your password.
            </p>
          </DialogHeader>

          {/* Form */}
          <div className="mt-8 space-y-6">

            <div className="space-y-2">
              <Label className="font-semibold">
                Email Address
              </Label>

              <div className="relative">
                <Mail
                  className="
                    absolute
                    left-4
                    top-1/2
                    h-5
                    w-5
                    -translate-y-1/2
                    text-gray-400
                  "
                />

                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl pl-12"
                />
              </div>
            </div>

            {/* Button */}
            <Button
              onClick={onSubmit}
              className="
                h-12
                w-full
                rounded-xl
                bg-green-700
                text-white
                hover:bg-green-800
              "
            >
              <Send className="mr-2 h-4 w-4" />
              Send Code
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200"></div>

              <span className="text-sm text-gray-400">
                or
              </span>

              <div className="h-px flex-1 bg-gray-200"></div>
            </div>

            {/* Back */}
            <button
              onClick={onBack}
              className="
                mx-auto
                flex
                items-center
                gap-2
                text-sm
                font-medium
                text-green-700
                transition
                hover:text-green-800
              "
            >
              <ArrowLeft size={16} />
              Back to Login
            </button>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}