import { useState } from "react";
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
} from "lucide-react";
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/Asidebar';

function AddStaff() {
  const [form, setForm] = useState({
    staff_id: "",
    fname: "",
    mname: "",
    lname: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.id]: e.target.value,
    });
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all required fields
    if (!form.staff_id) {
      setError("Please enter staff ID");
      return;
    }
    if (!form.fname) {
      setError("Please enter first name");
      return;
    }
    if (!form.lname) {
      setError("Please enter last name");
      return;
    }
    if (!form.email) {
      setError("Please enter email address");
      return;
    }
    if (!form.password) {
      setError("Please enter password");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await registerStaff(form);

      console.log("✅ Staff registered:", response);

      alert(response.message || "Staff registered successfully!");

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
        const firstError = Object.values(error.errors)[0];
        setError(Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        setError(error.message || "Registration failed. Please try again.");
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
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {/* Staff ID */}
                    <div className="space-y-2">
                      <Label htmlFor="staff_id">Staff ID</Label>

                <div className="relative">
                  <IdCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                  <Input
                    id="staff_id"
                    placeholder="2024-00001"
                    value={form.staff_id}
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
                    placeholder="student@example.com"
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
                    placeholder="John"
                    value={form.fname}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Middle Name */}
              <div className="space-y-2">
                <Label htmlFor="mname">Middle Name</Label>

                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                  <Input
                    id="mname"
                    placeholder="Optional"
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
                    placeholder="Doe"
                    value={form.lname}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>


              {/* Password */}
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="password">Password</Label>

                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={form.password}
                    onChange={handleChange}
                    className="pl-10"
                    minLength={6}
                    required
                  />
                </div>
              </div>
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