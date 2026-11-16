import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/Asidebar';
import { Pagination } from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { ArrowLeft, User, Mail, MapPin, GraduationCap, Calendar, CheckCircle, XCircle, Loader2, School, FileText, Filter } from 'lucide-react';
import { getUser } from '../../api/userApi';
import api from '../../api';
import { toast } from 'sonner';

const ClientDetails = () => {
  const { userId } = useParams(); // This is actually student_id from URL
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    completed: 0,
    cancelled: 0,
    rejected: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchUserDetails();
    fetchUserStatistics();
    fetchUserTransactions();
  }, [userId]);

  useEffect(() => {
    filterTransactions();
  }, [transactions, selectedStatus]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await getUser(userId); // userId is actually student_id
      setUser(response.user);
    } catch (err) {
      setError(err.message || 'Failed to load user details');
      toast.error(err.message || 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStatistics = async () => {
    try {
      const response = await api.get(`/users/${userId}/transactions/statistics`); // userId is actually student_id
      setStatistics(response.data.statistics);
    } catch (err) {
      console.error('Failed to load statistics:', err);
    }
  };

  const fetchUserTransactions = async () => {
    try {
      setTransactionsLoading(true);
      const response = await api.get(`/users/${userId}/transactions`);
      setTransactions(response.data.transactions || []);
    } catch (err) {
      console.error('Failed to load transactions:', err);
      toast.error('Failed to load transactions');
    } finally {
      setTransactionsLoading(false);
    }
  };

  const filterTransactions = () => {
    if (selectedStatus === 'All') {
      setFilteredTransactions(transactions);
    } else {
      setFilteredTransactions(
        transactions.filter(t => t.status.toLowerCase() === selectedStatus.toLowerCase())
      );
    }
  };

  const hideMiddleName = (mname) => {
    if (!mname) return false;
    return /^N\.?A\.?$/i.test(mname.trim());
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

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'approved':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  const statuses = ['All', 'Pending', 'Approved', 'Completed', 'Cancelled', 'Rejected'];

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <main className="flex-1 overflow-auto bg-gray-50">
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-green-700" />
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  if (error || !user) {
    return (
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <main className="flex-1 overflow-auto bg-gray-50">
            <div className="p-6">
              <div className="text-center py-12">
                <XCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                <p className="text-lg text-red-500 mb-4">{error || 'User not found'}</p>
                <Button onClick={() => navigate('/manage-client')} className="bg-[#15592F] hover:bg-[#124b28]">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Client List
                </Button>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  const fullName = `${user.fname || ''} ${!hideMiddleName(user.mname) && user.mname ? user.mname : ''} ${user.lname || ''}`.trim();

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/manage-client')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <h1 className="text-3xl font-light text-gray-900">Client Details</h1>
              </div>
              <Badge variant={user.status === 'Active' ? 'default' : 'destructive'} className={user.status === 'Active' ? 'bg-green-600 text-lg px-4 py-2' : 'text-lg px-4 py-2'}>
                {user.status}
              </Badge>
            </div>

            {/* User Information Card */}
            <Card className="bg-white shadow-sm rounded-2xl mb-6">
              <CardContent className="p-8">
                <div className="flex items-start gap-8">
                  {/* Avatar */}
                  <div className="w-32 h-32 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-4xl font-bold text-green-700">
                      {user.fname?.charAt(0)}{user.lname?.charAt(0)}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex-1 grid grid-cols-2 gap-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">{fullName}</h2>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-gray-700">
                          <User className="w-5 h-5 text-gray-400" />
                          <span className="font-medium">Student ID:</span>
                          <span>{user.student_id}</span>
                        </div>
                        
                        <div className="flex items-center gap-3 text-gray-700">
                          <Mail className="w-5 h-5 text-gray-400" />
                          <span className="font-medium">Email:</span>
                          <span>{user.email}</span>
                        </div>

                        <div className="flex items-center gap-3 text-gray-700">
                          <GraduationCap className="w-5 h-5 text-gray-400" />
                          <span className="font-medium">Course:</span>
                          <span>{user.course}</span>
                        </div>

                        <div className="flex items-center gap-3 text-gray-700">
                          <School className="w-5 h-5 text-gray-400" />
                          <span className="font-medium">Year Level:</span>
                          <span>{user.year_level}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Address Information</h3>
                      <div className="flex items-start gap-3 text-gray-700">
                        <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                        <div>
                          <p>{user.barangay}</p>
                          <p>{user.municipality}</p>
                          <p>{user.province}</p>
                          <p className="text-sm text-gray-500">{user.region}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transaction Statistics */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Transaction Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Card className="bg-white shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-gray-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
                        <p className="text-xs text-gray-600">Total</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-orange-50 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-8 h-8 text-orange-600" />
                      <div>
                        <p className="text-2xl font-bold text-orange-900">{statistics.pending}</p>
                        <p className="text-xs text-orange-700">Pending</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-blue-50 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-8 h-8 text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold text-blue-900">{statistics.approved}</p>
                        <p className="text-xs text-blue-700">Approved</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold text-green-900">{statistics.completed}</p>
                        <p className="text-xs text-green-700">Completed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-50 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <XCircle className="w-8 h-8 text-gray-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{statistics.cancelled}</p>
                        <p className="text-xs text-gray-700">Cancelled</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-red-50 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <XCircle className="w-8 h-8 text-red-600" />
                      <div>
                        <p className="text-2xl font-bold text-red-900">{statistics.rejected}</p>
                        <p className="text-xs text-red-700">Rejected</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Transactions Table */}
            <Card className="bg-white shadow-sm rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
                  
                  {/* Status Filter */}
                  <div className="flex items-center gap-3">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Status:</span>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-40 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Transactions Table */}
                <div className="overflow-x-auto">
                  {transactionsLoading ? (
                    <div className="text-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-500">Loading transactions...</p>
                    </div>
                  ) : (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Transaction ID</TableHead>
                            <TableHead>Purpose</TableHead>
                            <TableHead>Request Type</TableHead>
                            <TableHead>Schedule Date</TableHead>
                            <TableHead>Time Slot</TableHead>
                            <TableHead>Date Requested</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredTransactions.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-12">
                                <FileText className="w-12 h-12 mx-auto mb-2 opacity-30 text-gray-400" />
                                <p className="text-sm text-gray-400">
                                  {selectedStatus === 'All' 
                                    ? 'No transactions found for this client.' 
                                    : `No ${selectedStatus.toLowerCase()} transactions found.`}
                                </p>
                              </TableCell>
                            </TableRow>
                          ) : (
                            paginatedTransactions.map((transaction) => (
                              <TableRow key={transaction.id}>
                                <TableCell className="font-medium">#{transaction.id}</TableCell>
                                <TableCell>{transaction.purpose?.name || transaction.purpose_name || 'N/A'}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="capitalize">
                                    {transaction.request_type || 'online'}
                                  </Badge>
                                </TableCell>
                                <TableCell>{formatDate(transaction.schedule_date)}</TableCell>
                                <TableCell>{transaction.time_slot || 'N/A'}</TableCell>
                                <TableCell>{formatDateTime(transaction.date_requested || transaction.created_at)}</TableCell>
                                <TableCell>
                                  <Badge className={`${getStatusColor(transaction.status)} border capitalize`}>
                                    {transaction.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>

                      {/* Pagination */}
                      {!transactionsLoading && filteredTransactions.length > 0 && (
                        <div className="mt-4">
                          <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ClientDetails;
