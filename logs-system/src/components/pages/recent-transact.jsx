import { useState, useEffect } from 'react';
import { Search, Calendar, Loader2, ChevronLeft, ChevronRight, Trash2, Users, Shield, UserCircle } from 'lucide-react';
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
import { toast } from 'sonner';

const RecentTransact = () => {
  const [loading, setLoading] = useState(false);
  const [activityLogs, setActivityLogs] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    admin_count: 0,
    staff_count: 0,
    client_count: 0,
  });
  const [filterType, setFilterType] = useState(null); // null = all, 'admin', 'staff', 'client'
  const [isAdmin, setIsAdmin] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
  });

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://logs-server-system-production.up.railway.app/api';

  useEffect(() => {
    // Check if user is admin
    const userType = localStorage.getItem('user_type');
    setIsAdmin(userType === 'admin');
    
    fetchStatistics();
    fetchActivityLogs();
  }, []);

  useEffect(() => {
    fetchActivityLogs();
  }, [pagination.current_page, filterType]);

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/activity-logs/statistics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      // Only update statistics if response is successful
      if (response.ok && data.success !== false) {
        setStatistics(data.statistics || {
          total: 0,
          admin_count: 0,
          staff_count: 0,
          client_count: 0,
        });
      } else {
        console.error('Failed to fetch statistics:', data.message || response.statusText);
        // Don't update state, keep old data
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      // Don't update state on error, keep old data
    }
  };

  const fetchActivityLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required. Please log in.');
        setLoading(false);
        return;
      }

      const params = new URLSearchParams({
        per_page: pagination.per_page,
        page: pagination.current_page,
      });

      // Add filter if admin and filter is selected
      if (filterType && isAdmin) {
        params.append('filter_type', filterType);
      }

      const response = await fetch(`${API_BASE_URL}/activity-logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      // Only update state if response is successful
      if (response.ok && data.success !== false) {
        setActivityLogs(data.logs || []);
        setPagination({
          current_page: data.current_page || 1,
          last_page: data.last_page || 1,
          per_page: data.per_page || 20,
          total: data.total || 0,
        });
      } else {
        // Handle error responses
        if (response.status === 401) {
          toast.error('Session expired. Please log in again.');
          localStorage.removeItem('admin_token');
          localStorage.removeItem('token');
          // Don't update state, keep old data
        } else {
          const errorMessage = data.message || response.statusText || 'Failed to load activity logs';
          toast.error(`Failed to load activity logs: ${errorMessage}`);
          // Don't update state, keep old data
        }
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      toast.error(`Failed to load activity logs: ${error.message}`);
      // Don't update state on network error, keep old data
    } finally {
      setLoading(false);
    }
  };

  const handleClearLogs = async () => {
    if (!window.confirm('Are you sure you want to clear all your activity logs? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/activity-logs/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      // Only refresh data if deletion was successful
      if (response.ok && data.success !== false) {
        toast.success(data.message || 'Activity logs cleared successfully');
        // Refresh data only after successful deletion
        fetchStatistics();
        fetchActivityLogs();
      } else {
        const errorMessage = data.message || response.statusText || 'Failed to clear logs';
        toast.error(`Failed to clear logs: ${errorMessage}`);
        // Don't refresh data on error
      }
    } catch (error) {
      console.error('Error clearing logs:', error);
      toast.error(`Failed to clear logs: ${error.message}`);
      // Don't refresh data on error
    }
  };

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

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Activity Logs</h1>
                <p className="text-sm text-gray-500">
                  {isAdmin ? 'View all system activities' : 'View your activity records'}
                </p>
              </div>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleClearLogs}
                disabled={loading || activityLogs.length === 0}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Logs
              </Button>
            </div>

            {/* Statistics Cards (Admin Only) */}
            {isAdmin && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Total Activities */}
                <Card className="bg-gradient-to-br from-[#15592F] to-[#0d3d20] text-white border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setFilterType(null)}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Users className="w-8 h-8 text-white/80" />
                      {filterType === null && (
                        <Badge className="bg-white/20 text-white border-0">Active</Badge>
                      )}
                    </div>
                    <div className="text-3xl font-bold mb-1">{statistics.total.toLocaleString()}</div>
                    <p className="text-sm text-white/80">Total Activities</p>
                  </CardContent>
                </Card>

                {/* Admin Activities */}
                <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setFilterType('admin')}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Shield className="w-8 h-8 text-red-600" />
                      {filterType === 'admin' && (
                        <Badge className="bg-red-100 text-red-800 border-0">Active</Badge>
                      )}
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {statistics.admin_count.toLocaleString()}
                    </div>
                    <p className="text-sm text-gray-500">Admin Activities</p>
                  </CardContent>
                </Card>

                {/* Staff Activities */}
                <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setFilterType('staff')}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <UserCircle className="w-8 h-8 text-blue-600" />
                      {filterType === 'staff' && (
                        <Badge className="bg-blue-100 text-blue-800 border-0">Active</Badge>
                      )}
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {statistics.staff_count.toLocaleString()}
                    </div>
                    <p className="text-sm text-gray-500">Staff Activities</p>
                  </CardContent>
                </Card>

                {/* Client Activities */}
                <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setFilterType('client')}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Users className="w-8 h-8 text-green-600" />
                      {filterType === 'client' && (
                        <Badge className="bg-green-100 text-green-800 border-0">Active</Badge>
                      )}
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {statistics.client_count.toLocaleString()}
                    </div>
                    <p className="text-sm text-gray-500">Client Activities</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Activity Logs Table */}
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    {filterType === null && 'All Activities'}
                    {filterType === 'admin' && 'Admin Activities'}
                    {filterType === 'staff' && 'Staff Activities'}
                    {filterType === 'client' && 'Client Activities'}
                    {' '}({pagination.total.toLocaleString()})
                  </CardTitle>
                  {isAdmin && filterType !== null && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setFilterType(null)}
                    >
                      Clear Filter
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Date & Time</TableHead>
                      {isAdmin && <TableHead className="w-[100px]">User Type</TableHead>}
                      {isAdmin && <TableHead className="w-[150px]">User</TableHead>}
                      <TableHead className="w-[120px]">Action</TableHead>
                      <TableHead className="w-[140px]">Module</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={isAdmin ? 6 : 4} className="text-center py-12">
                          <div className="flex flex-col items-center">
                            <Loader2 className="w-8 h-8 animate-spin text-[#15592F] mb-2" />
                            <span className="text-gray-500">Loading activity logs...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : activityLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={isAdmin ? 6 : 4} className="text-center py-12 text-gray-500">
                          No activity logs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      activityLogs.map((log, index) => (
                        <TableRow key={log.id || index} className="hover:bg-gray-50">
                          <TableCell className="font-medium">
                            {formatDateTime(log.created_at)}
                          </TableCell>
                          {isAdmin && (
                            <TableCell>
                              <Badge 
                                className={
                                  log.user_type === 'admin' 
                                    ? 'bg-red-100 text-red-800' 
                                    : log.user_type === 'staff'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-green-100 text-green-800'
                                }
                              >
                                {log.user_type}
                              </Badge>
                            </TableCell>
                          )}
                          {isAdmin && (
                            <TableCell className="font-medium text-sm">
                              {log.user_name || 'N/A'}
                            </TableCell>
                          )}
                          <TableCell>
                            <Badge className={`${getActionColor(log.action)}`}>
                              {log.action.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="capitalize">{log.module}</TableCell>
                          <TableCell className="text-sm">{log.description}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {!loading && activityLogs.length > 0 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="text-sm text-gray-500">
                      Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
                      {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
                      {pagination.total} logs
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
