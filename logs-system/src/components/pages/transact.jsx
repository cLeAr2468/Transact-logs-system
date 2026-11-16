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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  MoreVertical,
  Eye,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/api";
import RejectDialog from "@/components/modals/reject-dialog";

const Transaction = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // Track which button is loading

  // ✅ FILTER & SEARCH STATE
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [purposeFilter, setPurposeFilter] = useState("All Purposes");
  const [purposes, setPurposes] = useState([]);
  
  // Date range filter state
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  
  // Reject dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [selectedTransactionEmail, setSelectedTransactionEmail] = useState("");

  // Fetch transactions from backend
  useEffect(() => {
    fetchTransactions();
    fetchPurposes();
  }, []);

  const fetchPurposes = async () => {
    try {
      const response = await api.get('/purposes');
      setPurposes(response.data.purposes || []);
    } catch (error) {
      console.error('Fetch purposes error:', error);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/appointments');
      setTransactions(response.data.transactions || []);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      } else {
        console.error('Fetch error:', error);
        toast.error('Failed to load transactions. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle status update
  const handleStatusUpdate = async (transactionId, newStatus, reason = null) => {
    setActionLoading(transactionId);
    
    const transaction = transactions.find(t => t.id === transactionId);
    const userEmail = transaction?.user?.email || 'student';
    
    try {
      const payload = { status: newStatus };
      if (reason) {
        payload.rejection_reason = reason;
      }
      
      const response = await api.put(`/admin/appointments/${transactionId}/status`, payload);

      switch (newStatus) {
        case 'approved':
          toast.success(`✅ Appointment Approved! Email sent to ${userEmail}`);
          break;
        case 'rejected':
          toast.success(` Appointment Rejected. Email sent to ${userEmail}`);
          break;
        case 'completed':
          toast.success(` Appointment Completed! Email sent to ${userEmail}`);
          break;
        default:
          toast.success(response.data?.message || 'Status updated successfully!');
      }
      
      await fetchTransactions();
      
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        navigate('/login');
      } else {
        console.error('Status update error:', error);
        toast.error(error.response?.data?.message || 'Failed to update transaction. Please try again.');
      }
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
    const transaction = transactions.find(t => t.id === transactionId);
    setSelectedTransactionId(transactionId);
    setSelectedTransactionEmail(transaction?.user?.email || 'the student');
    setRejectDialogOpen(true);
  };

  const confirmReject = async (reason) => {
    await handleStatusUpdate(selectedTransactionId, 'rejected', reason);
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
    // Map backend status to frontend display status
    const displayStatus = item.status === 'approved' ? 'Approved' : 
                         item.status === 'pending' ? 'Pending' :
                         item.status === 'completed' ? 'Completed' :
                         item.status === 'rejected' ? 'Rejected' :
                         item.status === 'cancelled' ? 'Cancelled' : item.status;

    // Filter by status - "All" shows everything
    const statusMatch = filter === "All" || displayStatus === filter;
    
    // Purpose filter (Pure Relationship)
    const purposeMatch = purposeFilter === "All Purposes" || item.purpose?.name === purposeFilter;

    // Date range filter
    let dateMatch = true;
    if (dateRange.start && dateRange.end) {
      const transactionDate = new Date(item.date_requested || item.created_at);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999); // Include the entire end date
      dateMatch = transactionDate >= startDate && transactionDate <= endDate;
    }

    // Get student name from user.masterlist object
    const masterlist = item.user?.masterlist;
    const studentName = masterlist ? `${masterlist.fname} ${masterlist.lname}` : '';
    const studentCourse = masterlist?.course || '';
    const address = `${item.brgy || item.user?.barangay || ''}, ${item.municipality || item.user?.municipality || ''}`;

    // Search by query (searches in multiple fields) - Pure Relationship
    const searchMatch = searchQuery === "" || 
      studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.purpose?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      studentCourse.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.schedule_date?.toLowerCase().includes(searchQuery.toLowerCase());

    // Return true only if all conditions are met
    return statusMatch && searchMatch && purposeMatch && dateMatch;
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

                {/* TITLE + FILTER DROPDOWN */}
                <div className="flex flex-col gap-4 mb-6">
                  <h2 className="text-2xl font-semibold text-[#15592F]">
                    Transaction Records
                  </h2>

                  <div className="flex gap-3 flex-wrap items-center">
                    {/* Date Range Filter */}
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">From:</label>
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        className="h-10 px-3 border border-gray-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#15592F] focus:border-transparent"
                      />
                      <label className="text-sm font-medium text-gray-700">To:</label>
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        className="h-10 px-3 border border-gray-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#15592F] focus:border-transparent"
                      />
                      {(dateRange.start || dateRange.end) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDateRange({ start: '', end: '' })}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Clear
                        </Button>
                      )}
                    </div>

                    {/* Status Filter Dropdown */}
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-[180px] h-10 px-3 border border-gray-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#15592F] focus:border-transparent"
                      >
                        <option value="All">All Transactions</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Completed">Completed</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                    
                    {/* Purpose Filter Dropdown */}
                    <select
                      value={purposeFilter}
                      onChange={(e) => setPurposeFilter(e.target.value)}
                      className="w-[220px] h-10 px-3 border border-gray-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#15592F] focus:border-transparent"
                    >
                      <option value="All Purposes">All Purposes</option>
                      {purposes.map((purpose) => (
                        <option key={purpose.id} value={purpose.name}>
                          {purpose.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* TABLE */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date Requested</TableHead>
                        <TableHead>Appointment Date</TableHead>
                        <TableHead>Time Slot</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Purpose</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                            <p className="text-gray-500 mt-2">Loading transactions...</p>
                          </TableCell>
                        </TableRow>
                      ) : filteredTransactions.length > 0 ? (
                        filteredTransactions.map((item) => {
                          const masterlist = item.user?.masterlist;
                          const studentName = masterlist ? `${masterlist.fname} ${masterlist.lname}` : 'N/A';
                          const address = `${item.brgy || item.user?.barangay || ''}, ${item.municipality || item.user?.municipality || ''}`;
                          const course = masterlist?.course || 'N/A';
                          const displayStatus = getDisplayStatus(item.status);
                          const timeSlot = item.time_slot || 'N/A';

                          return (
                            <TableRow key={item.id}>
                              <TableCell>{formatDate(item.date_requested || item.created_at)}</TableCell>
                              <TableCell>{formatDate(item.schedule_date)}</TableCell>
                              <TableCell className="text-sm font-medium text-gray-700">
                                {timeSlot}
                              </TableCell>
                              <TableCell className="font-medium">
                                {studentName}
                              </TableCell>
                              <TableCell>{item.purpose?.name || 'N/A'}</TableCell>
                              <TableCell>{address}</TableCell>
                              <TableCell>{course}</TableCell>
                              <TableCell>
                                <Badge className={item.request_type === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}>
                                  {item.request_type === 'online' ? 'Online' : 'Walk-in'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(displayStatus)}>
                                  {displayStatus}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                      <Link
                                        to={`/transact/${item.id}`}
                                        className="flex items-center cursor-pointer"
                                      >
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Details
                                      </Link>
                                    </DropdownMenuItem>
                                    
                                    {/* Show actions based on status */}
                                    {item.status === 'pending' && (
                                      <>
                                        <DropdownMenuItem
                                          onClick={() => handleApprove(item.id)}
                                          disabled={actionLoading === item.id}
                                          className="cursor-pointer text-green-600"
                                        >
                                          <Check className="h-4 w-4 mr-2" />
                                          Approve
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => handleReject(item.id)}
                                          disabled={actionLoading === item.id}
                                          className="cursor-pointer text-red-600"
                                        >
                                          <X className="h-4 w-4 mr-2" />
                                          Reject
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                    
                                    {item.status === 'approved' && (
                                      <DropdownMenuItem
                                        onClick={() => handleComplete(item.id)}
                                        disabled={actionLoading === item.id}
                                        className="cursor-pointer text-blue-600"
                                      >
                                        <Check className="h-4 w-4 mr-2" />
                                        Mark Complete
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={10}
                            className="text-center py-8 text-gray-500"
                          >
                            {searchQuery
                              ? `No transactions found matching "${searchQuery}".`
                              : filter === "All"
                              ? "No transactions found."
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
      
      {/* Reject Dialog */}
      <RejectDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        onConfirm={confirmReject}
        studentEmail={selectedTransactionEmail}
      />
    </SidebarProvider>
  );
};

export default Transaction;