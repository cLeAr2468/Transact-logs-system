import { useState, useEffect } from 'react';
import { Search, Calendar, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '../layout/Asidebar';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { toast } from 'sonner';

const RecentTransact = () => {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
  });

  // Initialize with current month
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const [dateRange, setDateRange] = useState({
    start: firstDay.toISOString().split('T')[0],
    end: lastDay.toISOString().split('T')[0],
  });

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://logs-server-system-production.up.railway.app/api';

  useEffect(() => {
    fetchTransactions();
  }, [dateRange, pagination.current_page]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required. Please log in.');
        return;
      }

      const params = new URLSearchParams({
        per_page: pagination.per_page,
        page: pagination.current_page,
      });

      if (dateRange.start && dateRange.end) {
        params.append('start_date', dateRange.start);
        params.append('end_date', dateRange.end);
      }

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`${API_BASE_URL}/admin/dashboard/all-transactions?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.data || []);
        setPagination({
          current_page: data.current_page || 1,
          last_page: data.last_page || 1,
          per_page: data.per_page || 20,
          total: data.total || 0,
        });
      } else if (response.status === 401) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('token');
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(`Failed to load transactions: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error(`Failed to load transactions: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination({ ...pagination, current_page: 1 });
    fetchTransactions();
  };

  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
    setPagination({ ...pagination, current_page: 1 });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateRange = () => {
    if (!dateRange.start || !dateRange.end) return '';
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    const startStr = start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    return `${startStr} - ${endStr}`;
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.last_page) {
      setPagination({ ...pagination, current_page: page });
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />  
        <main className="flex-1 overflow-auto">
          <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Recent Transactions</h1>
              <p className="text-sm text-gray-500">View and search all transaction records</p>
            </div>

            {/* Filters */}
            <Card className="mb-6 bg-white border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Date Range Picker */}
                  <div className="flex-shrink-0">
                    <DateRangePicker
                      value={dateRange}
                      onChange={handleDateRangeChange}
                    />
                  </div>

                  {/* Search Bar */}
                  <div className="flex-1 flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="Search by student name, purpose, or address..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="pl-10 bg-white border-gray-300"
                      />
                    </div>
                    <Button
                      onClick={handleSearch}
                      className="bg-[#15592F] hover:bg-[#0d3d20] text-white"
                    >
                      Search
                    </Button>
                  </div>
                </div>

                {/* Date Range Display */}
                {dateRange.start && dateRange.end && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Showing transactions from {formatDateRange()}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Transactions Table */}
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    All Transactions ({pagination.total.toLocaleString()})
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Date</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead className="w-[120px]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#15592F]" />
                          <span className="ml-3 text-gray-500">Loading transactions...</span>
                        </TableCell>
                      </TableRow>
                    ) : transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                          No transactions found for the selected period
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((transaction, index) => (
                        <TableRow key={transaction.id || index} className="hover:bg-gray-50">
                          <TableCell className="font-medium">{transaction.date}</TableCell>
                          <TableCell>{transaction.student}</TableCell>
                          <TableCell>{transaction.purpose}</TableCell>
                          <TableCell>{transaction.address}</TableCell>
                          <TableCell>{transaction.course}</TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(transaction.status)}`}>
                              {transaction.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {!loading && transactions.length > 0 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="text-sm text-gray-500">
                      Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
                      {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
                      {pagination.total} transactions
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(pagination.current_page - 1)}
                        disabled={pagination.current_page === 1}
                        className="flex items-center gap-1"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                          let pageNum;
                          if (pagination.last_page <= 5) {
                            pageNum = i + 1;
                          } else if (pagination.current_page <= 3) {
                            pageNum = i + 1;
                          } else if (pagination.current_page >= pagination.last_page - 2) {
                            pageNum = pagination.last_page - 4 + i;
                          } else {
                            pageNum = pagination.current_page - 2 + i;
                          }

                          return (
                            <Button
                              key={i}
                              variant={pagination.current_page === pageNum ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => goToPage(pageNum)}
                              className={
                                pagination.current_page === pageNum
                                  ? 'bg-[#15592F] hover:bg-[#0d3d20] text-white'
                                  : ''
                              }
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(pagination.current_page + 1)}
                        disabled={pagination.current_page === pagination.last_page}
                        className="flex items-center gap-1"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default RecentTransact;
