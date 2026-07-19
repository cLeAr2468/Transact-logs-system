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
import { updateStaff } from '../../api/staffApi';
import { toast } from "sonner";

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

  useEffect(() => {
    if (staff) {
      setFormData({
        staff_id: staff.staff_id || '',
        fname: staff.fname || '',
        mname: staff.mname || '',
        lname: staff.lname || '',
        email: staff.email || '',
        status: staff.status || 'Active',
      });
      setError(""); // Clear error when new staff is selected
    }
  }, [staff]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(""); // Clear error when user types
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

    // Validate required fields
    if (!formData.staff_id) {
      setError("Staff ID is required");
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
                onChange={handleInputChange}
                placeholder="Enter staff ID"
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
                Middle Name
              </label>
              <Input
                type="text"
                name="mname"
                value={formData.mname}
                onChange={handleInputChange}
                placeholder="Enter middle name"
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