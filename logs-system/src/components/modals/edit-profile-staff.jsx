import { useState, useEffect } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Pencil, Loader2 } from "lucide-react";
import { updateStaffProfile } from "@/api/profileApi";
import { toast } from "sonner";

export default function EditProfileStaffDialog({
  staff,
  fullWidth = false,
  onSave,
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(staff);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setForm(staff);
  }, [staff]);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSave() {
    try {
      setLoading(true);
      setError(null);

      // Call the API to update profile
      const response = await updateStaffProfile(form);

      // Update local state with the response
      if (onSave) {
        onSave(response.staff || response.user);
      }

      toast.success("Profile updated successfully!");
      setOpen(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      setError(error.message || "Failed to update profile");
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={fullWidth ? "w-full mt-5" : "w-full mt-6"}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>

          <DialogDescription>
            Update your account information.
          </DialogDescription>
        </DialogHeader>
        {/* Form */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label>Staff ID</Label>

            <Input
              name="staff_id"
              value={form.staff_id || ''}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>

            <Input
              type="email"
              name="email"
              value={form.email || ''}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label>First Name</Label>

            <Input
              name="fname"
              value={form.fname || ''}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label>Middle Name</Label>

            <Input
              name="mname"
              value={form.mname || ''}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label>Last Name</Label>

            <Input
              name="lname"
              value={form.lname || ''}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>

            <Select
              value={form.status || 'Active'}
              onValueChange={(value) =>
                setForm({
                  ...form,
                  status: value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="Active">
                  Active
                </SelectItem>

                <SelectItem value="Inactive">
                  Inactive
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <DialogFooter className="mt-8">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
