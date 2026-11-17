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
import api from '@/api';

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
  const [purposeId, setPurposeId] = useState('');  // Pure Relationship: stores purpose ID
  const [availableSlots, setAvailableSlots] = useState({ morning: [], afternoon: [] });
  const [fullSlots, setFullSlots] = useState([]);
  const [slotDetails, setSlotDetails] = useState({});
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [serverTime, setServerTime] = useState(null);
  const [isMorningPast, setIsMorningPast] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('morning');
  const [pastTimeSlots, setPastTimeSlots] = useState([]);

  // Fetch purposes on component mount
  useEffect(() => {
    fetchPurposes();
  }, []);

  // Fetch available slots when date changes
  useEffect(() => {
    if (scheduleDate) {
      // Check if selected date is a weekend
      if (isDateDisabled(scheduleDate)) {
        toast.error('Weekends are not available for appointments. Please select a weekday.');
        setScheduleDate('');
        setAvailableSlots({ morning: [], afternoon: [] });
        setFullSlots([]);
        setSlotDetails({});
        return;
      }
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
      // Include user_id if available (from validated student)
      let url = `/appointments/available-slots?date=${scheduleDate}`;
      if (userData?.id) {
        url += `&user_id=${userData.id}`;
      }
      
      console.log('Fetching slots for date:', scheduleDate);
      console.log('URL:', url);
      
      const response = await api.get(url);
      const data = response.data;
      
      console.log('📊 Slot data received:', data);
      console.log('Server time:', data.server_time);
      
      // Store server time and check if morning is past
      if (data.server_time) {
        setServerTime(data.server_time);
        const serverDate = new Date(data.server_time);
        const serverHour = serverDate.getHours();
        const serverMinute = serverDate.getMinutes();
        
        // Check if selected date is today
        const selectedDate = new Date(scheduleDate + 'T00:00:00');
        const todayDate = new Date(data.server_time);
        todayDate.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);
        
        const isToday = selectedDate.getTime() === todayDate.getTime();
        const isPastNoon = serverHour >= 12;
        
        console.log('🔍 Date check:', {
          isToday,
          isPastNoon,
          selectedDate: scheduleDate,
          selectedDateTime: selectedDate.getTime(),
          todayDateTime: todayDate.getTime(),
          serverHour,
          serverMinute
        });
        
        setIsMorningPast(isToday && isPastNoon);
        
        // Calculate which specific time slots are past - ONLY FOR TODAY
        const pastSlots = [];
        if (isToday) {
          // Convert time slots to 24-hour format and compare
          const allTimeSlots = [...morningTimes, ...afternoonTimes];
          allTimeSlots.forEach(slot => {
            const [time, period] = slot.split(' ');
            const [hours, minutes] = time.split(':').map(Number);
            
            // Convert to 24-hour format
            let slot24Hour = hours;
            if (period === 'PM' && hours !== 12) {
              slot24Hour = hours + 12;
            } else if (period === 'AM' && hours === 12) {
              slot24Hour = 0;
            }
            
            // Check if this slot time has passed
            if (slot24Hour < serverHour || (slot24Hour === serverHour && minutes <= serverMinute)) {
              pastSlots.push(slot);
            }
          });
          
          console.log('⏰ Past time slots (TODAY only):', pastSlots);
          setPastTimeSlots(pastSlots);
          
          // Clear selected time slot if it's now in the past
          if (selectedTime && pastSlots.includes(selectedTime)) {
            setSelectedTime('');
            toast.warning('The selected time slot has passed. Please choose another slot.');
          }
        } else {
          console.log('✅ Future date selected - all time slots available');
          setPastTimeSlots([]);
        }
        
        // If morning is past and morning is selected, switch to afternoon
        if (isToday && isPastNoon && selectedPeriod === 'morning') {
          setSelectedPeriod('afternoon');
          toast.info('Morning time slots are no longer available for today');
        }
      }
        
      setAvailableSlots(data.available_slots || { morning: [], afternoon: [] });
      setFullSlots(data.full_slots || []);
      setSlotDetails(data.slot_details || {});
        
      if (selectedTime && data.full_slots?.includes(selectedTime)) {
        console.log('Selected time is now full, clearing selection');
        setSelectedTime('');
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else {
        toast.error('Failed to load available time slots');
      }
      
      // Set empty slots on error
      setAvailableSlots({ morning: [], afternoon: [] });
      setFullSlots([]);
      setSlotDetails({});
    } finally {
      setLoadingSlots(false);
    }
  };

  const isSlotAvailable = (timeSlot) => {
    // Check if slot is in the past
    if (pastTimeSlots.includes(timeSlot)) {
      return false;
    }
    const available = !fullSlots.includes(timeSlot);
    // console.log(`Slot ${timeSlot} available:`, available, 'Full slots:', fullSlots);
    return available;
  };

  const getSlotInfo = (timeSlot) => {
    const info = slotDetails[timeSlot] || { 
      total_user_slots: 5, 
      booked_users: 0, 
      available_user_slots: 5,
      user_transactions: 0,
      user_can_book: true,
      max_transactions_per_user: 3
    };
    // console.log(`Slot ${timeSlot} info:`, info);
    return {
      total: info.total_user_slots || info.total || 5,
      booked: info.booked_users || info.booked || 0,
      available: info.available_user_slots || info.available || 5,
      userTransactions: info.user_transactions || 0,
      userCanBook: info.user_can_book !== undefined ? info.user_can_book : true,
      maxPerUser: info.max_transactions_per_user || 3
    };
  };

  const today = new Date().toISOString().split('T')[0];

  // Function to check if a date is a weekend (Saturday or Sunday)
  const isWeekend = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    const day = date.getDay();
    return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
  };

  // Function to check if date should be disabled
  const isDateDisabled = (dateString) => {
    return isWeekend(dateString);
    // Future: Add holiday checking here
    // return isWeekend(dateString) || isHoliday(dateString);
  };

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
      const response = await api.post('/transactions/validate-student', {
        student_id: studentId
      });

      const data = response.data;

      if (data.found) {
        setUserData(data.user);
        setIsUserValidated(true);
        toast.success('Student found! Information loaded.');
      } else {
        toast.error(data.message || 'Student ID not found in the database');
        setUserData(null);
        setIsUserValidated(false);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      } else {
        console.error('Validation error:', error);
        toast.error('Failed to validate Student ID. Please try again.');
        setIsUserValidated(false);
      }
    } finally {
      setIsValidating(false);
    }
  };

  const handleStudentIdChange = (e) => {
    const value = e.target.value;
    // Apply uppercase formatting as user types
    const formatted = value.toUpperCase().replace(/[^0-9A-Z-]/g, "");
    setStudentId(formatted);
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
      toast.error('Please select an appointment date');
      return;
    }

    if (!purposeId) {
      toast.error('Please select a purpose for appointment');
      return;
    }

    if (!userData.region || !userData.barangay || !userData.municipality || !userData.province) {
      toast.error('Student address information is incomplete. Please update student profile first.');
      return;
    }

    if (!selectedTime) {
      toast.error('Please select a time slot');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Pure Relationship: send purpose_id instead of purpose string
      // Address info is no longer sent - backend will get it from user relationship
      const response = await api.post('/transactions/create-by-admin', {
        student_id: studentId,
        purpose_id: parseInt(purposeId),  // Pure Relationship: FK to purposes table
        schedule_date: scheduleDate,
        time_slot: selectedTime
      });

      toast.success(response.data?.message || 'Transaction created successfully!');
        
        // Reset form
        setStudentId('');
        setUserData(null);
        setIsUserValidated(false);
        setPurposeId('');
        setScheduleDate('');
        setSelectedTime('');
        setAvailableSlots({ morning: [], afternoon: [] });
        setFullSlots([]);
        setSlotDetails({});
        
        // Navigate back
        setTimeout(() => {
          navigate('/transact');
        }, 1500);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      } else if (error.response?.status === 409) {
        toast.error(error.response?.data?.message || 'Time slot is no longer available. Please choose another slot.');
        if (scheduleDate) {
          fetchAvailableSlots();
        }
      } else {
        console.error('Submit error:', error);
        toast.error(error.response?.data?.message || 'Failed to create transaction. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (studentId || purposeId || scheduleDate || selectedTime) {
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
                        Appointment Date
                      </label>
                      <style>{`
                        /* Hide weekend dates in calendar picker */
                        input[type="date"]::-webkit-calendar-picker-indicator {
                          cursor: pointer;
                        }
                        
                        /* This selector targets the calendar but browser support varies */
                        input[type="date"]::-webkit-datetime-edit-fields-wrapper {
                          background: white;
                        }
                      `}</style>
                      <Input 
                        type="date" 
                        value={scheduleDate}
                        onChange={(e) => {
                          const selectedDate = e.target.value;
                          if (isDateDisabled(selectedDate)) {
                            toast.error('Saturdays and Sundays are not available for appointments');
                            setScheduleDate('');
                            return;
                          }
                          setScheduleDate(selectedDate);
                        }}
                        min={today}
                        disabled={!isUserValidated}
                        className="cursor-pointer"
                        onKeyDown={(e) => e.preventDefault()} // Prevent manual typing
                        title="Weekends are not available"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        * Weekends (Saturday & Sunday) are not available
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700 lg:text-base">
                        Purpose for Appointment
                      </Label>
                      <Select 
                        value={purposeId} 
                        onValueChange={setPurposeId}
                        disabled={!isUserValidated}
                      >
                        <SelectTrigger className="h-10 rounded-lg border-2 text-sm sm:h-12 sm:rounded-xl sm:text-base lg:h-14 lg:text-md">
                          <SelectValue placeholder="Select purpose">
                            {purposeId ? purposes.find(p => p.id.toString() === purposeId)?.name : "Select purpose"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="w-full">
                          {purposes.length === 0 ? (
                            <SelectItem value="" disabled>
                              No purposes available
                            </SelectItem>
                          ) : (
                            purposes.map((purposeItem) => (
                              <SelectItem key={purposeItem.id} value={purposeItem.id.toString()}>
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
                  {!isMorningPast && (
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
                          const isPast = pastTimeSlots.includes(time);
                          
                          // Don't render past time slots
                          if (isPast) {
                            return null;
                          }
                          
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
                                    <>
                                      <span className={slotInfo.available <= 2 ? 'text-orange-500 font-semibold' : isSelected ? 'text-white' : ''}>
                                        {slotInfo.available}/{slotInfo.total} users
                                      </span>
                                      {slotInfo.userTransactions > 0 && (
                                        <div className={isSelected ? 'text-white opacity-90' : 'text-blue-600'}>
                                          Student: {slotInfo.userTransactions}/{slotInfo.maxPerUser}
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <span className="text-red-600 font-semibold">Full</span>
                                  )}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* AFTERNOON TIME */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Afternoon</h3>

                    <div className="grid grid-cols-4 gap-3">
                      {afternoonTimes.map((time) => {
                        const slotInfo = getSlotInfo(time);
                        const isAvailable = isSlotAvailable(time);
                        const isSelected = selectedTime === time;
                        const isPast = pastTimeSlots.includes(time);
                        
                        // Don't render past time slots
                        if (isPast) {
                          return null;
                        }
                        
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
                                  <>
                                    <span className={slotInfo.available <= 2 ? 'text-orange-500 font-semibold' : isSelected ? 'text-white' : ''}>
                                      {slotInfo.available}/{slotInfo.total} users
                                    </span>
                                    {slotInfo.userTransactions > 0 && (
                                      <div className={isSelected ? 'text-white opacity-90' : 'text-blue-600'}>
                                        Student: {slotInfo.userTransactions}/{slotInfo.maxPerUser}
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-red-600 font-semibold">Full</span>
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
