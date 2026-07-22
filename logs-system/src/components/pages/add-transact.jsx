'use client';
import { useState, useEffect } from 'react';
import { Plus, Calendar, MapPin, Check, ArrowLeft, Loader2 } from 'lucide-react';
import { Label } from '../ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Link, useNavigate } from "react-router-dom";
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/Asidebar';
import { getAllPurposes } from '../../api/purposeApi';
import { toast } from 'sonner';

export default function TransactionForm() {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [studentId, setStudentId] = useState('');
  const [userData, setUserData] = useState(null);
  const [isUserValidated, setIsUserValidated] = useState(false);
  const [purposes, setPurposes] = useState([]);
  
  // ✅ SINGLE STATE FOR BOTH MORNING & AFTERNOON
  const [selectedTime, setSelectedTime] = useState('09:30 AM');
  const [scheduleDate, setScheduleDate] = useState('');
  const [purpose, setPurpose] = useState('');

  // Fetch purposes on component mount
  useEffect(() => {
    fetchPurposes();
  }, []);

  const fetchPurposes = async () => {
    try {
      const response = await getAllPurposes();
      setPurposes(response.purposes || []);
    } catch (error) {
      console.error('Error fetching purposes:', error);
      toast.error('Failed to load appointment purposes');
    }
  };

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0];

  const morningTimes = [
    "08:00 AM",
    "08:30 AM",
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
  ];

  const afternoonTimes = [
    "01:00 PM",
    "01:30 PM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
  ];

  // Validate student ID
  const handleValidateStudentId = async () => {
    if (!studentId.trim()) {
      toast.error('Please enter a Client ID');
      return;
    }

    setIsValidating(true);
    try {
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        toast.error('You are not logged in. Please login first.');
        navigate('/login');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/transactions/validate-student`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ student_id: studentId })
      });

      const data = await response.json();

      if (response.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
        return;
      }

      if (response.ok && data.found) {
        setUserData(data.user);
        setIsUserValidated(true);
        toast.success('Student found! Information loaded.');
      } else {
        toast.error(data.message || 'Student ID not found in the database');
        setUserData(null);
        setIsUserValidated(false);
      }
    } catch (error) {
      console.error('Validation error:', error);
      toast.error('Failed to validate Student ID. Please try again.');
      setIsUserValidated(false);
    } finally {
      setIsValidating(false);
    }
  };

  // Handle student ID input change
  const handleStudentIdChange = (e) => {
    setStudentId(e.target.value);
    setIsUserValidated(false);
    setUserData(null);
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validation
    if (!isUserValidated) {
      toast.error('Please validate the Client ID first');
      return;
    }

    if (!scheduleDate) {
      toast.error('Please select a schedule date');
      return;
    }

    if (!purpose) {
      toast.error('Please select a purpose for appointment');
      return;
    }

    if (!userData.barangay || !userData.municipality || !userData.province) {
      toast.error('Student address information is incomplete. Please update student profile first.');
      return;
    }

    if (!selectedTime) {
      toast.error('Please select a time slot');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        toast.error('You are not logged in. Please login first.');
        navigate('/login');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/transactions/create-by-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          student_id: studentId,
          purpose: purpose,
          brgy: userData.barangay,
          municipality: userData.municipality,
          province: userData.province,
          schedule_date: scheduleDate,
          time_slot: selectedTime
        })
      });

      const data = await response.json();

      if (response.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
        return;
      }

      if (response.ok) {
        toast.success('Transaction created successfully!');
        // Reset form or navigate
        navigate('/add-transact');
      } else {
        toast.error(data.message || 'Failed to create transaction');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to create transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (studentId || purpose || scheduleDate || timeSlot) {
      toast.warning(
        <div>
          <p className="font-semibold">Cancel Transaction?</p>
          <p className="text-sm">All unsaved data will be lost.</p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => {
                navigate('/transact');
                toast.dismiss();
              }}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Yes, Cancel
            </button>
            <button
              onClick={() => toast.dismiss()}
              className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
            >
              No, Continue
            </button>
          </div>
        </div>,
        { duration: 10000 }
      );
    } else {
      navigate('/transact');
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#f6f7fb]">
        <AppSidebar />

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">

            {/* HEADER */}
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-light text-gray-900">
                Add New Transaction
              </h1>

              <Button className="bg-[#15592F] hover:bg-[#124b28] flex items-center gap-2">
                <ArrowLeft size={16} />
                <Link to="/transact">
                  Back
                </Link>
              </Button>
            </div>

            {/* MAIN CARD */}
            <div className="bg-white rounded-lg shadow-sm p-6">

              {/* TOGGLE */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-3 mb-6 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <Plus
                  size={20}
                  className={`text-green-700 transition-transform ${
                    isExpanded ? 'rotate-45' : ''
                  }`}
                />
                <span className="text-lg font-semibold">
                  Transaction Details
                </span>
              </button>

              {isExpanded && (
                <div className="space-y-6">

                  {/* DATE + COURSE */}
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">
                        Client ID
                      </label>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Enter Client ID" 
                          value={studentId}
                          onChange={handleStudentIdChange}
                          disabled={isValidating}
                        />
                        <Button 
                          onClick={handleValidateStudentId}
                          disabled={isValidating || !studentId.trim()}
                          className="bg-[#15592F] hover:bg-[#124b28]"
                        >
                          {isValidating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Validating...
                            </>
                          ) : (
                            'Validate'
                          )}
                        </Button>
                      </div>
                      {isUserValidated && userData && (
                        <p className="text-xs text-green-600 mt-1">✓ Student found</p>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Calendar size={14} />
                        Schedule Date
                      </label>
                      <Input 
                        type="date" 
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        min={today}
                        disabled={!isUserValidated}
                      />
                    </div>
                   {/* Purpose for Appointment */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700 lg:text-base">
                Purpose for Appointment
              </Label>
              <Select 
                value={purpose} 
                onValueChange={setPurpose}
                disabled={!isUserValidated}
              >
                <SelectTrigger className="h-10 rounded-lg border-2 text-sm sm:h-12 sm:rounded-xl sm:text-base lg:h-14 lg:text-md">
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent className="w-full">
                  {purposes.length === 0 ? (
                    <SelectItem value="" disabled>
                      No purposes available
                    </SelectItem>
                  ) : (
                    purposes.map((purposeItem) => (
                      <SelectItem key={purposeItem.id} value={purposeItem.name}>
                        {purposeItem.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
                  </div>

                  {/* CLIENT + NAME */}
                  <div className="grid grid-cols-4 gap-6">

                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">
                        First Name
                      </label>
                      <Input 
                        value={userData?.fname || ''} 
                        readOnly 
                        disabled
                        className="bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">
                        Middle Name
                      </label>
                      <Input 
                        value={userData?.mname || ''} 
                        readOnly 
                        disabled
                        className="bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">
                        Last Name
                      </label>
                      <Input 
                        value={userData?.lname || ''} 
                        readOnly 
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                                        <div>
                      <label className="text-sm text-gray-600 mb-2 block">
                        Course
                      </label>
                      <Input 
                        value={userData?.course || ''} 
                        readOnly 
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                  </div>

                  {/* ADDRESS - READ ONLY FROM USER PROFILE */}
                  <div>
                    <h3 className="flex items-center gap-2 font-semibold mb-4">
                      <MapPin size={16} />
                      Residential Address (from student profile)
                    </h3>

                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <label className="text-sm text-gray-600 mb-2 block">
                          Barangay
                        </label>
                        <Input 
                          value={userData?.barangay || 'Not provided'} 
                          readOnly 
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 mb-2 block">
                          Municipality
                        </label>
                        <Input 
                          value={userData?.municipality || 'Not provided'} 
                          readOnly 
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 mb-2 block">
                          Province
                        </label>
                        <Input 
                          value={userData?.province || 'Not provided'} 
                          readOnly 
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                    </div>
                    {userData && (!userData.barangay || !userData.municipality || !userData.province) && (
                      <p className="text-xs text-orange-600 mt-2">
                        ⚠️ Address information incomplete. Please update student profile before creating transaction.
                      </p>
                    )}
                  </div>

                  {/* MORNING TIME */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Morning</h3>

                    <div className="grid grid-cols-6 gap-3">
                      {morningTimes.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          disabled={!isUserValidated}
                          className={`py-2 px-3 rounded-full text-sm transition-all ${
                            selectedTime === time
                              ? 'bg-black text-white'
                              : 'bg-gray-100 hover:bg-gray-200'
                          } ${!isUserValidated ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* AFTERNOON TIME */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Afternoon</h3>

                    <div className="grid grid-cols-6 gap-3">
                      {afternoonTimes.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          disabled={!isUserValidated}
                          className={`py-2 px-3 rounded-full text-sm transition-all ${
                            selectedTime === time
                              ? 'bg-black text-white'
                              : 'bg-gray-100 hover:bg-gray-200'
                          } ${!isUserValidated ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex justify-end gap-4 pt-6 border-t">

                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>

                    <Button 
                      className="bg-[#15592F] hover:bg-[#124b28] flex items-center gap-2"
                      onClick={handleSubmit}
                      disabled={isSubmitting || !isUserValidated}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Check size={16} />
                          SUBMIT TRANSACTION
                        </>
                      )}
                    </Button>

                  </div>

                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}