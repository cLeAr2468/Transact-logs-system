import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useState, useEffect } from "react";
import EditProfileDialog from "@/components/modals/edit-profile";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Avatar,
    AvatarImage,
    AvatarFallback,
} from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/Asidebar";

import {
    Mail,
    Loader2,
    IdCard,
    Key,
    Eye,
    EyeOff,
} from "lucide-react";

import { getProfile } from "@/api/profileApi";
import { changeStaffPassword } from "@/api/adminApi";
import { toast } from "sonner";

export default function ProfileDisplay() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState("");

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getProfile();
            setUser(response.user || response.staff);
        } catch (error) {
            console.error("Failed to load profile:", error);
            setError(error.message || "Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm((prev) => ({
            ...prev,
            [name]: value,
        }));
        setPasswordError(""); // Clear error when user types
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordError("");

        // Validation
        if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            setPasswordError("Please fill in all fields.");
            return;
        }

        const hasLength = passwordForm.newPassword.length >= 6;
        
        if (!hasLength) {
            setPasswordError("New password must be at least 6 characters.");
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError("New password and confirm password do not match.");
            return;
        }

        if (passwordForm.currentPassword === passwordForm.newPassword) {
            setPasswordError("New password must be different from current password.");
            return;
        }

        try {
            setPasswordLoading(true);
            
            const response = await changeStaffPassword(
                passwordForm.currentPassword, 
                passwordForm.newPassword
            );
            
            toast.success(response.message || "Password changed successfully!");
            
            // Reset form and hide
            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
            setShowPasswordForm(false);
        } catch (err) {
            console.error("Failed to change password:", err);
            const errorMessage = err.message || "Failed to change password. Please try again.";
            setPasswordError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setPasswordLoading(false);
        }
    };

    if (loading) {
        return (
            <SidebarProvider>
                <div className="flex h-screen w-full">
                    <AppSidebar />
                    <main className="flex-1 overflow-auto">
                        <div className="flex items-center justify-center h-[60vh]">
                            <Loader2 className="w-8 h-8 animate-spin text-green-700" />
                        </div>
                    </main>
                </div>
            </SidebarProvider>
        );
    }

    if (error || !user) {
        return (
            <SidebarProvider>
                <div className="flex h-screen w-full">
                    <AppSidebar />
                    <main className="flex-1 overflow-auto">
                        <div className="flex items-center justify-center h-[60vh]">
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

    const initials = `${user.firstname?.charAt(0) ?? ""}${user.lastname?.charAt(0) ?? ""
        }`.toUpperCase();

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
                                                    src={user.profile}
                                                    alt={`${user.firstname} ${user.lastname}`}
                                                />

                                                <AvatarFallback className="bg-green-700 text-white text-5xl font-bold">
                                                    {initials}
                                                </AvatarFallback>
                                            </Avatar>

                                            <h2 className="mt-4 text-2xl font-bold text-center">
                                                {user.firstname} {user.middlename} {user.lastname}
                                            </h2>

                                            <Badge className="mt-3 bg-green-100 text-green-700">{user.status || 'Active'}</Badge>

                                            <EditProfileDialog
                                                user={user}
                                                onSave={setUser}
                                            />
                                        </div>

                                        {/* RIGHT */}

                                        <div className="flex-1">
                                            <Card className="border-none shadow-none">
                                                <CardHeader className="flex flex-row items-center justify-between">
                                                    <CardTitle>Personal Information</CardTitle>
                                                    <Button
                                                        onClick={() => setShowPasswordForm(!showPasswordForm)}
                                                        variant={showPasswordForm ? "destructive" : "default"}
                                                        size="sm"
                                                    >
                                                        <Key className="mr-2 h-4 w-4" />
                                                        {showPasswordForm ? "Cancel" : "Change Password"}
                                                    </Button>
                                                </CardHeader>

                                                <CardContent>
                                                    <div className="grid grid-cols-2 gap-6">
                                                        <Info
                                                            icon={<IdCard size={18} />}
                                                            label="Staff ID"
                                                            value={user.staff_id || 'N/A'}
                                                        />
                                                        <Info
                                                            icon={<Mail size={18} />}
                                                            label="Email"
                                                            value={user.email}
                                                        />
                                                    </div>

                                                    {/* Password Change Form */}
                                                    {showPasswordForm && (
                                                        <div className="mt-8 pt-6 border-t">
                                                            <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                                                            
                                                            {passwordError && (
                                                                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3">
                                                                    <p className="text-sm text-red-600 font-medium">{passwordError}</p>
                                                                </div>
                                                            )}

                                                            <form onSubmit={handleChangePassword} className="space-y-4">
                                                                <div>
                                                                    <label className="block text-sm font-medium mb-2">
                                                                        Current Password
                                                                    </label>
                                                                    <Input
                                                                        type="password"
                                                                        name="currentPassword"
                                                                        value={passwordForm.currentPassword}
                                                                        onChange={handlePasswordChange}
                                                                        placeholder="Enter current password"
                                                                        disabled={passwordLoading}
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <label className="block text-sm font-medium mb-2">
                                                                        New Password
                                                                    </label>
                                                                    <Input
                                                                        type="password"
                                                                        name="newPassword"
                                                                        value={passwordForm.newPassword}
                                                                        onChange={handlePasswordChange}
                                                                        placeholder="Enter new password"
                                                                        disabled={passwordLoading}
                                                                    />
                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                        Must be at least 6 characters
                                                                    </p>
                                                                </div>

                                                                <div>
                                                                    <label className="block text-sm font-medium mb-2">
                                                                        Confirm New Password
                                                                    </label>
                                                                    <Input
                                                                        type="password"
                                                                        name="confirmPassword"
                                                                        value={passwordForm.confirmPassword}
                                                                        onChange={handlePasswordChange}
                                                                        placeholder="Confirm new password"
                                                                        disabled={passwordLoading}
                                                                    />
                                                                </div>

                                                                <Button
                                                                    type="submit"
                                                                    className="w-full"
                                                                    disabled={passwordLoading}
                                                                >
                                                                    {passwordLoading ? (
                                                                        <>
                                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                            Changing...
                                                                        </>
                                                                    ) : (
                                                                        "Change Password"
                                                                    )}
                                                                </Button>
                                                            </form>
                                                        </div>
                                                    )}
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
                                                src={user.profile}
                                                alt={`${user.firstname} ${user.middlename} ${user.lastname}`}
                                            />

                                            <AvatarFallback className="bg-green-700 text-white text-4xl font-bold w-full">
                                                {initials}
                                            </AvatarFallback>
                                        </Avatar>

                                        <h2 className="mt-4 text-xl font-bold text-center">
                                            {user.firstname} {user.middlename} {user.lastname}
                                        </h2>

                                        <Badge className="mt-3 bg-green-100 text-green-700">{user.status || 'Active'}</Badge>

                                        <EditProfileDialog
                                            user={user}
                                            onSave={setUser}
                                        />

                                        <Separator className="my-6" />

                                        <div className="space-y-5 w-full">
                                            <Info
                                                icon={<IdCard size={18} />}
                                                label="Staff ID"
                                                value={user.staff_id || 'N/A'}
                                            />

                                            <Info
                                                icon={<Mail size={18} />}
                                                label="Email"
                                                value={user.email}
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
