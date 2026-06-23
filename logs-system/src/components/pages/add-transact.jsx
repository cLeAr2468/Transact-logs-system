'use client';
import { useState } from 'react';
import { Plus, Search, Calendar, MapPin, Check, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {Link} from "react-router-dom";
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/Asidebar';

export default function TransactionForm() {
  const [isExpanded, setIsExpanded] = useState(true);

  // ✅ SINGLE STATE FOR BOTH MORNING & AFTERNOON
  const [selectedTime, setSelectedTime] = useState('09:30 AM');

  const morningTimes = [
    '09:00 AM',
    '09:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
  ];

  const afternoonTimes = [
    '01:00 PM',
    '01:30 PM',
    '02:00 PM',
    '02:30 PM',
    '03:00 PM',
    '03:30 PM',
  ];

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

            {/* SEARCH */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search Client ID..." className="pl-10 bg-white border-solid " />
              </div>
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
                  <div className="grid grid-cols-4 gap-6">
                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">
                        Client ID
                      </label>
                      <Input placeholder="Enter Client ID" />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Calendar size={14} />
                        Date Today
                      </label>
                      <Input type="date" />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Calendar size={14} />
                        Schedule Date
                      </label>
                      <Input type="date" />
                    </div>

                    

                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">
                        Purpose
                      </label>

                      <Select defaultValue="id-validation">
                        <SelectTrigger>
                          <SelectValue placeholder="Select purpose" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="id-validation">ID Validation</SelectItem>
                          <SelectItem value="enrollment">Enrollment</SelectItem>
                          <SelectItem value="registration">Registration</SelectItem>
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
                      <Input defaultValue="Juan" />
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">
                        Middle Name
                      </label>
                      <Input defaultValue="Santos" />
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">
                        Last Name
                      </label>
                      <Input defaultValue="Dela Cruz" />
                    </div>
                                        <div>
                      <label className="text-sm text-gray-600 mb-2 block">
                        Course
                      </label>
                      <Input value="BSIT" readOnly />
                    </div>
                  </div>

                  {/* ADDRESS */}
                  <div>
                    <h3 className="flex items-center gap-2 font-semibold mb-4">
                      <MapPin size={16} />
                      Residential Address
                    </h3>

                    <div className="grid grid-cols-2 gap-6">
                      <Input placeholder="Street / House No." />
                      <Input placeholder="Barangay" />
                      <Input placeholder="City / Municipality" />
                      <Input placeholder="Province" />
                    </div>
                  </div>

                  {/* MORNING TIME */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Morning</h3>

                    <div className="grid grid-cols-6 gap-3">
                      {morningTimes.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`py-2 px-3 rounded-full text-sm transition-all ${
                            selectedTime === time
                              ? 'bg-black text-white'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
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
                          className={`py-2 px-3 rounded-full text-sm transition-all ${
                            selectedTime === time
                              ? 'bg-black text-white'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex justify-end gap-4 pt-6 border-t">

                    <Button variant="outline">
                      Cancel
                    </Button>

                    <Button className="bg-[#15592F] hover:bg-[#124b28] flex items-center gap-2">
                      <Check size={16} />
                      SUBMIT TRANSACTION
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