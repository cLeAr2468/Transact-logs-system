import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/Asidebar";

import {
  Search,
  Plus,
  ArrowRightLeft,
  Hourglass,
  CheckCircle2,
  Check,
  X,
  Loader2,
  Filter,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Transaction = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // Track which button is loading

  // ✅ FILTER & SEARCH STATE
  const [filter, setFilter] = useState("Pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [purposeFilter, setPurposeFilter] = useState("All Purposes");
  const [purposes, setPurposes] = useState([]);

  // Fetch transactions from backend
  useEffect(() => {
    fetchTransactions();
    fetchPurposes();
  }, []);

  const fetchPurposes = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/purposes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPurposes(data.purposes || []);
      }
    } catch (error) {
      console.error('Fetch purposes error:', error);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        toast.error('You are not logged in. Please login first.');
        navigate('/login');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/appointments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
        return;
      }

      const data = await response.json();

      if (response.ok) {
        setTransactions(data.transactions || []);
      } else {
        toast.error(data.message || 'Failed to fetch transactions');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle status update
  const handleStatusUpdate = async (transactionId, newStatus) => {
    setActionLoading(transactionId);
    
    const transaction = transactions.find(t => t.id === transactionId);
    const userEmail = transaction?.user?.email || 'student';
    
    try {
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        toast.error('You are not logged in. Please login first.');
        navigate('/login');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/appointments/${transactionId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (response.ok) {
        switch (newStatus) {
          case 'approved':
            toast.success(`✅ Appointment Approved! Email sent to ${userEmail}`);
            break;
          case 'rejected':
            toast.success(`❌ Appointment Rejected. Email sent to ${userEmail}`);
            break;
          case 'completed':
            toast.success(`🎉 Appointment Completed! Email sent to ${userEmail}`);
            break;
          default:
            toast.success(data?.message || 'Status updated successfully!');
        }
        
        await fetchTransactions();
        
      } else {
        if (response.status === 401) {
          toast.error('Session expired. Please log in again.');
          localStorage.removeItem('admin_token');
          navigate('/login');
        } else {
          toast.error(data?.message || 'Failed to update transaction status');
        }
      }
      
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Failed to update transaction. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle approve
  const handleApprove = (transactionId) => {
    // Find the transaction to get user email
    const transaction = transactions.find(t => t.id === transactionId);
    const userEmail = transaction?.user?.email || 'the student';
    
    toast.warning(
      <div>
        <p className="font-semibold">Approve this appointment?</p>
        <p className="text-sm">📧 An email notification will be sent to:</p>
        <p className="text-sm font-medium text-green-700">{userEmail}</p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => {
              confirmApprove(transactionId);
              toast.dismiss();
            }}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
          >
            Approve & Send Email
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>,
      { duration: 10000 }
    );
  };

  const confirmApprove = (transactionId) => {
    handleStatusUpdate(transactionId, 'approved');
  };

  // Handle reject
  const handleReject = (transactionId) => {
    // Find the transaction to get user email
    const transaction = transactions.find(t => t.id === transactionId);
    const userEmail = transaction?.user?.email || 'the student';
    
    toast.warning(
      <div>
        <p className="font-semibold">Reject this appointment?</p>
        <p className="text-sm">📧 An email notification will be sent to:</p>
        <p className="text-sm font-medium text-red-700">{userEmail}</p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => {
              confirmReject(transactionId);
              toast.dismiss();
            }}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            Reject & Send Email
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>,
      { duration: 10000 }
    );
  };

  const confirmReject = (transactionId) => {
    handleStatusUpdate(transactionId, 'rejected');
  };

  // Handle complete
  const handleComplete = (transactionId) => {
    // Find the transaction to get user email
    const transaction = transactions.find(t => t.id === transactionId);
    const userEmail = transaction?.user?.email || 'the student';
    
    toast.warning(
      <div>
        <p className="font-semibold">Mark as completed?</p>
        <p className="text-sm">📧 An email notification will be sent to:</p>
        <p className="text-sm font-medium text-blue-700">{userEmail}</p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => {
              confirmComplete(transactionId);
              toast.dismiss();
            }}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Complete & Send Email
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>,
      { duration: 10000 }
    );
  };

  const confirmComplete = (transactionId) => {
    handleStatusUpdate(transactionId, 'completed');
  };


  // Format date properly
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // ✅ COMBINED FILTER & SEARCH LOGIC
  const filteredTransactions = transactions.filter((item) => {
    // FIRST: Filter out rejected and cancelled transactions completely
    if (item.status === 'rejected' || item.status === 'cancelled') {
      return false;
    }

    // Map backend status to frontend display status
    const displayStatus = item.status === 'approved' ? 'Approved' : 
                         item.status === 'pending' ? 'Pending' :
                         item.status === 'completed' ? 'Completed' : item.status;

    // Only show Pending, Approved, and Completed
    if (displayStatus !== 'Pending' && displayStatus !== 'Approved' && displayStatus !== 'Completed') {
      return false;
    }

    // Filter by status (no "All" option)
    const statusMatch = displayStatus === filter;
    
    // Purpose filter
    const purposeMatch = purposeFilter === "All Purposes" || item.purpose === purposeFilter;

    // Get student name from user object
    const studentName = item.user ? `${item.user.fname} ${item.user.lname}` : '';
    const studentCourse = item.user?.course || '';
    const address = `${item.brgy}, ${item.municipality}, ${item.province}`;

    // Search by query (searches in multiple fields)
    const searchMatch = searchQuery === "" || 
      studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      studentCourse.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.schedule_date?.toLowerCase().includes(searchQuery.toLowerCase());

    // Return true only if all conditions are met
    return statusMatch && searchMatch && purposeMatch;
  });

  // STATUS COLORS
  const getStatusColor = (status) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case "completed":
        return "bg-green-100 text-green-700 hover:bg-green-100";
      case "pending":
        return "bg-red-100 text-red-700 hover:bg-red-100";
      case "approved":
        return "bg-blue-100 text-blue-700 hover:bg-blue-100";
      case "rejected":
        return "bg-gray-100 text-gray-700 hover:bg-gray-100";
      case "cancelled":
        return "bg-orange-100 text-orange-700 hover:bg-orange-100";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Get display status
  const getDisplayStatus = (status) => {
    if (status === 'approved') return 'Approved';
    if (status === 'pending') return 'Pending';
    if (status === 'completed') return 'Completed';
    return status;
  };

  // Calculate statistics
  const totalTransactions = transactions.length;
  const pendingCount = transactions.filter(t => t.status === 'pending').length;
  const completedCount = transactions.filter(t => t.status === 'completed').length;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#f6f7fb]">
        <AppSidebar />

        <main className="flex-1 overflow-auto">
          <div className="p-6">

            {/* SEARCH + CALENDAR + BUTTON */}
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
              <div className="relative w-full md:w-[380px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

                <Input
                  placeholder="Search by Name, Date, or Program..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 bg-white border-gray-200"
                />
              </div>

              <Link to="/add-transact">
                <Button className="bg-[#15592F] hover:bg-[#124b28] text-white shadow-md h-11 w-full rounded-md md:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  ADD TRANSACTION
                </Button>
              </Link>
            </div>

            {/* CARDS (UNCHANGED) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="border-0 shadow-sm rounded-2xl">
                <CardContent className="p-5">
                  <div className="flex justify-between items-center mb-5">
                    <div className="bg-green-100 p-2 rounded-full">
                      <ArrowRightLeft className="h-4 w-4 text-green-700" />
                    </div>
                  </div>

                  <h2 className="text-3xl font-bold text-slate-800">
                    {totalTransactions}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Total Transactions
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm rounded-2xl">
                <CardContent className="p-5">
                  <div className="flex justify-between items-center mb-5">
                    <div className="bg-yellow-100 p-2 rounded-full">
                      <Hourglass className="h-4 w-4 text-yellow-600" />
                    </div>
                  </div>

                  <h2 className="text-3xl font-bold text-slate-800">
                    {pendingCount}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Pending Requests
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm rounded-2xl">
                <CardContent className="p-5">
                  <div className="flex justify-between items-center mb-5">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>

                  <h2 className="text-3xl font-bold text-slate-800">
                    {completedCount}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Completed Services
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* TABLE */}
            <Card className="border-0 shadow-sm rounded-2xl">
              <CardContent className="p-6">

                {/* TITLE + FILTER BUTTONS */}
                <div className="flex flex-col gap-4 mb-6">
                  <h2 className="text-2xl font-semibold text-[#15592F]">
                    Transaction Records
                  </h2>

                  <div className="flex gap-3 flex-wrap items-center">
                    <div className="flex gap-2">
                      <Button
                        variant={filter === "Pending" ? "default" : "outline"}
                        onClick={() => setFilter("Pending")}
                        className={
                          filter === "Pending"
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : ""
                        }
                      >
                        Pending
                      </Button>

                      <Button
                        variant={filter === "Approved" ? "default" : "outline"}
                        onClick={() => setFilter("Approved")}
                        className={
                          filter === "Approved"
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : ""
                        }
                      >
                        Approved
                      </Button>

                      <Button
                        variant={filter === "Completed" ? "default" : "outline"}
                        onClick={() => setFilter("Completed")}
                        className={
                          filter === "Completed"
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : ""
                        }
                      >
                        Completed
                      </Button>
                    </div>
                    
                    {/* Purpose Filter Dropdown */}
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <Select value={purposeFilter} onValueChange={setPurposeFilter}>
                        <SelectTrigger className="w-[220px] h-10">
                          <SelectValue placeholder="Filter by purpose" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All Purposes">All Purposes</SelectItem>
                          {purposes.map((purpose) => (
                            <SelectItem key={purpose.id} value={purpose.name}>
                              {purpose.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* TABLE */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Time Slot</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Purpose</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Status</TableHead>
                        {filter !== "Completed" && (
                          <TableHead>Actions</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={filter !== "Completed" ? 8 : 7} className="text-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                            <p className="text-gray-500 mt-2">Loading transactions...</p>
                          </TableCell>
                        </TableRow>
                      ) : filteredTransactions.length > 0 ? (
                        filteredTransactions.map((item) => {
                          const studentName = item.user ? `${item.user.fname} ${item.user.lname}` : 'N/A';
                          const address = `${item.brgy}, ${item.municipality}`;
                          const course = item.user?.course || 'N/A';
                          const displayStatus = getDisplayStatus(item.status);
                          const timeSlot = item.time_slot || 'N/A';

                          return (
                            <TableRow key={item.id}>
                              <TableCell>{formatDate(item.schedule_date)}</TableCell>
                              <TableCell className="text-sm font-medium text-gray-700">
                                {timeSlot}
                              </TableCell>
                              <TableCell className="font-medium">
                                {studentName}
                              </TableCell>
                              <TableCell>{item.purpose}</TableCell>
                              <TableCell>{address}</TableCell>
                              <TableCell>{course}</TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(displayStatus)}>
                                  {displayStatus}
                                </Badge>
                              </TableCell>
                              {filter !== "Completed" && (
                                <TableCell>
                                  {/* Show actions only for pending and approved status */}
                                  {(item.status === 'pending' || item.status === 'approved') && (
                                    <div className="flex gap-2">
                                      {/* Pending status: Show Approve and Reject buttons */}
                                      {item.status === 'pending' && (
                                        <>
                                          <Button
                                            size="sm"
                                            onClick={() => handleApprove(item.id)}
                                            disabled={actionLoading === item.id}
                                            className="bg-green-600 hover:bg-green-700 text-white h-8"
                                          >
                                            {actionLoading === item.id ? (
                                              <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                              <>
                                                <Check className="h-3 w-3 mr-1" />
                                                Approve
                                              </>
                                            )}
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleReject(item.id)}
                                            disabled={actionLoading === item.id}
                                            className="h-8"
                                          >
                                            {actionLoading === item.id ? (
                                              <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                              <>
                                                <X className="h-3 w-3 mr-1" />
                                                Reject
                                              </>
                                            )}
                                          </Button>
                                        </>
                                      )}

                                      {/* Approved status: Show Complete button */}
                                      {item.status === 'approved' && (
                                        <Button
                                          size="sm"
                                          onClick={() => handleComplete(item.id)}
                                          disabled={actionLoading === item.id}
                                          className="bg-blue-600 hover:bg-blue-700 text-white h-8"
                                        >
                                          {actionLoading === item.id ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                          ) : (
                                            <>
                                              <Check className="h-3 w-3 mr-1" />
                                              Complete
                                            </>
                                          )}
                                        </Button>
                                      )}
                                    </div>
                                  )}
                                </TableCell>
                              )}
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={filter !== "Completed" ? 8 : 7}
                            className="text-center py-8 text-gray-500"
                          >
                            {searchQuery
                              ? `No transactions found matching "${searchQuery}" in ${filter} status.`
                              : `No ${filter} transactions found.`}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

              </CardContent>
            </Card>

          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Transaction;