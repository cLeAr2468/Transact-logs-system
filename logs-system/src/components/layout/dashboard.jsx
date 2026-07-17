import { useState, useEffect } from 'react';
import { Calendar, RefreshCw, CheckCircle, Star, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './Asidebar';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Initialize with current month date range
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const [dateRange, setDateRange] = useState({
    start: firstDay.toISOString().split('T')[0],
    end: lastDay.toISOString().split('T')[0],
  });
  
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://logs-server-system-production.up.railway.app/api';

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required. Please log in.');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      console.log('🔍 Fetching dashboard data...', {
        dateRange,
        API_BASE_URL,
        hasToken: !!token
      });

      // Build query parameters for date range
      const params = new URLSearchParams();
      if (dateRange.start && dateRange.end) {
        params.append('start_date', dateRange.start);
        params.append('end_date', dateRange.end);
      }

      // Fetch all dashboard data in parallel with date range filters
      const [statsRes, transactionsRes, performanceRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/dashboard/statistics?${params}`, { headers }),
        fetch(`${API_BASE_URL}/admin/dashboard/recent-transactions?limit=10&${params}`, { headers }),
        fetch(`${API_BASE_URL}/admin/dashboard/performance?${params}`, { headers })
      ]);

      console.log('📊 API Responses:', {
        statistics: statsRes.status,
        transactions: transactionsRes.status,
        performance: performanceRes.status
      });

      // Handle statistics response
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        console.log('✅ Statistics data:', statsData);
        setStatistics(statsData.statistics);
      } else {
        const errorData = await statsRes.json().catch(() => ({}));
        console.error('❌ Statistics failed:', statsRes.status, errorData);
        toast.error(`Failed to load statistics: ${errorData.message || statsRes.statusText}`);
      }

      // Handle transactions response
      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json();
        console.log('✅ Transactions data:', transactionsData);
        setTransactions(transactionsData.transactions);
      } else {
        const errorData = await transactionsRes.json().catch(() => ({}));
        console.error('❌ Transactions failed:', transactionsRes.status, errorData);
      }

      // Handle performance response
      if (performanceRes.ok) {
        const performanceResData = await performanceRes.json();
        console.log('✅ Performance data:', performanceResData);
        setPerformanceData(performanceResData.performance);
      } else {
        const errorData = await performanceRes.json().catch(() => ({}));
        console.error('❌ Performance failed:', performanceRes.status, errorData);
      }

      // Check for 401 Unauthorized
      if (statsRes.status === 401 || transactionsRes.status === 401 || performanceRes.status === 401) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('token');
        // Optionally redirect to login
        // window.location.href = '/login';
      }

    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      toast.error(`Failed to load dashboard data: ${error.message}`);
    } finally {
      setLoading(false);
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

  // Build stats array from backend data
  const stats = statistics ? [
    {
      title: 'Total Transactions',
      value: statistics.total_transactions.toLocaleString(),
      description: `${statistics.target_percentage}% of monthly target`,
      icon: RefreshCw,
      trend: '+2.4%',
      trendUp: true,
      progress: statistics.target_percentage,
      progressColor: 'from-black to-gray-800'
    },
    {
      title: 'Pending Requests',
      value: statistics.pending_requests.toLocaleString(),
      description: 'Needs attention soon',
      icon: Calendar,
      trend: statistics.pending_trend,
      trendUp: false,
      progress: 45,
      progressColor: 'from-orange-500 to-orange-600'
    },
    {
      title: 'Completed Services',
      value: statistics.completed_services.toLocaleString(),
      description: `${statistics.completion_rate}% completion rate`,
      icon: CheckCircle,
      trend: '+8.7%',
      trendUp: true,
      progress: statistics.completion_rate,
      progressColor: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Feedback Score',
      value: statistics.feedback_score.toString(),
      suffix: '/5',
      description: `Based on ${statistics.feedback_count} reviews`,
      icon: Star,
      trend: '+0.3',
      trendUp: true,
      rating: statistics.feedback_score
    }
  ] : [];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'processing':
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : i < rating
            ? 'text-yellow-400 fill-current opacity-50'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  // Assign colors to performance data
  const colors = ['from-emerald-400 to-emerald-500', 'from-lime-400 to-lime-500', 'from-yellow-400 to-yellow-500', 'from-green-400 to-green-500', 'from-pink-400 to-pink-500'];
  const performanceWithColors = performanceData.map((item, index) => ({
    ...item,
    color: colors[index % colors.length]
  }));

  // Calculate max value for progress bars
  const maxPerformanceValue = Math.max(...performanceData.map(p => p.value), 1);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />  
        <main className="flex-1 overflow-auto">
          <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <DateRangePicker
                  value={dateRange}
                  onChange={setDateRange}
                />
                <span className="text-sm text-gray-500">({formatDateRange()})</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {loading ? (
                <div className="col-span-full flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#15592F]" />
                  <span className="ml-3 text-gray-500">Loading dashboard...</span>
                </div>
              ) : (
                stats.map((stat, index) => (
                  <Card key={index} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <stat.icon className="w-5 h-5 text-gray-500" />
                        <span className={`text-sm font-medium ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                          {stat.trend}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                        {stat.suffix && <span className="text-lg text-gray-500">{stat.suffix}</span>}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{stat.title}</p>
                      <p className="text-xs text-gray-500">{stat.description}</p>
                      
                      {stat.progress !== undefined && (
                        <div className="mt-3">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full bg-gradient-to-r ${stat.progressColor} transition-all duration-500`}
                              style={{ width: `${Math.min(stat.progress, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {stat.rating && (
                        <div className="flex mt-2">
                          {renderStars(stat.rating)}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Recent Transactions */}
              <div className="lg:col-span-3">
                <Card className="bg-white border-0 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-semibold">
                          Recent Transactions
                        </CardTitle>
                        <CardDescription>Latest service requests for the selected period</CardDescription>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-green-600 hover:text-green-700"
                        onClick={() => navigate('/recent-transact')}
                      >
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Student</TableHead>
                          <TableHead>Purpose</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead>Course</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                            </TableCell>
                          </TableRow>
                        ) : transactions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                              No recent transactions
                            </TableCell>
                          </TableRow>
                        ) : (
                          transactions.map((transaction, index) => (
                            <TableRow key={transaction.id || index}>
                              <TableCell>{transaction.date}</TableCell>
                              <TableCell className="font-medium">{transaction.student}</TableCell>
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
                  </CardContent>
                </Card>
              </div>

              {/* Performance Summary */}
              <div className="lg:col-span-1 left">
                <Card className="bg-gradient-to-br from-[#15592F] to-[#0d3d20] text-white h-full">
                  <CardHeader>
                    <CardTitle className="text-white text-[14px]">
                      Performance Summary
                    </CardTitle>
                    <CardDescription className="text-green-100 text-[14px]">
                      Top purposes for selected period
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {loading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-green-100" />
                        </div>
                      ) : performanceWithColors.length === 0 ? (
                        <div className="text-center py-8 text-green-100">
                          No performance data
                        </div>
                      ) : (
                        performanceWithColors.map((item, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-green-100">{item.label}</span>
                              <span className="text-sm font-semibold text-white">{item.value}</span>
                            </div>
                            <div className="h-2 bg-green-900/40 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-500`}
                                style={{ width: `${(item.value / maxPerformanceValue) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
