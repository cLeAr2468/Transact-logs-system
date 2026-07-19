import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useState, useEffect } from "react";
import EditProfileStaffDialog from "@/components/modals/edit-profile-staff";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Avatar,
    AvatarImage,
    AvatarFallback,
} from "@/components/ui/avatar";

import {
    Mail,
    User,
    Loader2,
    IdCard,
} from "lucide-react";

import { getStaffProfile } from "@/api/profileApi";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/Asidebar";

export default function ProfileDisplay() {
    const [staff, setStaff] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch staff profile on component mount
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getStaffProfile();
            console.log('✅ Staff profile loaded:', response);
            setStaff(response.staff || response.user);
        } catch (error) {
            console.error("Failed to load profile:", error);
            setError(error.message || "Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    // Show loading state
    if (loading) {
        return (
            <SidebarProvider>
                <div className="flex h-screen w-full">
                    <AppSidebar />
                    <main className="flex-1 overflow-auto">
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="w-8 h-8 animate-spin text-green-700" />
                        </div>
                    </main>
                </div>
            </SidebarProvider>
        );
    }

    // Show error state if no staff data
    if (error || !staff) {
        return (
            <SidebarProvider>
                <div className="flex h-screen w-full">
                    <AppSidebar />
                    <main className="flex-1 overflow-auto">
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <p className="text-red-500 mb-2">{error || "Failed to load profile data"}</p>
                                <button 
                                    onClick={fetchProfile}
                                    className="text-green-700 hover:underline"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    </main>
                </div>
            </SidebarProvider>
        );
    }

    // Generate initials
    const initials = `${staff.fname?.charAt(0) ?? ""}${staff.lname?.charAt(0) ?? ""}`.toUpperCase();

    return (
        <SidebarProvider>
            <div className="flex h-screen w-full">
                <AppSidebar />
                <main className="flex-1 overflow-auto bg-gray-50">
                    <div className="w-full lg:p-8 p-4">

                        {/*DESKTOP VIEW */}
                        <div className="hidden lg:block">
                            <Card className="overflow-hidden rounded-3xl border-0 shadow-xl">
                                <div className="h-40 bg-green-950/70" />

                                <CardContent className="-mt-24">
                                    <div className="flex gap-8">
                                        {/* LEFT */}

                                        <div className="w-72 flex flex-col items-center">
                                            <Avatar className="w-40 h-40 border-8 border-white shadow-xl">
                                                <AvatarImage
                                                    src={staff.profile || "/user.jpg"}
                                                    alt={`${staff.fname} ${staff.lname}`}
                                                />

                                                <AvatarFallback className="bg-green-700 text-white text-5xl font-bold">
                                                    {initials}
                                                </AvatarFallback>
                                            </Avatar>

                                            <h2 className="mt-4 text-2xl font-bold text-center">
                                                {staff.fname} {staff.mname} {staff.lname}
                                            </h2>


                                            <Badge className="mt-3 bg-green-100 text-green-700">{staff.status || 'Active'}</Badge>

                                            <EditProfileStaffDialog
                                                staff={staff}
                                                onSave={setStaff}
                                            />
                                        </div>

                                        {/* RIGHT */}

                                        <div className="flex-1">
                                            <Card className="border-none shadow-none">
                                                <CardHeader>
                                                    <CardTitle>Personal Information</CardTitle>
                                                </CardHeader>

                                                <CardContent>
                                                    <div className="grid grid-cols-2 gap-6">
                                                        <Info
                                                            icon={<IdCard size={18} />}
                                                            label="Staff ID"
                                                            value={staff.staff_id || 'N/A'}
                                                        />

                                                        <Info
                                                            icon={<Mail size={18} />}
                                                            label="Email"
                                                            value={staff.email || 'N/A'}
                                                        />

                                                        <Info
                                                            icon={<User size={18} />}
                                                            label="First Name"
                                                            value={staff.fname || 'N/A'}
                                                        />

                                                        <Info
                                                            icon={<User size={18} />}
                                                            label="Middle Name"
                                                            value={staff.mname || 'N/A'}
                                                        />

                                                        <Info
                                                            icon={<User size={18} />}
                                                            label="Last Name"
                                                            value={staff.lname || 'N/A'}
                                                        />

                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* MOBILE VIEW */}

                        <div className="lg:hidden">
                            <Card className="overflow-hidden rounded-3xl shadow-xl">
                                <div className="h-28 bg-green-950/70" />

                                <CardContent className="-mt-16">
                                    <div className="flex flex-col items-center">
                                        <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                                            <AvatarImage
                                                src={staff.profile || "/user.jpg"}
                                                alt={`${staff.fname} ${staff.mname} ${staff.lname}`}
                                            />

                                            <AvatarFallback className="bg-green-700 text-white text-4xl font-bold w-full">
                                                {initials}
                                            </AvatarFallback>
                                        </Avatar>

                                        <h2 className="mt-4 text-xl font-bold text-center">
                                            {staff.fname} {staff.mname} {staff.lname}
                                        </h2>

                                        <Badge className="mt-3 bg-green-100 text-green-700">{staff.status || 'Active'}</Badge>

                                        <EditProfileStaffDialog
                                            staff={staff}
                                            onSave={setStaff}
                                        />

                                        <Separator className="my-6" />

                                        <div className="space-y-5 w-full">
                                            <Info
                                                icon={<IdCard size={18} />}
                                                label="Staff ID"
                                                value={staff.staff_id || 'N/A'}
                                            />

                                            <Info
                                                icon={<Mail size={18} />}
                                                label="Email"
                                                value={staff.email || 'N/A'}
                                            />

                                            <Info
                                                icon={<User size={18} />}
                                                label="First Name"
                                                value={staff.fname || 'N/A'}
                                            />

                                            <Info
                                                icon={<User size={18} />}
                                                label="Middle Name"
                                                value={staff.mname || 'N/A'}
                                            />

                                            <Info
                                                icon={<User size={18} />}
                                                label="Last Name"
                                                value={staff.lname || 'N/A'}
                                            />
        
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}

function Info({ icon, label, value }) {
    return (
        <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
                {icon}
            </div>

            <div>
                <p className="text-sm text-muted-foreground">{label}</p>

                <p className="font-semibold break-words">{value}</p>
            </div>
        </div>
    );
}
