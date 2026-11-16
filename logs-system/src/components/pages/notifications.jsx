import { useState, useEffect } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/Asidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/api/notificationApi';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications(currentPage);
  }, [currentPage]);

  const fetchNotifications = async (page = 1) => {
    try {
      setLoading(true);
      const data = await getNotifications(page);
      setNotifications(data.notifications);
      setUnreadCount(data.unread_count);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.is_read) {
        await markNotificationAsRead(notification.id);
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
        );
      }
      
      // Navigate to transaction details
      navigate(`/transact/${notification.transaction_id}`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAllRead(true);
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
      // Refresh to update the list
      fetchNotifications(currentPage);
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark notifications as read');
    } finally {
      setMarkingAllRead(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.last_page) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderPagination = () => {
    if (pagination.last_page <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.last_page, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-6">
        <Button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          variant="outline"
          size="sm"
          className="bg-white"
        >
          Previous
        </Button>

        {startPage > 1 && (
          <>
            <Button
              onClick={() => handlePageChange(1)}
              variant="outline"
              size="sm"
              className="bg-white"
            >
              1
            </Button>
            {startPage > 2 && <span className="text-white">...</span>}
          </>
        )}

        {pages.map((page) => (
          <Button
            key={page}
            onClick={() => handlePageChange(page)}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            className={currentPage === page ? "bg-[#15592F] text-white" : "bg-white"}
          >
            {page}
          </Button>
        ))}

        {endPage < pagination.last_page && (
          <>
            {endPage < pagination.last_page - 1 && <span className="text-white">...</span>}
            <Button
              onClick={() => handlePageChange(pagination.last_page)}
              variant="outline"
              size="sm"
              className="bg-white"
            >
              {pagination.last_page}
            </Button>
          </>
        )}

        <Button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === pagination.last_page}
          variant="outline"
          size="sm"
          className="bg-white"
        >
          Next
        </Button>

        <span className="text-sm text-white ml-2">
          Page {pagination.current_page} of {pagination.last_page}
        </span>
      </div>
    );
  };

  const getNotificationIcon = (type) => {
    const icons = {
      approved: '✅',
      rejected: '❌',
      completed: '🎉',
      cancelled: '🚫',
      new_request: '📝',
    };
    return icons[type] || '📬';
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const notifDate = new Date(timestamp);
    const diffInMs = now - notifDate;
    const diffInMinutes = Math.floor(diffInMs / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return notifDate.toLocaleDateString();
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#f6f7fb]">
        <AppSidebar />

        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-[#15592F]">Notifications</h1>
                <p className="text-gray-600 mt-1">
                  {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                </p>
              </div>
              {unreadCount > 0 && (
                <Button
                  onClick={handleMarkAllAsRead}
                  disabled={markingAllRead}
                  className="bg-[#15592F] hover:bg-[#124b28]"
                >
                  {markingAllRead ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCheck className="h-4 w-4 mr-2" />
                  )}
                  Mark all as read
                </Button>
              )}
            </div>

            {loading ? (
              <Card className="border-0 shadow-sm rounded-2xl">
                <CardContent className="p-12 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#15592F]" />
                  <p className="text-gray-500">Loading notifications...</p>
                </CardContent>
              </Card>
            ) : notifications.length === 0 ? (
              <Card className="border-0 shadow-sm rounded-2xl">
                <CardContent className="p-12 text-center">
                  <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No notifications yet</h3>
                  <p className="text-gray-500">You'll see notifications here when there are updates</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`border-0 shadow-sm rounded-2xl cursor-pointer transition-all hover:shadow-md ${
                      !notification.is_read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <CardContent className="p-5">
                      <div className="flex gap-4">
                        <div className="text-3xl flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className={`text-base ${!notification.is_read ? 'font-bold' : 'font-semibold'}`}>
                                  {notification.title}
                                </h3>
                                {!notification.is_read && (
                                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                                )}
                              </div>
                              <p className="text-sm text-gray-700 mb-2">
                                {notification.message}
                              </p>
                              {notification.reason && (
                                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                  <p className="text-sm text-red-700">
                                    <span className="font-semibold">Reason:</span> {notification.reason}
                                  </p>
                                </div>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs whitespace-nowrap">
                              {formatTimeAgo(notification.created_at)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            <Badge className="text-xs">
                              Transaction #{notification.transaction_id}
                            </Badge>
                            {notification.transaction?.purpose?.name && (
                              <Badge variant="secondary" className="text-xs">
                                {notification.transaction.purpose.name}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Pagination */}
                {renderPagination()}
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
