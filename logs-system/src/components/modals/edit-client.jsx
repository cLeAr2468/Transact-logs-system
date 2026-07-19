import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
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

const EditClientDialog = ({ isOpen, onClose, client, onUserUpdated }) => {
  const [formData, setFormData] = useState({
    student_id: '',
    fname: '',
    mname: '',
    lname: '',
    email: '',
    course: '',
    year_level: '',
    status: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (client) {
      console.log("📝 Client data received:", client);
      setFormData({
        student_id: client.student_id || '',
        fname: client.fname || '',
        mname: client.mname || '',
        lname: client.lname || '',
        email: client.email || '',
        course: client.course || '',
        year_level: client.year_level || '',
        status: client.status || 'Active',
      });
      setError(""); // Clear error when new client is selected
    }
  }, [client]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(""); // Clear error when user types
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

    // Validation
    if (!formData.student_id) {
      setError("Student ID is required");
      return;
    }
    if (!formData.fname) {
      setError("First name is required");
      return;
    }
    if (!formData.lname) {
      setError("Last name is required");
      return;
    }
    if (!formData.email) {
      setError("Email is required");
      return;
    }
    if (!formData.course) {
      setError("Course is required");
      return;
    }
    if (!formData.year_level) {
      setError("Year is required");
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
                onChange={handleInputChange}
                placeholder="Enter student ID"
                className="w-full"
                disabled={loading}
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
                  <SelectItem value="1st Year">1st Year</SelectItem>
                  <SelectItem value="2nd Year">2nd Year</SelectItem>
                  <SelectItem value="3rd Year">3rd Year</SelectItem>
                  <SelectItem value="4th Year">4th Year</SelectItem>
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