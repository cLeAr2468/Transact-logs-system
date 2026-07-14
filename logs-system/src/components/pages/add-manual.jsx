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
} from "lucide-react";
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/Asidebar';

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
      const response = await createMasterlistEntry(form);

      console.log(response);

      alert("Student added to masterlist successfully!");

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

      alert(
        error.message ||
          "Failed to add student to masterlist. Please try again."
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
                    <SelectItem value="BSIT">
                      BSIT - Information Technology
                    </SelectItem>

                    <SelectItem value="BSCS">
                      BSCS - Computer Science
                    </SelectItem>

                    <SelectItem value="BSIS">
                      BSIS - Information Systems
                    </SelectItem>

                    <SelectItem value="BSBA">
                      BSBA - Business Administration
                    </SelectItem>

                    <SelectItem value="BSED">
                      BSED - Secondary Education
                    </SelectItem>

                    <SelectItem value="BEED">
                      BEED - Elementary Education
                    </SelectItem>
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