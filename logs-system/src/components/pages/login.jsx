import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Image1 from "@/assets/login.png";
import Image2 from "@/assets/nwssu 1.png";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import ForgotPass from "@/components/modals/forgot-pass";
import VerifyOtpDialog from "@/components/modals/otp-dialog";
import CreateNewPasswordDialog from "@/components/modals/new-password";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [showNewPasswordDialog, setShowNewPasswordDialog] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  const handleForgotSubmit = () => {
    // Replace with your actual forgot password logic
    console.log("Send reset code to:", forgotEmail);
    
    // Close forgot password dialog and open OTP dialog
    setShowForgotPassword(false);
    setShowOtpDialog(true);
  };

  const handleOtpVerify = () => {
    // OTP verified successfully, close OTP dialog and open new password dialog
    console.log("OTP verified successfully");
    setShowOtpDialog(false);
    setShowNewPasswordDialog(true);
  };

  const handleOtpBack = () => {
    // Close OTP dialog and go back to login
    setShowOtpDialog(false);
  };

  const handlePasswordSuccess = () => {
    // Password reset successful, close all dialogs
    console.log("Password reset successfully");
    setShowNewPasswordDialog(false);
    // You can add a success message or redirect here
  };

  const handlePasswordBack = () => {
    // Close new password dialog and go back to login
    setShowNewPasswordDialog(false);
  };

  return (
    <div className="flex min-h-screen">
      {/* MOBILE VIEW - Full width login card */}
      <div className="flex flex-1 items-center justify-center bg-gray-100 p-4 lg:hidden">
        <Card className="w-full max-w-md rounded-2xl border border-gray-300 shadow-sm">
          <CardContent className="p-6">
            {/* Header - Mobile */}
            <div className="mb-6 flex flex-col items-center">
              <img
                src="/user.jpg"
                alt="Login Visual"
                className="mb-3 h-16 w-16 rounded-full"
              />
              <h2 className="text-xl font-bold">Login</h2>
            </div>

            {/* Email Field - Mobile */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium">Email</label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <Input
                  type="email"
                  placeholder="admin@nwssu.edu.ph"
                  className="h-10 pl-10"
                />
              </div>
            </div>

            {/* Password Field - Mobile */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium">Password</label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  className="h-10 pl-10 pr-10"
                />
                {showPassword ? (
                  <EyeOff
                    size={18}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(false)}
                  />
                ) : (
                  <Eye
                    size={18}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(true)}
                  />
                )}
              </div>
            </div>

            {/* Remember Me & Forgot Password - Mobile */}
            <div className="mb-5 flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember-mobile" />
                <label htmlFor="remember-mobile" className="text-sm">
                  Remember me
                </label>
              </div>

              <button
                type="button"
                className="text-sm text-green-700 font-bold hover:underline"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Button & Register Link - Mobile */}
            <div className="flex flex-col items-center gap-3">
              <Button
                className="h-10 w-full bg-green-800 hover:bg-green-900"
                onClick={() => (window.location.href = "/dashboard")}
              >
                <Link to="/dashboard" className="w-full text-center">
                  Login
                </Link>
              </Button>
              <p className="text-sm">
                Don't have an account?{" "}
                <Link to="/register" className="text-green-700 font-bold hover:underline">
                  Register
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <ForgotPass
          open={showForgotPassword}
          onOpenChange={setShowForgotPassword}
          email={forgotEmail}
          setEmail={setForgotEmail}
          onSubmit={handleForgotSubmit}
          onBack={() => setShowForgotPassword(false)}
        />

        <VerifyOtpDialog
          open={showOtpDialog}
          onOpenChange={setShowOtpDialog}
          email={forgotEmail}
          onBack={handleOtpBack}
          onVerify={handleOtpVerify}
        />

        <CreateNewPasswordDialog
          open={showNewPasswordDialog}
          onOpenChange={setShowNewPasswordDialog}
          onBack={handlePasswordBack}
          onSuccess={handlePasswordSuccess}
        />
      </div>

      {/* DESKTOP VIEW - Split screen layout */}
      <div className="hidden min-h-screen lg:flex lg:flex-row">
        {/* LEFT SIDE - Background with logo */}
        <div className="relative flex w-1/2">
          <img
            src={Image1}
            alt="Campus"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-green-900/70" />
          <div className="relative z-10 flex flex-col items-center justify-center px-10 text-center text-white">
            <img src={Image2} alt="Logo" className="mb-6 w-28" />
            <h1 className="text-[24px] font-bold leading-tight">
              NORTHWEST SAMAR STATE UNIVERSITY SAN JORGE CAMPUS
            </h1>
            <p className="mt-3 text-[20px] italic tracking-widest">
              STUDENT AFFAIRS AND SERVICES
            </p>
          </div>
        </div>

        {/* RIGHT SIDE - Login form */}
        <div className="flex w-1/2 items-center justify-center bg-gray-100 p-6">
          <Card className="w-full max-w-md rounded-2xl border border-gray-300 shadow-sm">
            <CardContent className="p-10">
              {/* Header - Desktop */}
              <div className="mb-8 flex flex-col items-center">
                <img
                  src="/user.jpg"
                  alt="Login Visual"
                  className="mb-3 h-[70px] w-[70px] rounded-full"
                />
                <h2 className="text-[24px] font-bold">Login</h2>
              </div>

              {/* Email Field - Desktop */}
              <div className="mb-5">
                <label className="mb-2 block text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <Input
                    type="email"
                    placeholder="admin@nwssu.edu.ph"
                    className="h-11 pl-10"
                  />
                </div>
              </div>

              {/* Password Field - Desktop */}
              <div className="mb-5">
                <label className="mb-2 block text-sm font-medium">Password</label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="********"
                    className="h-11 pl-10 pr-10"
                  />
                  {showPassword ? (
                    <EyeOff
                      size={18}
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(false)}
                    />
                  ) : (
                    <Eye
                      size={18}
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(true)}
                    />
                  )}
                </div>
              </div>

              {/* Remember Me & Forgot Password - Desktop */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember-desktop" />
                  <label htmlFor="remember-desktop" className="text-sm">
                    Remember me
                  </label>
                </div>

                <button
                  type="button"
                  className="text-sm text-green-700 font-bold hover:underline"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login Button & Register Link - Desktop */}
              <div className="flex flex-col items-center gap-3">
                <Button
                  className="h-11 w-full bg-green-800 hover:bg-green-900"
                  onClick={() => (window.location.href = "/dashboard")}
                >
                <Link to="/dashboard" className="w-full text-center">
                  Login
                </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <ForgotPass
            open={showForgotPassword}
            onOpenChange={setShowForgotPassword}
            email={forgotEmail}
            setEmail={setForgotEmail}
            onSubmit={handleForgotSubmit}
            onBack={() => setShowForgotPassword(false)}
          />

          <VerifyOtpDialog
            open={showOtpDialog}
            onOpenChange={setShowOtpDialog}
            email={forgotEmail}
            onBack={handleOtpBack}
            onVerify={handleOtpVerify}
          />

          <CreateNewPasswordDialog
            open={showNewPasswordDialog}
            onOpenChange={setShowNewPasswordDialog}
            onBack={handlePasswordBack}
            onSuccess={handlePasswordSuccess}
          />
        </div>
      </div>
    </div>
  );
}

export default Login;