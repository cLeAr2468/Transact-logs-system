"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Search, ArrowLeft, Loader2, Eye, MoreVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Card, CardContent } from "@/components/ui/card";
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/Asidebar';
import { toast } from "sonner";
import api from "@/api";

export default function TransactionsByPurposePage() {
  const { purposeName } = useParams();
  const navigate = useNavigate();
  const decodedPurpose = decodeURIComponent(purposeName);
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchTransactions();
  }, [decodedPurpose]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      // Fetch all transactions using pure relationship
      const response = await api.get('/admin/appointments');
      
      // Filter by purpose name
      const filtered = (response.data.transactions || []).filter(
        (txn) => txn.purpose?.name === decodedPurpose
      );
      
      setTransactions(filtered);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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

  const getDisplayStatus = (status) => {
    if (!status) return 'N/A';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Filter transactions by search and status
  const filteredTransactions = transactions.filter((transaction) => {
    // Get student name from pure relationship (user.masterlist)
    const masterlist = transaction.user?.masterlist;
    const studentName = masterlist ? `${masterlist.fname} ${masterlist.lname}` : '';
    const studentId = transaction.user?.student_id || '';
    const course = masterlist?.course || '';
    
    const matchesSearch = searchTerm === "" || 
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || 
      getDisplayStatus(transaction.status) === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Calculate statistics
  const totalCount = filteredTransactions.length;
  const pendingCount = filteredTransactions.filter(t => t.status === 'pending').length;
  const approvedCount = filteredTransactions.filter(t => t.status === 'approved').length;
  const completedCount = filteredTransactions.filter(t => t.status === 'completed').length;
  const rejectedCount = filteredTransactions.filter(t => t.status === 'rejected').length;
  const cancelledCount = filteredTransactions.filter(t => t.status === 'cancelled').length;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#f6f7fb]">
        <AppSidebar />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="border-t-2 bg-white rounded-t-lg mb-0">
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate('/dashboard')}
                    className="border-slate-300 hover:bg-slate-50"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <h1 className="text-3xl font-light text-slate-800">
                      {decodedPurpose}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                      {totalCount} {totalCount === 1 ? 'Transaction' : 'Transactions'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="bg-white border-x border-gray-200 px-6 py-4">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
                  <div className="text-xs text-gray-600">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-700">{pendingCount}</div>
                  <div className="text-xs text-gray-600">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700">{approvedCount}</div>
                  <div className="text-xs text-gray-600">Approved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700">{completedCount}</div>
                  <div className="text-xs text-gray-600">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-700">{rejectedCount}</div>
                  <div className="text-xs text-gray-600">Rejected</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-700">{cancelledCount}</div>
                  <div className="text-xs text-gray-600">Cancelled</div>
                </div>
              </div>
            </div>

            {/* Main Container */}
            <Card className="shadow-sm rounded-b-lg rounded-t-none">
              <CardContent className="p-6">
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
                  {/* Search */}
                  <div className="md:col-span-6">
                    <label className="text-sm font-medium text-slate-600 mb-2 block">
                      Search Transactions
                    </label>
                    <div className="relative bg-white">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by student name, ID, or course..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Spacer */}
                  <div className="md:col-span-4"></div>

                  {/* Status Filter */}
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-slate-600 mb-2 block">
                      Status
                    </label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full rounded-md bg-white border-gray-300">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Status</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Table */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead>Date Requested</TableHead>
                        <TableHead>Appointment Date</TableHead>
                        <TableHead>Time Slot</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Student ID</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                            <p className="text-sm text-gray-500 mt-2">Loading transactions...</p>
                          </TableCell>
                        </TableRow>
                      ) : filteredTransactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8">
                            <p className="text-sm text-gray-500">No transactions found</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedTransactions.map((item) => {
                          const masterlist = item.user?.masterlist;
                          const studentName = masterlist ? `${masterlist.fname} ${masterlist.lname}` : 'N/A';
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
                              <TableCell>{item.user?.student_id || 'N/A'}</TableCell>
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
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                  
                  {/* Pagination */}
                  {!loading && filteredTransactions.length > 0 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
