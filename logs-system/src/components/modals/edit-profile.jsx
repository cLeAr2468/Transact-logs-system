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

import { Pencil, Loader2, XCircle } from "lucide-react";
import { updateProfile } from "@/api/profileApi";
import { toast } from "sonner";
import { validateTextInput, autoCapitalize } from "@/utils/validation";

export default function EditProfileDialog({
  user,
  fullWidth = false,
  onSave,
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    setForm(user);
  }, [user]);

  const initials = `${form.firstname?.charAt(0) ?? ""}${
    form.lastname?.charAt(0) ?? ""
  }`.toUpperCase();

  // Get the user ID (can be staff_id for staff or admin_id for admin)
  const userId = form.staff_id || form.admin_id || "";

  function handleChange(e) {
    const { name, value } = e.target;

    let processedValue = value;

    // Apply auto-capitalization to name fields
    if (["firstname", "middlename", "lastname"].includes(name)) {
      processedValue = autoCapitalize(value);
    }

    setForm((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  }

  function handleBlur(field) {
    setTouched({ ...touched, [field]: true });
    validateField(field);
  }

  function validateField(field) {
    let fieldError = null;

    switch (field) {
      case "firstname":
      case "lastname":
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

      case "middlename":
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
    }

    if (fieldError) {
      setErrors({ ...errors, [field]: fieldError });
    }

    return !fieldError;
  }

  async function handleSave() {
    // Validate all name fields
    const fieldsToValidate = ["firstname", "lastname"];
    let isValid = true;

    fieldsToValidate.forEach((field) => {
      if (!validateField(field)) {
        isValid = false;
      }
    });

    // Mark all fields as touched
    setTouched({
      firstname: true,
      lastname: true,
      middlename: true,
    });

    if (!isValid) {
      toast.error("Please fix all validation errors before saving");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Call the API to update profile
      const response = await updateProfile(form);

      // Update local state with the response
      if (onSave) {
        onSave(response.user);
      }

      toast.success("Profile updated successfully!");
      setOpen(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      const errorMessage = error.message || "Failed to update profile";
      setError(errorMessage);
      toast.error(errorMessage);
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

      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>

          <DialogDescription>
            Update your account information.
          </DialogDescription>
        </DialogHeader>
        {/* Form */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label>User ID</Label>

            <Input
              name="user_id"
              value={userId}
              readOnly
              className="bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>

            <Input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              readOnly
              className="bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <Label>First Name <span className="text-red-500">*</span></Label>

            <Input
              name="firstname"
              value={form.firstname}
              onChange={handleChange}
              onBlur={() => handleBlur("firstname")}
              className={touched.firstname && errors.firstname ? "border-red-500" : ""}
            />
            {touched.firstname && errors.firstname && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <XCircle size={12} />
                {errors.firstname}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Middle Name (Optional)</Label>

            <Input
              name="middlename"
              placeholder="Middle Name (Optional)"
              value={form.middlename || ""}
              onChange={handleChange}
              onBlur={() => handleBlur("middlename")}
              className={touched.middlename && errors.middlename ? "border-red-500" : ""}
            />
            {touched.middlename && errors.middlename && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <XCircle size={12} />
                {errors.middlename}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Last Name <span className="text-red-500">*</span></Label>

            <Input
              name="lastname"
              value={form.lastname}
              onChange={handleChange}
              onBlur={() => handleBlur("lastname")}
              className={touched.lastname && errors.lastname ? "border-red-500" : ""}
            />
            {touched.lastname && errors.lastname && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <XCircle size={12} />
                {errors.lastname}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Role</Label>

            <Input
              name="role"
              value={form.role || ""}
              readOnly
              className="bg-gray-100 cursor-not-allowed"
            />
          </div>
        </div>

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
