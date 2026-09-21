import { useState, useEffect } from 'react';
import { Calendar, RefreshCw, CheckCircle, Star, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
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
  const [activityLogs, setActivityLogs] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
      const [statsRes, activityLogsRes, performanceRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/dashboard/statistics?${params}`, { headers }),
        fetch(`${API_BASE_URL}/activity-logs/recent?limit=100`, { headers }), // Increased limit for pagination
        fetch(`${API_BASE_URL}/admin/dashboard/performance?${params}`, { headers })
      ]);

      console.log('📊 API Responses:', {
        statistics: statsRes.status,
        activityLogs: activityLogsRes.status,
        performance: performanceRes.status
      });

      // Handle statistics response
      if (statsRes.ok) {
        const statsText = await statsRes.text();
        console.log('📄 Raw statistics response:', statsText);
        
        try {
          const statsData = JSON.parse(statsText);
          console.log('✅ Parsed statistics data:', statsData);
          
          if (statsData && statsData.statistics) {
            setStatistics(statsData.statistics);
            console.log('📊 Statistics set successfully:', statsData.statistics);
          } else {
            console.error('❌ No statistics in response:', statsData);
            toast.error('Invalid statistics data received');
          }
        } catch (parseError) {
          console.error('❌ Failed to parse statistics JSON:', parseError);
          toast.error('Invalid statistics response format');
        }
      } else {
        const errorData = await statsRes.json().catch(() => ({}));
        console.error('❌ Statistics failed:', statsRes.status, errorData);
        toast.error(`Failed to load statistics: ${errorData.message || statsRes.statusText}`);
      }

      // Handle activity logs response
      if (activityLogsRes.ok) {
        const activityData = await activityLogsRes.json();
        console.log('✅ Activity logs data:', activityData);
        setActivityLogs(activityData.logs || []);
      } else {
        const errorData = await activityLogsRes.json().catch(() => ({}));
        console.error('❌ Activity logs failed:', activityLogsRes.status, errorData);
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
      if (statsRes.status === 401 || activityLogsRes.status === 401 || performanceRes.status === 401) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('token');
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

 // ...existing code...

const getTrendLabel = (value, fallback = 'On track') => {
  if (!value || typeof value !== 'string') return fallback;
  const cleaned = value.replace(/[+-]?\d+(\.\d+)?%/g, '').trim();
  return cleaned || fallback;
};

// Build stats array from backend data
const stats = statistics ? [
  {
    title: 'Total Transactions',
    value: statistics.total_transactions?.toLocaleString() || '0',
    description: `${Math.round(statistics.target_percentage || 0)}% of target`,
    icon: RefreshCw,
    trend: (statistics.target_percentage || 0) > 100 ? '' : '',
    trendUp: (statistics.target_percentage || 0) >= 50,
    progress: Math.max(0, statistics.target_percentage || 0),
    progressColor: 'from-green-700 to-green-900'
  },
  {
    title: 'Pending Requests',
    value: statistics.pending_requests?.toLocaleString() || '0',
    description: '',
    icon: Calendar,
    trend: getTrendLabel(statistics.pending_trend, 'Monitor'),
    trendUp: false,
    progress: (statistics.total_transactions || 0) > 0
      ? Math.round(((statistics.pending_requests || 0) / (statistics.total_transactions || 1)) * 100)
      : 0,
    progressColor: 'from-orange-500 to-orange-600'
  },
  {
    title: 'Completed Services',
    value: statistics.completed_services?.toLocaleString() || '0',
    description: `${statistics.completion_rate || 0}% completion rate`,
    icon: CheckCircle,
    trend: (statistics.completion_rate || 0) >= 80 ? 'Strong' : (statistics.completion_rate || 0) >= 60 ? 'Good' : 'Monitor',
    trendUp: (statistics.completion_rate || 0) >= 70,
    progress: statistics.completion_rate || 0,
    progressColor: 'from-blue-500 to-blue-600'
  },
  {
    title: 'Feedback Score',
    value: (statistics.feedback_score || 0) > 0 ? (statistics.feedback_score || 0).toFixed(1) : '0.0',
    suffix: '/5',
    description: (statistics.feedback_count || 0) > 0
      ? `Based on ${statistics.feedback_count || 0} ${(statistics.feedback_count || 0) === 1 ? 'review' : 'reviews'}`
      : 'No feedback yet',
    icon: Star,
    trend: (statistics.feedback_score || 0) >= 4.5 ? 'Excellent' : (statistics.feedback_score || 0) >= 4.0 ? 'Great' : (statistics.feedback_score || 0) >= 3.0 ? 'Fair' : 'Review',
    trendUp: (statistics.feedback_score || 0) >= 4.0,
    rating: statistics.feedback_score || 0
  }
] : [];

// Pagination logic for activity logs
  const totalPages = Math.ceil(activityLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedActivityLogs = activityLogs.slice(startIndex, endIndex);

// ...existing code...

  const getActionColor = (action) => {
    switch (action.toLowerCase()) {
      case 'logged_in':
        return 'bg-green-100 text-green-800';
      case 'logged_out':
        return 'bg-gray-100 text-gray-800';
      case 'created':
        return 'bg-blue-100 text-blue-800';
      case 'updated':
        return 'bg-yellow-100 text-yellow-800';
      case 'deleted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
              ) : !statistics ? (
                <div className="col-span-full flex flex-col items-center justify-center py-12">
                  <p className="text-red-500 font-semibold">⚠️ No statistics data available</p>
                  <p className="text-gray-500 text-sm mt-2">Please check console for errors</p>
                  <Button 
                    onClick={fetchDashboardData} 
                    className="mt-4 bg-[#15592F] hover:bg-[#0d3d20]"
                  >
                    Retry
                  </Button>
                </div>
              ) : stats.length === 0 ? (
                <div className="col-span-full flex items-center justify-center py-12">
                  <p className="text-gray-500">No statistics available</p>
                </div>
              ) : (
                stats.map((stat, index) => (
                  <Card key={index} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <stat.icon className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                        {stat.suffix && <span className="text-lg text-gray-500">{stat.suffix}</span>}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{stat.title}</p>
                      {stat.title === 'Pending Requests' && stat.progress !== undefined && (
                        <p className="text-xs text-gray-500 mb-1">{stat.progress}%</p>
                      )}
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
                          Activity Logs
                        </CardTitle>
                        <CardDescription>Recent Activity</CardDescription>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-green-600 hover:text-green-700"
                        onClick={() => navigate('/Activity')}
                      >
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Module</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>IP Address</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                              <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                            </TableCell>
                          </TableRow>
                        ) : activityLogs.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                              No recent activity logs
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedActivityLogs.map((log, index) => (
                            <TableRow key={log.id || index}>
                              <TableCell className="text-sm">
                                {new Date(log.created_at).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </TableCell>
                              <TableCell>
                                <Badge className={`${getActionColor(log.action)}`}>
                                  {log.action.replace('_', ' ').toUpperCase()}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">{log.module || 'System'}</TableCell>
                              <TableCell className="text-sm text-gray-600">{log.description || '-'}</TableCell>
                              <TableCell className="text-sm text-gray-500">{log.ip_address || '-'}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                    
                    {/* Pagination */}
                    {!loading && activityLogs.length > 0 && (
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                      />
                    )}
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
