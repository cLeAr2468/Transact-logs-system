import { useState } from "react";
import { createMasterlistEntry } from "../../api/masterlistApi";

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

import {
  User,
  Mail,
  Plus,
  GraduationCap,
  School,
  IdCard,
  XCircle,
} from "lucide-react";
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/Asidebar';
import { toast } from "sonner";
import { 
  validateEmail, 
  validateTextInput,
  autoCapitalize,
  formatStudentId
} from "@/utils/validation";

function AddManual() {
  const [form, setForm] = useState({
    student_id: "",
    fname: "",
    mname: "",
    lname: "",
    email: "",
    course: "",
    year_level: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { id, value } = e.target;
    
    let processedValue = value;
    
    // Apply formatting based on field type
    if (id === "student_id") {
      processedValue = formatStudentId(value);
    } else if (["fname", "mname", "lname"].includes(id)) {
      processedValue = autoCapitalize(value);
    }
    
    setForm({
      ...form,
      [id]: processedValue,
    });
    
    // Clear error when user types
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

      case "course":
      case "year_level":
        if (!form[field]) {
          error = `${field === "year_level" ? "Year level" : "Course"} is required`;
        }
        break;
    }

    if (error) {
      setErrors({ ...errors, [field]: error });
    }

    return !error;
  };

  const validateAllFields = () => {
    const fields = ["student_id", "fname", "lname", "email", "course", "year_level"];
    let isValid = true;

    fields.forEach((field) => {
      if (!validateField(field)) {
        isValid = false;
      }
    });

    setTouched({
      student_id: true,
      fname: true,
      lname: true,
      email: true,
      course: true,
      year_level: true,
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

    setLoading(true);

    try {
      const response = await createMasterlistEntry(form);

      console.log(response);

      toast.success("Student added to masterlist successfully!");

      setForm({
        student_id: "",
        fname: "",
        mname: "",
        lname: "",
        email: "",
        course: "",
        year_level: "",
      });

      window.location.href = "/master-list";
    } catch (error) {
      console.error(error);

      // Handle validation errors
      if (error.errors) {
        // Check for specific field errors
        if (error.errors.student_id) {
          const errorMessage = Array.isArray(error.errors.student_id) 
            ? error.errors.student_id[0] 
            : error.errors.student_id;
          toast.error(errorMessage);
        } else if (error.errors.email) {
          const errorMessage = Array.isArray(error.errors.email) 
            ? error.errors.email[0] 
            : error.errors.email;
          toast.error(errorMessage);
        } else {
          // Get first error for other fields
          const firstError = Object.values(error.errors)[0];
          const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
          toast.error(errorMessage);
        }
      } else {
        toast.error(
          error.message ||
            "Failed to add student to masterlist. Please try again."
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
                  Add Manual Master List
          </CardTitle>

          <CardDescription>
            Fill in the  information below to add new master list.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit}>
             <div className="space-y-2 mb-4">
                <Label htmlFor="student_id">Student ID</Label>

                <div className="relative">
                  <IdCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                  <Input
                    id="student_id"
                    placeholder="2024-00001"
                    value={form.student_id}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Student ID */}
             

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
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>

                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter Email Address"
                    value={form.email}
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

            <div className="mt-8 flex justify-end">
              <Button className="bg-white text-[#15592F] border border-[#15592F] hover:bg-[#124b28] hover:text-white flex items-center gap-2 cursor-pointer">
                <ArrowLeft size={16} />
                <Link to="/master-list">
                  Back
                </Link>
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="min-width:180px bg-[#15592F] hover:bg-[#124b28] text-white flex items-center gap-2 ml-4 cursor-pointer"
              >
                <Plus size={16} />
                {loading ? "Registering..." : "Add Manual"}
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

export default AddManual;