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
  
  const [selectedTime, setSelectedTime] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [availableSlots, setAvailableSlots] = useState({ morning: [], afternoon: [] });
  const [fullSlots, setFullSlots] = useState([]);
  const [slotDetails, setSlotDetails] = useState({});
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Fetch purposes on component mount
  useEffect(() => {
    fetchPurposes();
  }, []);

  // Fetch available slots when date changes
  useEffect(() => {
    if (scheduleDate) {
      fetchAvailableSlots();
    }
  }, [scheduleDate]);

  const fetchPurposes = async () => {
    try {
      const response = await getAllPurposes();
      setPurposes(response.purposes || []);
    } catch (error) {
      console.error('Error fetching purposes:', error);
      toast.error('Failed to load appointment purposes');
    }
  };

  const fetchAvailableSlots = async () => {
    setLoadingSlots(true);
    try {
      const token = localStorage.getItem('admin_token');
      
      const url = `${import.meta.env.VITE_API_URL}/appointments/available-slots?date=${scheduleDate}`;
      console.log('🔍 Fetching slots for date:', scheduleDate);
      console.log('🔍 API URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Slot data received:', data);
        console.log('🔴 Full slots:', data.full_slots);
        console.log('✅ Available slots:', data.available_slots);
        console.log('📈 Slot details:', data.slot_details);
        
        // Check if slot_details exists and has data
        if (!data.slot_details || Object.keys(data.slot_details).length === 0) {
          console.warn('⚠️ No slot_details received from backend!');
        }
        
        setAvailableSlots(data.available_slots || { morning: [], afternoon: [] });
        setFullSlots(data.full_slots || []);
        setSlotDetails(data.slot_details || {});
        
        console.log('💾 State updated:', {
          availableSlots: data.available_slots,
          fullSlots: data.full_slots,
          slotDetails: data.slot_details
        });
        
        if (selectedTime && data.full_slots?.includes(selectedTime)) {
          console.log('⚠️ Selected time is now full, clearing selection');
          setSelectedTime('');
        }
      } else {
        console.error('❌ Failed to fetch slots:', response.status);
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Error data:', errorData);
        toast.error('Failed to fetch available time slots');
      }
    } catch (error) {
      console.error('💥 Error fetching available slots:', error);
      toast.error('Failed to load available time slots');
    } finally {
      setLoadingSlots(false);
    }
  };

  const isSlotAvailable = (timeSlot) => {
    const available = !fullSlots.includes(timeSlot);
    // console.log(`Slot ${timeSlot} available:`, available, 'Full slots:', fullSlots);
    return available;
  };

  const getSlotInfo = (timeSlot) => {
    const info = slotDetails[timeSlot] || { total: 5, booked: 0, available: 5 };
    // console.log(`Slot ${timeSlot} info:`, info);
    return info;
  };

  const today = new Date().toISOString().split('T')[0];

  const morningTimes = [
    "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
  ];

  const afternoonTimes = [
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
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

      if (response.ok) {
        toast.success(data?.message || 'Transaction created successfully!');
        
        // Reset form
        setStudentId('');
        setUserData(null);
        setIsUserValidated(false);
        setPurpose('');
        setScheduleDate('');
        setSelectedTime('');
        setAvailableSlots({ morning: [], afternoon: [] });
        setFullSlots([]);
        setSlotDetails({});
        
        // Navigate back
        setTimeout(() => {
          navigate('/transact');
        }, 1500);
        
      } else {
        if (response.status === 401) {
          toast.error('Session expired. Please login again.');
          localStorage.removeItem('admin_token');
          navigate('/login');
        } else if (response.status === 409) {
          toast.error(data?.message || 'Time slot is no longer available. Please choose another slot.');
          if (scheduleDate) {
            fetchAvailableSlots();
          }
        } else {
          toast.error(data?.message || 'Failed to create transaction');
        }
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
    if (studentId || purpose || scheduleDate || selectedTime) {
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

                  {/* USER INFORMATION */}
                  {isUserValidated && userData && (
                    <div className="space-y-4">
                      <div className="rounded-lg bg-gray-50 p-4 border-2 border-gray-200">
                        <h3 className="text-base font-semibold text-slate-800 mb-3">
                          Student Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex">
                            <span className="font-medium text-slate-600 w-32">Full Name:</span>
                            <span className="text-slate-800">
                              {`${userData.fname} ${userData.mname ? userData.mname + ' ' : ''}${userData.lname}`}
                            </span>
                          </div>
                          <div className="flex">
                            <span className="font-medium text-slate-600 w-32">Course:</span>
                            <span className="text-slate-800">{userData.course || 'Not provided'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg bg-gray-50 p-4 border-2 border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin className="h-5 w-5 text-green-700" />
                          <h3 className="text-base font-semibold text-slate-800">
                            Residential Address
                          </h3>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex">
                            <span className="font-medium text-slate-600 w-32">Barangay:</span>
                            <span className="text-slate-800">{userData.barangay || 'Not provided'}</span>
                          </div>
                          <div className="flex">
                            <span className="font-medium text-slate-600 w-32">Municipality:</span>
                            <span className="text-slate-800">{userData.municipality || 'Not provided'}</span>
                          </div>
                          <div className="flex">
                            <span className="font-medium text-slate-600 w-32">Province:</span>
                            <span className="text-slate-800">{userData.province || 'Not provided'}</span>
                          </div>
                        </div>
                        {(!userData.barangay || !userData.municipality || !userData.province) && (
                          <p className="text-xs text-orange-600 mt-3 italic">
                            ⚠️ Address information incomplete. Please update student profile before creating transaction.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* MORNING TIME */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium">Morning</h3>
                      {loadingSlots && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Loading slots...
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      {morningTimes.map((time) => {
                        const slotInfo = getSlotInfo(time);
                        const isAvailable = isSlotAvailable(time);
                        const isSelected = selectedTime === time;
                        
                        return (
                          <button
                            key={time}
                            onClick={() => {
                              if (isAvailable && !loadingSlots && isUserValidated) {
                                setSelectedTime(time);
                              }
                            }}
                            disabled={!isUserValidated || !isAvailable || loadingSlots}
                            className={`py-2 px-3 rounded-lg text-sm transition-all relative ${
                              isSelected
                                ? 'bg-black text-white'
                                : isAvailable
                                ? 'bg-gray-100 hover:bg-gray-200'
                                : 'bg-red-100 text-red-400 cursor-not-allowed'
                            } ${!isUserValidated || loadingSlots ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <div className="font-medium">{time}</div>
                            {scheduleDate && (
                              <div className="text-xs mt-1">
                                {isAvailable ? (
                                  <span className={slotInfo.available <= 2 ? 'text-orange-500 font-semibold' : ''}>
                                    {slotInfo.available}/{slotInfo.total}
                                  </span>
                                ) : (
                                  <span className="text-red-600 font-semibold">0/5</span>
                                )}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* AFTERNOON TIME */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Afternoon</h3>

                    <div className="grid grid-cols-4 gap-3">
                      {afternoonTimes.map((time) => {
                        const slotInfo = getSlotInfo(time);
                        const isAvailable = isSlotAvailable(time);
                        const isSelected = selectedTime === time;
                        
                        return (
                          <button
                            key={time}
                            onClick={() => {
                              if (isAvailable && !loadingSlots && isUserValidated) {
                                setSelectedTime(time);
                              }
                            }}
                            disabled={!isUserValidated || !isAvailable || loadingSlots}
                            className={`py-2 px-3 rounded-lg text-sm transition-all relative ${
                              isSelected
                                ? 'bg-black text-white'
                                : isAvailable
                                ? 'bg-gray-100 hover:bg-gray-200'
                                : 'bg-red-100 text-red-400 cursor-not-allowed'
                            } ${!isUserValidated || loadingSlots ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <div className="font-medium">{time}</div>
                            {scheduleDate && (
                              <div className="text-xs mt-1">
                                {isAvailable ? (
                                  <span className={slotInfo.available <= 2 ? 'text-orange-500 font-semibold' : ''}>
                                    {slotInfo.available}/{slotInfo.total}
                                  </span>
                                ) : (
                                  <span className="text-red-600 font-semibold">0/5</span>
                                )}
                              </div>
                            )}
                          </button>
                        );
                      })}
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
