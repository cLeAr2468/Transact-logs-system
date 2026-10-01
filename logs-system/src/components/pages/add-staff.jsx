import { useState, useMemo } from "react";
import { registerStaff } from "../../api/staffApi";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

import {
  User,
  Mail,
  Lock,
  IdCard,
  Eye,
  EyeOff,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/Asidebar';
import { toast } from "sonner";
import { 
  validatePassword, 
  validateEmail, 
  validateTextInput,
  autoCapitalize,
  getPasswordStrengthColor,
  formatStaffId,
  getPasswordErrorMessage
} from "@/utils/validation";

function AddStaff() {
  const [form, setForm] = useState({
    staff_id: "",
    fname: "",
    mname: "",
    lname: "",
    email: "",
    password: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Password validation
  const passwordValidation = useMemo(() => {
    if (!form.password) return null;
    return validatePassword(form.password);
  }, [form.password]);

  const passwordsMatch = form.password && confirmPassword && form.password === confirmPassword;

  const handleChange = (e) => {
    const { id, value } = e.target;
    
    let processedValue = value;
    if (["fname", "mname", "lname"].includes(id)) {
      processedValue = autoCapitalize(value);
    } else if (id === "staff_id") {
      processedValue = formatStaffId(value);
    }
    
    setForm({
      ...form,
      [id]: processedValue,
    });
    setError("");
    if (errors[id]) {
      setErrors({ ...errors, [id]: null });
    }
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    validateField(field);
  };

  const validateField = (field) => {
    let fieldError = null;

    switch (field) {
      case "fname":
      case "lname":
        const validation = validateTextInput(form[field], {
          minLength: 2,
          maxLength: 50,
          allowSpecialChars: false,
          required: true,
        });
        if (!validation.isValid) {
          fieldError = validation.error;
        }
        break;

      case "mname":
        if (form[field]) {
          const validation = validateTextInput(form[field], {
            minLength: 1,
            maxLength: 50,
            allowSpecialChars: false,
            required: false,
          });
          if (!validation.isValid) {
            fieldError = validation.error;
          }
        }
        break;

      case "email":
        if (!form.email) {
          fieldError = "Email is required";
        } else if (!validateEmail(form.email)) {
          fieldError = "Please enter a valid email address";
        }
        break;

      case "staff_id":
        if (!form.staff_id) {
          fieldError = "Staff ID is required";
        }
        break;

      case "password":
        if (!form.password) {
          fieldError = "Password is required";
        } else if (passwordValidation && !passwordValidation.isValid) {
          fieldError = getPasswordErrorMessage(passwordValidation);
        }
        break;

      case "confirmPassword":
        if (!confirmPassword) {
          fieldError = "Please confirm your password";
        } else if (confirmPassword !== form.password) {
          fieldError = "Passwords do not match";
        }
        break;
    }

    if (fieldError) {
      setErrors({ ...errors, [field]: fieldError });
    }

    return !fieldError;
  };

  const validateAllFields = () => {
    const fields = ["staff_id", "fname", "lname", "email", "password"];
    let isValid = true;

    fields.forEach((field) => {
      if (!validateField(field)) {
        isValid = false;
      }
    });

    // Check confirm password
    if (!confirmPassword || confirmPassword !== form.password) {
      setErrors({ ...errors, confirmPassword: "Passwords do not match" });
      isValid = false;
    }

    setTouched({
      staff_id: true,
      fname: true,
      lname: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    if (!validateAllFields()) {
      toast.error("Please fix all validation errors before submitting");
      return;
    }

    // Double-check password validation
    if (!passwordValidation || !passwordValidation.isValid) {
      const errorMsg = getPasswordErrorMessage(passwordValidation);
      toast.error(errorMsg || "Password does not meet all requirements");
      return;
    }

    if (form.password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await registerStaff(form);

      console.log("✅ Staff registered:", response);

      toast.success(response.message || "Staff registered successfully!");

      // Reset form
      setForm({
        staff_id: "",
        fname: "",
        mname: "",
        lname: "",
        email: "",
        password: "",
      });

      // Redirect to manage users page
      window.location.href = "/manage-users";
    } catch (error) {
      console.error("❌ Error registering staff:", error);
      
      // Handle validation errors
      if (error.errors) {
        // Check for specific field errors
        if (error.errors.staff_id) {
          const errorMessage = Array.isArray(error.errors.staff_id) 
            ? error.errors.staff_id[0] 
            : error.errors.staff_id;
          setError(errorMessage);
          toast.error(errorMessage);
        } else if (error.errors.email) {
          const errorMessage = Array.isArray(error.errors.email) 
            ? error.errors.email[0] 
            : error.errors.email;
          setError(errorMessage);
          toast.error(errorMessage);
        } else {
          // Get first error for other fields
          const firstError = Object.values(error.errors)[0];
          const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } else {
        const errorMessage = error.message || "Registration failed. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="w-full p-4">
            <Card className="w-full border-0 shadow-lg">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="text-2xl font-bold">
                  Staff Registration
                </CardTitle>

                <CardDescription>
                  Fill in the staff information below to create an account.
                </CardDescription>
        </CardHeader>

              <CardContent className="p-6">
                {/* Error Message */}
                {error && (
                  <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
                    <p className="text-sm text-red-600 font-medium">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Staff ID - Full Width */}
                  <div className="space-y-2 mb-5">
                    <Label htmlFor="staff_id">Staff ID <span className="text-red-500">*</span></Label>

                    <div className="relative">
                      <IdCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                      <Input
                        id="staff_id"
                        placeholder="2024-00001"
                        value={form.staff_id}
                        onChange={handleChange}
                        onBlur={() => handleBlur("staff_id")}
                        className={`pl-10 ${touched.staff_id && errors.staff_id ? "border-red-500" : ""}`}
                        required
                      />
                    </div>
                    {touched.staff_id && errors.staff_id && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <XCircle size={12} />
                        {errors.staff_id}
                      </p>
                    )}
                  </div>

                  {/* Name fields and Email - 2 Column Grid */}
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {/* First Name */}
                    <div className="space-y-2">
                      <Label htmlFor="fname">First Name <span className="text-red-500">*</span></Label>

                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                        <Input
                          id="fname"
                          placeholder="Enter First Name"
                          value={form.fname}
                          onChange={handleChange}
                          onBlur={() => handleBlur("fname")}
                          className={`pl-10 ${touched.fname && errors.fname ? "border-red-500" : ""}`}
                          required
                        />
                      </div>
                      {touched.fname && errors.fname && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <XCircle size={12} />
                          {errors.fname}
                        </p>
                      )}
                    </div>

                    {/* Middle Name */}
                    <div className="space-y-2">
                      <Label htmlFor="mname">Middle Name (Optional)</Label>

                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                        <Input
                          id="mname"
                          placeholder="Enter Middle Name (Optional)"
                          value={form.mname}
                          onChange={handleChange}
                          onBlur={() => handleBlur("mname")}
                          className={`pl-10 ${touched.mname && errors.mname ? "border-red-500" : ""}`}
                        />
                      </div>
                      {touched.mname && errors.mname && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <XCircle size={12} />
                          {errors.mname}
                        </p>
                      )}
                    </div>

                    {/* Last Name */}
                    <div className="space-y-2">
                      <Label htmlFor="lname">Last Name <span className="text-red-500">*</span></Label>

                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                        <Input
                          id="lname"
                          placeholder="Enter Last Name"
                          value={form.lname}
                          onChange={handleChange}
                          onBlur={() => handleBlur("lname")}
                          className={`pl-10 ${touched.lname && errors.lname ? "border-red-500" : ""}`}
                          required
                        />
                      </div>
                      {touched.lname && errors.lname && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <XCircle size={12} />
                          {errors.lname}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>

                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter Email Address"
                          value={form.email}
                          onChange={handleChange}
                          onBlur={() => handleBlur("email")}
                          className={`pl-10 ${touched.email && errors.email ? "border-red-500" : ""}`}
                          required
                        />
                      </div>
                      {touched.email && errors.email && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <XCircle size={12} />
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Password Section - Full Width with 2 columns */}
                  <div className="mt-6 border-t pt-6">
                    <h3 className="text-base font-semibold mb-4 text-gray-700">Password Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Password */}
                      <div className="space-y-2">
                        <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>

                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter Password"
                            value={form.password}
                            onChange={handleChange}
                            onBlur={() => handleBlur("password")}
                            className={`pl-10 pr-10 ${touched.password && errors.password ? "border-red-500" : ""}`}
                            required
                          />
                          
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>
                        </div>

                        {/* Password strength indicator */}
                        {passwordValidation && form.password && (
                          <div className="mt-2 space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="flex flex-1 gap-1">
                                {[1, 2, 3, 4, 5].map((item) => (
                                  <div
                                    key={item}
                                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                                      passwordValidation.score >= item
                                        ? getPasswordStrengthColor(passwordValidation.strength).split(" ")[1]
                                        : "bg-gray-200"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className={`text-xs font-semibold ${getPasswordStrengthColor(passwordValidation.strength).split(" ")[0]}`}>
                                {passwordValidation.strength}
                              </span>
                            </div>
                          </div>
                        )}

                        {touched.password && errors.password && (
                          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                            <XCircle size={12} />
                            {errors.password}
                          </p>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password <span className="text-red-500">*</span></Label>

                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value);
                              if (errors.confirmPassword) {
                                setErrors({ ...errors, confirmPassword: null });
                              }
                            }}
                            onBlur={() => handleBlur("confirmPassword")}
                            className={`pl-10 pr-10 ${
                              touched.confirmPassword && errors.confirmPassword 
                                ? "border-red-500" 
                                : passwordsMatch 
                                ? "border-green-500" 
                                : ""
                            }`}
                            required
                          />
                          
                          <div className="absolute right-3 top-3 flex items-center gap-1">
                            {passwordsMatch && (
                              <CheckCircle2 size={16} className="text-green-700" />
                            )}
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </button>
                          </div>
                        </div>

                        {passwordsMatch && (
                          <p className="text-xs text-green-700 mt-1 flex items-center gap-1">
                            <CheckCircle2 size={12} />
                            Passwords match
                          </p>
                        )}
                        {touched.confirmPassword && errors.confirmPassword && (
                          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                            <XCircle size={12} />
                            {errors.confirmPassword}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Password Requirements - Full Width Below Both Fields */}
                    {passwordValidation && form.password && (
                      <div className="mt-4 text-xs space-y-1 bg-blue-50 p-3 rounded border border-blue-200">
                        <p className="font-semibold text-blue-900 mb-2">Password must contain:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className={`flex items-center gap-1.5 ${passwordValidation.rules.hasMinLength ? "text-green-700" : "text-gray-600"}`}>
                            {passwordValidation.rules.hasMinLength ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                            <span>At least 8 characters</span>
                          </div>
                          <div className={`flex items-center gap-1.5 ${passwordValidation.rules.hasUppercase ? "text-green-700" : "text-gray-600"}`}>
                            {passwordValidation.rules.hasUppercase ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                            <span>One uppercase letter (A-Z)</span>
                          </div>
                          <div className={`flex items-center gap-1.5 ${passwordValidation.rules.hasLowercase ? "text-green-700" : "text-gray-600"}`}>
                            {passwordValidation.rules.hasLowercase ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                            <span>One lowercase letter (a-z)</span>
                          </div>
                          <div className={`flex items-center gap-1.5 ${passwordValidation.rules.hasNumber ? "text-green-700" : "text-gray-600"}`}>
                            {passwordValidation.rules.hasNumber ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                            <span>One number (0-9)</span>
                          </div>
                          <div className={`flex items-center gap-1.5 ${passwordValidation.rules.hasSpecialChar ? "text-green-700" : "text-gray-600"}`}>
                            {passwordValidation.rules.hasSpecialChar ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                            <span>One special character (!@#$%^&*...)</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

            <div className="mt-8 flex justify-end">
              <Button className="bg-white text-[#15592F] border border-[#15592F] hover:bg-[#124b28] hover:text-white flex items-center gap-2">
                <ArrowLeft size={16} />
                <Link to="/manage-users">
                  Back
                </Link>
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="min-width:180px bg-[#15592F] hover:bg-[#124b28] text-white flex items-center gap-2 ml-4 cursor-pointer"
              >
                {loading ? "Registering..." : "Register Staff"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  </main>
  </div>
</SidebarProvider>
  );
}

export default AddStaff;