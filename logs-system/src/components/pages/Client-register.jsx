import { useState } from "react";
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

import {
  User,
  Mail,
  Lock,
  GraduationCap,
  School,
  IdCard,
} from "lucide-react";
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/Asidebar';
import { toast } from "sonner";

function Register() {
  const [form, setForm] = useState({
    student_id: "",
    fname: "",
    mname: "",
    lname: "",
    email: "",
    course: "",
    year_level: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
        course: "",
        year_level: "",
        password: "",
      });

      window.location.href = "/Client-register";
    } catch (error) {
      console.error(error.response?.data);

      toast.error(
        error.response?.data?.message ||
        "Registration failed. Please try again."
      );
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
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {/* Student ID */}
                    <div className="space-y-2">
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
                          <SelectItem value="1st Year">
                            1st Year
                          </SelectItem>

                          <SelectItem value="2nd Year">
                            2nd Year
                          </SelectItem>

                          <SelectItem value="3rd Year">
                            3rd Year
                          </SelectItem>

                          <SelectItem value="4th Year">
                            4th Year
                          </SelectItem>
                        </SelectContent>
                      </Select>
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