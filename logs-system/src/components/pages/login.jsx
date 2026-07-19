import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Image1 from "@/assets/login.png";
import Image2 from "@/assets/nwssu 1.png";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ForgotPass from "@/components/modals/forgot-pass";
import VerifyOtpDialog from "@/components/modals/otp-dialog";
import CreateNewPasswordDialog from "@/components/modals/new-password";
import { adminLogin, forgotPassword, verifyOtp, resendOtp, resetPassword } from "@/api/adminApi";
import { toast } from "sonner";

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [showNewPasswordDialog, setShowNewPasswordDialog] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Forgot password states
  const [forgotLoading, setForgotLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    if (!password) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);

    try {
      const response = await adminLogin({ email, password });

      console.log("📥 Login response:", response);

      // Handle response structure from backend
      const responseData = response?.data ?? response;
      
      // Extract token from various possible locations
      const token =
        responseData?.token ||
        responseData?.access_token ||
        response?.token ||
        response?.access_token;

      // Extract user data
      const userData =
        responseData?.user ||
        responseData?.admin ||
        responseData?.data?.user ||
        responseData?.data?.admin ||
        responseData?.data ||
        responseData;

      // Extract role from user data
      const roleValue =
        userData?.role ||
        userData?.user_role ||
        userData?.accountType ||
        userData?.userRole ||
        responseData?.role ||
        responseData?.user_role ||
        responseData?.accountType ||
        responseData?.userRole;

      if (!token) {
        console.error("❌ No token found in response");
        throw new Error("No authentication token returned from server.");
      }

      console.log("✅ Login successful:", { 
        hasToken: !!token, 
        role: roleValue,
        userName: userData?.full_name || userData?.email 
      });

      // Store authentication data
      localStorage.setItem("token", token);
      localStorage.setItem("authToken", token);
      localStorage.setItem("admin_token", token);

      localStorage.setItem("user", JSON.stringify(userData ?? {}));
      localStorage.setItem("admin_user", JSON.stringify(userData ?? {}));

      if (roleValue) {
        localStorage.setItem("role", String(roleValue));
        localStorage.setItem("userRole", String(roleValue));
      }

      localStorage.setItem("isLoggedIn", "true");

      if (rememberMe) {
        localStorage.setItem("remember_admin", "true");
      } else {
        localStorage.removeItem("remember_admin");
      }

      toast.success(responseData?.message || response?.message || "Login successful!");

      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("❌ Login failed:", err);
      
      // Extract error message
      const errorMessage = 
        err?.message || 
        err?.error?.message || 
        err?.data?.message || 
        "Invalid email or password";
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async () => {
    if (!forgotEmail.trim()) {
      toast.error("Please enter your email");
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setForgotLoading(true);
    try {
      const response = await forgotPassword(forgotEmail);
      console.log("✅ OTP sent:", response.message);

      toast.success(response.message || "OTP sent to your email");

      setShowForgotPassword(false);
      setShowOtpDialog(true);
    } catch (err) {
      console.error("❌ Failed to send OTP:", err);
      
      // Handle email not found error
      if (err.error === 'email_not_found' || err.message?.includes('not found') || err.message?.includes('register')) {
        toast.error(
          <div>
            <p className="font-semibold">📧 Email Not Found</p>
            <p className="text-sm mt-1">{err.message || 'This email is not registered. Please register first.'}</p>
          </div>,
          { duration: 5000 }
        );
      } else {
        toast.error(err.message || "Failed to send OTP");
      }
    } finally {
      setForgotLoading(false);
    }
  };

  const handleOtpVerify = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter valid 6-digit OTP");
      return;
    }

    setOtpLoading(true);
    try {
      const response = await verifyOtp(forgotEmail, otp);
      console.log("✅ OTP verified:", response.message);

      toast.success("OTP verified successfully");

      setShowOtpDialog(false);
      setShowNewPasswordDialog(true);
    } catch (err) {
      console.error("❌ OTP verification failed:", err);
      toast.error(err.message || "Invalid OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpResend = async () => {
    try {
      const response = await resendOtp(forgotEmail);
      console.log("✅ OTP resent:", response.message);
      toast.success("OTP resent to your email");
      setOtp("");
    } catch (err) {
      console.error("❌ Failed to resend OTP:", err);
      toast.error(err.message || "Failed to resend OTP");
    }
  };

  const handleOtpBack = () => {
    setShowOtpDialog(false);
    setShowForgotPassword(true);
    setOtp("");
  };

  const handlePasswordSuccess = async () => {
    if (!newPassword) {
      toast.error("Please enter new password");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setResetLoading(true);
    try {
      const response = await resetPassword(forgotEmail, otp, newPassword, confirmPassword);
      console.log("✅ Password reset successful:", response.message);

      toast.success("Password reset successfully!");

      setShowNewPasswordDialog(false);
      setForgotEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("❌ Password reset failed:", err);
      toast.error(err.message || "Failed to reset password");
    } finally {
      setResetLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setShowOtpDialog(false);
    setShowNewPasswordDialog(false);
    setForgotEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="flex min-h-screen">
      {/* MOBILE VIEW - Full width login card */}
      <div className="flex flex-1 items-center justify-center bg-gray-100 p-4 lg:hidden">
        <Card className="w-full max-w-md rounded-2xl border border-gray-300 shadow-sm">
          <CardContent className="p-6">
            <div className="mb-6 flex flex-col items-center">
              <img
                src="/user.jpg"
                alt="Login Visual"
                className="mb-3 h-16 w-16 rounded-full"
              />
              <h2 className="text-xl font-bold">Login</h2>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

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
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  disabled={loading}
                />
              </div>
            </div>

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
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  disabled={loading}
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

            <div className="mb-5 flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember-mobile"
                  checked={rememberMe}
                  onCheckedChange={setRememberMe}
                />
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

            <div className="flex flex-col items-center gap-3">
              <Button
                className="h-10 w-full bg-green-800 hover:bg-green-900"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
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
          loading={forgotLoading}
        />

        <VerifyOtpDialog
          open={showOtpDialog}
          onOpenChange={setShowOtpDialog}
          email={forgotEmail}
          otp={otp}
          setOtp={setOtp}
          onBack={handleOtpBack}
          onVerify={handleOtpVerify}
          onResend={handleOtpResend}
          loading={otpLoading}
        />

        <CreateNewPasswordDialog
          open={showNewPasswordDialog}
          onOpenChange={setShowNewPasswordDialog}
          password={newPassword}
          setPassword={setNewPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          onBack={handleBackToLogin}
          onSuccess={handlePasswordSuccess}
          loading={resetLoading}
        />
      </div>

      <div className="hidden min-h-screen lg:flex lg:flex-row">
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

        <div className="flex w-1/2 items-center justify-center bg-gray-100 p-6">
          <Card className="w-full max-w-md rounded-2xl border border-gray-300 shadow-sm">
            <CardContent className="p-10">
              <div className="mb-8 flex flex-col items-center">
                <img
                  src="/user.jpg"
                  alt="Login Visual"
                  className="mb-3 h-[70px] w-[70px] rounded-full"
                />
                <h2 className="text-[24px] font-bold">Login</h2>
              </div>

              {error && (
                <div className="mb-5 rounded-lg bg-red-50 border border-red-200 p-3">
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
              )}

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
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    disabled={loading}
                  />
                </div>
              </div>

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
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    disabled={loading}
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

              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember-desktop"
                    checked={rememberMe}
                    onCheckedChange={setRememberMe}
                  />
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

              <div className="flex flex-col items-center gap-3">
                <Button
                  className="h-11 w-full bg-green-800 hover:bg-green-900"
                  onClick={handleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
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
            loading={forgotLoading}
          />

          <VerifyOtpDialog
            open={showOtpDialog}
            onOpenChange={setShowOtpDialog}
            email={forgotEmail}
            otp={otp}
            setOtp={setOtp}
            onBack={handleOtpBack}
            onVerify={handleOtpVerify}
            onResend={handleOtpResend}
            loading={otpLoading}
          />

          <CreateNewPasswordDialog
            open={showNewPasswordDialog}
            onOpenChange={setShowNewPasswordDialog}
            password={newPassword}
            setPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            onBack={handleBackToLogin}
            onSuccess={handlePasswordSuccess}
            loading={resetLoading}
          />
        </div>
      </div>
    </div>
  );
}

export default Login;