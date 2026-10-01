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
import { updateUser } from '../../api/userApi';
import { toast } from "sonner";
import AddressSelector from '@/components/common/AddressSelector';
import { validateTextInput, autoCapitalize, validateEmail, formatStudentId } from '@/utils/validation';

const EditClientDialog = ({ isOpen, onClose, client, onUserUpdated }) => {
  const [formData, setFormData] = useState({
    student_id: '',
    fname: '',
    mname: '',
    lname: '',
    email: '',
    barangay: '',
    municipality: '',
    province: '',
    course: '',
    year_level: '',
    status: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (client) {
      console.log("📝 Client data received:", client);
      setFormData({
        student_id: client.student_id || '',
        fname: autoCapitalize(client.fname || ''),
        mname: autoCapitalize(client.mname || ''),
        lname: autoCapitalize(client.lname || ''),
        email: client.email || '',
        barangay: client.barangay || '',
        municipality: client.municipality || '',
        province: client.province || '',
        course: client.course || '',
        year_level: client.year_level || '',
        status: client.status || 'Active',
      });
      setError("");
      setErrors({});
      setTouched({});
    }
  }, [client]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    if (["fname", "mname", "lname"].includes(name)) {
      processedValue = autoCapitalize(value);
    } else if (name === "student_id") {
      processedValue = formatStudentId(value);
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
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

      case "student_id":
        if (!formData.student_id) {
          fieldError = "Student ID is required";
        }
        break;

      case "course":
        if (!formData.course) {
          fieldError = "Course is required";
        }
        break;

      case "year_level":
        if (!formData.year_level) {
          fieldError = "Year level is required";
        }
        break;
    }

    if (fieldError) {
      setErrors({ ...errors, [field]: fieldError });
    }

    return !fieldError;
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(""); // Clear error when selection changes
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const fieldsToValidate = ["student_id", "fname", "lname", "email", "course", "year_level"];
    let isValid = true;

    fieldsToValidate.forEach((field) => {
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

    if (!isValid) {
      toast.error("Please fix all validation errors before submitting");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await updateUser(client.id, formData);
      console.log("✅ User updated:", response);
      
      toast.success(response.message || "User updated successfully!");
      
      // Notify parent component to refresh data
      if (onUserUpdated) {
        onUserUpdated();
      }
      
      onClose();
    } catch (err) {
      console.error("❌ Error updating user:", err);
      
      // Handle validation errors
      if (err.errors) {
        const firstError = Object.values(err.errors)[0];
        const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        const errorMessage = err.message || "Failed to update user";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center bg-black/50 z-50 justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-semibold text-gray-900">Edit Client</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-6">
              {error}
            </div>
          )}

          {/* Two Column Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student ID */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student ID
              </label>
              <Input
                type="text"
                name="student_id"
                value={formData.student_id}
                placeholder="Enter student ID"
                className="w-full bg-gray-100 cursor-not-allowed"
                readOnly
                disabled
              />
            </div>

            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="fname"
                value={formData.fname}
                onChange={handleInputChange}
                placeholder="Enter first name"
                className="w-full"
                disabled={loading}
              />
            </div>

            {/* Middle Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Middle Name <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <Input
                type="text"
                name="mname"
                value={formData.mname}
                onChange={handleInputChange}
                placeholder="Enter middle name"
                className="w-full"
                disabled={loading}
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="lname"
                value={formData.lname}
                onChange={handleInputChange}
                placeholder="Enter last name"
                className="w-full"
                disabled={loading}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
                className="w-full"
                disabled={loading}
              />
            </div>

            {/* Course */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course <span className="text-red-500">*</span>
              </label>
              <Select 
                value={formData.course} 
                onValueChange={(value) => handleSelectChange('course', value)}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select course" />
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

            {/* Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year <span className="text-red-500">*</span>
              </label>
              <Select 
                value={formData.year_level} 
                onValueChange={(value) => handleSelectChange('year_level', value)}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleSelectChange('status', value)}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Address Information - Using AddressSelector Component */}
            <div className="md:col-span-2 border-t pt-4 mt-2">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Address Information</h3>
              <AddressSelector
                province={formData.province}
                municipality={formData.municipality}
                barangay={formData.barangay}
                onProvinceChange={(value) => {
                  setFormData({ ...formData, province: value, municipality: "", barangay: "" });
                  setError(""); // Clear error
                }}
                onMunicipalityChange={(value) => {
                  setFormData({ ...formData, municipality: value, barangay: "" });
                  setError(""); // Clear error
                }}
                onBarangayChange={(value) => {
                  setFormData({ ...formData, barangay: value });
                  setError(""); // Clear error
                }}
                required={true}
                disabled={loading}
                layout="grid"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-6"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-6 bg-[#15592F] hover:bg-[#124b28] text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
  );
};

export default EditClientDialog;