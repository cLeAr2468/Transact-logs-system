import { useState, useMemo } from "react";
import api from "../../api";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AddressSelector from "@/components/common/AddressSelector";

import {
  User,
  Mail,
  Lock,
  GraduationCap,
  School,
  IdCard,
  XCircle,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/Asidebar';
import { toast } from "sonner";
import { 
  validatePassword, 
  validateEmail, 
  validateTextInput,
  autoCapitalize,
  formatStudentId,
  getPasswordStrengthColor,
  getPasswordErrorMessage
} from "@/utils/validation";

function Register() {
  const [form, setForm] = useState({
    student_id: "",
    fname: "",
    mname: "",
    lname: "",
    email: "",
    barangay: "",
    municipality: "",
    province: "",
    course: "",
    year_level: "",
    password: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingStudent, setFetchingStudent] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Password validation
  const passwordValidation = useMemo(() => {
    if (!form.password) return null;
    return validatePassword(form.password);
  }, [form.password]);

  const passwordsMatch = form.password && confirmPassword && form.password === confirmPassword;

  // Fetch student data from masterlist when student ID is entered
  const handleStudentIdBlur = async () => {
    if (!form.student_id || form.student_id.trim() === "") return;

    setFetchingStudent(true);
    try {
      const response = await api.get(`/masterlist/student/${form.student_id}`);
      const student = response.data.student;

      // Auto-fill form with masterlist data and apply capitalization
      setForm({
        ...form,
        fname: autoCapitalize(student.fname || ""),
        mname: autoCapitalize(student.mname || ""),
        lname: autoCapitalize(student.lname || ""),
        email: student.email || "",
        course: student.course || "",
        year_level: student.year_level || "",
      });

      toast.success("Student information loaded from masterlist!");
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error("Student ID not found in masterlist. Please contact the administrator.");
      } else {
        toast.error("Failed to fetch student information");
      }
      // Don't clear the student_id, but clear other fields if student not found
      setForm({
        ...form,
        fname: "",
        mname: "",
        lname: "",
        email: "",
        course: "",
        year_level: "",
      });
    } finally {
      setFetchingStudent(false);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    
    let processedValue = value;
    
    // Apply formatting based on field type
    if (id === "student_id") {
      processedValue = formatStudentId(value);
    } else if (["fname", "mname", "lname"].includes(id)) {
      // Auto-capitalize names as user types
      processedValue = autoCapitalize(value);
    }

    setForm({
      ...form,
      [id]: processedValue,
    });

    // Clear error when user starts typing
    if (errors[id]) {
      setErrors({ ...errors, [id]: null });
    }
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    validateField(field);
  };

  const validateField = (field) => {
    let error = null;

    switch (field) {
      case "student_id":
        if (!form.student_id) {
          error = "Student ID is required";
        }
        break;
      
      case "fname":
      case "lname":
        const validation = validateTextInput(form[field], {
          minLength: 2,
          maxLength: 50,
          allowSpecialChars: false,
          required: true,
        });
        if (!validation.isValid) {
          error = validation.error;
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
            error = validation.error;
          }
        }
        break;

      case "email":
        if (!form.email) {
          error = "Email is required";
        } else if (!validateEmail(form.email)) {
          error = "Please enter a valid email address";
        }
        break;

      case "password":
        if (!form.password) {
          error = "Password is required";
        } else if (passwordValidation && !passwordValidation.isValid) {
          error = getPasswordErrorMessage(passwordValidation);
        }
        break;

      case "confirmPassword":
        if (!confirmPassword) {
          error = "Please confirm your password";
        } else if (confirmPassword !== form.password) {
          error = "Passwords do not match";
        }
        break;

      case "course":
      case "year_level":
        if (!form[field]) {
          error = `${field === "year_level" ? "Year level" : "Course"} is required`;
        }
        break;

      case "province":
      case "municipality":
      case "barangay":
        if (!form[field]) {
          error = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        }
        break;
    }

    if (error) {
      setErrors({ ...errors, [field]: error });
    }

    return !error;
  };

  const validateAllFields = () => {
    const fields = [
      "student_id",
      "fname",
      "lname",
      "email",
      "course",
      "year_level",
      "province",
      "municipality",
      "barangay",
      "password",
    ];

    let isValid = true;
    const newErrors = {};

    fields.forEach((field) => {
      if (!validateField(field)) {
        isValid = false;
      }
    });

    // Check confirm password separately
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (confirmPassword !== form.password) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors({ ...errors, ...newErrors });
    setTouched({
      student_id: true,
      fname: true,
      lname: true,
      email: true,
      course: true,
      year_level: true,
      province: true,
      municipality: true,
      barangay: true,
      password: true,
      confirmPassword: true,
    });

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields first
    if (!validateAllFields()) {
      toast.error("Please fix all validation errors before submitting");
      return;
    }

    // Validate password match (double-check)
    if (form.password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    // Validate password requirements (double-check)
    if (!passwordValidation || !passwordValidation.isValid) {
      const errorMsg = getPasswordErrorMessage(passwordValidation);
      toast.error(errorMsg || "Password does not meet all requirements!");
      return;
    }

    // Debug: Log form data before submitting
    console.log("=== FORM DATA BEFORE SUBMIT ===");
    console.log("Province:", form.province);
    console.log("Municipality:", form.municipality);
    console.log("Barangay:", form.barangay);
    console.log("Full form:", form);
    console.log("================================");

    setLoading(true);

    try {
      const response = await api.post("/register", form);

      console.log(response.data);

      toast.success("Registered successfully!");

      setForm({
        student_id: "",
        fname: "",
        mname: "",
        lname: "",
        email: "",
        barangay: "",
        municipality: "",
        province: "",
        course: "",
        year_level: "",
        password: "",
      });
      setConfirmPassword("");
      setErrors({});
      setTouched({});

      window.location.href = "/Client-register";
    } catch (error) {
      console.error(error.response?.data);

      // Handle validation errors
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        
        // Check for specific field errors
        if (errors.student_id) {
          const errorMessage = Array.isArray(errors.student_id) 
            ? errors.student_id[0] 
            : errors.student_id;
          toast.error(errorMessage);
        } else if (errors.email) {
          const errorMessage = Array.isArray(errors.email) 
            ? errors.email[0] 
            : errors.email;
          toast.error(errorMessage);
        } else {
          // Get first error for other fields
          const firstError = Object.values(errors)[0];
          const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
          toast.error(errorMessage);
        }
      } else {
        toast.error(
          error.response?.data?.message ||
          "Registration failed. Please try again."
        );
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
                  Client Registration
                </CardTitle>

                <CardDescription>
                  Fill in the client information below to create an account.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6">
                <form onSubmit={handleSubmit}>
                  {/* Student ID */}
                    <div className="space-y-2 mb-4">
                      <Label htmlFor="student_id">Student ID</Label>

                      <div className="relative">
                        <IdCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                        <Input
                          id="student_id"
                          placeholder="2024-00001"
                          value={form.student_id}
                          onChange={handleChange}
                          onBlur={handleStudentIdBlur}
                          disabled={fetchingStudent}
                          className="pl-10"
                          required
                        />
                      </div>
                      {fetchingStudent && (
                        <p className="text-xs text-gray-500 mt-1">
                          Loading student information from masterlist...
                        </p>
                      )}
                    </div>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>

                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter Email"
                          value={form.email}
                          onChange={handleChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    {/* First Name */}
                    <div className="space-y-2">
                      <Label htmlFor="fname">First Name</Label>

                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                        <Input
                          id="fname"
                          placeholder="Enter First Name"
                          value={form.fname}
                          onChange={handleChange}
                          className="pl-10"
                          required
                        />
                      </div>
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
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Last Name */}
                    <div className="space-y-2">
                      <Label htmlFor="lname">Last Name</Label>

                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                        <Input
                          id="lname"
                          placeholder="Enter Last Name"
                          value={form.lname}
                          onChange={handleChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    {/* Course */}
                    <div className="space-y-2">
                      <Label>Course</Label>

                      <Select
                        value={form.course}
                        onValueChange={(value) =>
                          setForm({ ...form, course: value })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Select Course" />
                          </div>
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="BEED">BEED</SelectItem>
                          <SelectItem value="BSIT">BSIT</SelectItem>
                          <SelectItem value="BTLED">BTLED</SelectItem>
                          <SelectItem value="BSABE">BSABE</SelectItem>
                          <SelectItem value="BSCRIM">BSCRIM</SelectItem>
                          <SelectItem value="BAT">BSA</SelectItem>
                          <SelectItem value="BAT">BAT</SelectItem>
                          <SelectItem value="BAT">BSF</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Year Level */}
                    <div className="space-y-2">
                      <Label>Year Level</Label>

                      <Select
                        value={form.year_level}
                        onValueChange={(value) =>
                          setForm({ ...form, year_level: value })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <div className="flex items-center gap-2">
                            <School className="h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Select Year Level" />
                          </div>
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="1">
                            1
                          </SelectItem>

                          <SelectItem value="2">
                            2
                          </SelectItem>

                          <SelectItem value="3">
                            3
                          </SelectItem>

                          <SelectItem value="4">
                            4
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Address Selector - Full Width */}
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold mb-3">Address Information</h3>
                    <AddressSelector
                      province={form.province}
                      municipality={form.municipality}
                      barangay={form.barangay}
                      onProvinceChange={(value) =>
                        setForm({ ...form, province: value, municipality: "", barangay: "" })
                      }
                      onMunicipalityChange={(value) =>
                        setForm({ ...form, municipality: value, barangay: "" })
                      }
                      onBarangayChange={(value) => 
                        setForm({ ...form, barangay: value })
                      }
                      required={true}
                      layout="grid"
                    />
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
                      <Link to="/manage-client">
                        Back
                      </Link>
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="min-width:180px bg-[#15592F] hover:bg-[#124b28] text-white flex items-center gap-2 ml-4 cursor-pointer"
                    >
                      {loading ? "Registering..." : "Register Student"}
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

export default Register;