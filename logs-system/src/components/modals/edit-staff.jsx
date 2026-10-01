import { useState, useEffect } from 'react';
import { X, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateStaff } from '../../api/staffApi';
import { toast } from "sonner";
import { validateTextInput, autoCapitalize, validateEmail, formatStaffId } from '@/utils/validation';

export default function EditStaffDialog({ isOpen, onClose, staff, onStaffUpdated }) {
  const [formData, setFormData] = useState({
    staff_id: '',
    fname: '',
    mname: '',
    lname: '',
    email: '',
    status: 'Active',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (staff) {
      setFormData({
        staff_id: staff.staff_id || '',
        fname: autoCapitalize(staff.fname || ''),
        mname: autoCapitalize(staff.mname || ''),
        lname: autoCapitalize(staff.lname || ''),
        email: staff.email || '',
        status: staff.status || 'Active',
      });
      setError(""); 
      setErrors({});
      setTouched({});
    }
  }, [staff]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    if (["fname", "mname", "lname"].includes(name)) {
      processedValue = autoCapitalize(value);
    } else if (name === "staff_id") {
      processedValue = formatStaffId(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    setError("");
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
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
        const validation = validateTextInput(formData[field], {
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
        if (formData[field]) {
          const validation = validateTextInput(formData[field], {
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
        if (!formData.email) {
          fieldError = "Email is required";
        } else if (!validateEmail(formData.email)) {
          fieldError = "Please enter a valid email address";
        }
        break;

      case "staff_id":
        if (!formData.staff_id) {
          fieldError = "Staff ID is required";
        }
        break;
    }

    if (fieldError) {
      setErrors({ ...errors, [field]: fieldError });
    }

    return !fieldError;
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(""); // Clear error when selection changes
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const fieldsToValidate = ["staff_id", "fname", "lname", "email"];
    let isValid = true;

    fieldsToValidate.forEach((field) => {
      if (!validateField(field)) {
        isValid = false;
      }
    });

    setTouched({
      staff_id: true,
      fname: true,
      lname: true,
      email: true,
    });

    if (!isValid) {
      toast.error("Please fix all validation errors before submitting");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await updateStaff(staff.id, formData);
      console.log("✅ Staff updated:", response);
      
      toast.success(response.message || "Staff member updated successfully!");
      
      // Notify parent component to refresh data
      if (onStaffUpdated) {
        onStaffUpdated();
      }
      
      onClose();
    } catch (err) {
      console.error("❌ Error updating staff:", err);
      
      // Handle validation errors
      if (err.errors) {
        const firstError = Object.values(err.errors)[0];
        const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        const errorMessage = err.message || "Failed to update staff member";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Edit Staff Member</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

             {/* Staff ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Staff ID
              </label>
              <Input
                type="text"
                name="staff_id"
                value={formData.staff_id}
                placeholder="Enter staff ID"
                className="bg-gray-100 cursor-not-allowed"
                readOnly
                disabled
              />
            </div>
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <Input
                type="text"
                name="fname"
                value={formData.fname}
                onChange={handleInputChange}
                placeholder="Enter first name"
              />
            </div>
             {/* Middle Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Middle Name <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <Input
                type="text"
                name="mname"
                value={formData.mname}
                onChange={handleInputChange}
                placeholder="Enter middle name (Optional)"
              />
            </div>

 {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <Input
                type="text"
                name="lname"
                value={formData.lname}
                onChange={handleInputChange}
                placeholder="Enter last name"
              />
            </div>



            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
              />
            </div>

           

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#15592F] hover:bg-[#124b28]"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}