import { useState, useEffect } from 'react';
import { Search, Users, CheckCircle, XCircle, Plus, Edit, Trash2, Import, RefreshCw } from 'lucide-react';
import { getAllUsers, getUserStatistics, deleteUser } from '../../api/userApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/Asidebar';
import EditClientDialog from "@/components/modals/edit-client";
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const ManageClient = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });

  // Fetch users and statistics on component mount
  useEffect(() => {
    fetchUsersData();
    fetchStatistics();
  }, []);

  const fetchUsersData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await getAllUsers();
      console.log("✅ Users fetched:", response);
      setUsers(response.users || []);
    } catch (err) {
      console.error("❌ Error fetching users:", err);
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await getUserStatistics();
      console.log("✅ Statistics fetched:", response);
      setStatistics(response.statistics || { total: 0, active: 0, inactive: 0 });
    } catch (err) {
      console.error("❌ Error fetching statistics:", err);
    }
  };

  const stats = [
    {
      title: 'Total Student',
      value: statistics.total.toString(),
      icon: Users,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Active Accounts',
      value: statistics.active.toString(),
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Inactive Accounts',
      value: statistics.inactive.toString(),
      icon: XCircle,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600'
    }
  ];

  // Get unique courses
  const courses = ['All', ...new Set(users.map(user => user.course))];
  const statuses = ['All', 'Active', 'Inactive'];

  // Filter users based on search query and filters
  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    const fullName = `${user.fname || ''} ${user.mname || ''} ${user.lname || ''}`.toLowerCase();
    const matchesSearch =
      fullName.includes(query) ||
      (user.email && user.email.toLowerCase().includes(query)) ||
      (user.course && user.course.toLowerCase().includes(query)) ||
      (user.student_id && user.student_id.toLowerCase().includes(query)) ||
      (user.status && user.status.toLowerCase().includes(query));

    const matchesCourse = selectedCourse === 'All' || user.course === selectedCourse;
    const matchesStatus = selectedStatus === 'All' || user.status === selectedStatus;

    return matchesSearch && matchesCourse && matchesStatus;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEditClick = (user) => {
    setSelectedClient(user);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedClient(null);
  };

  const handleUserUpdated = () => {
    // Refresh users data after update
    fetchUsersData();
    fetchStatistics();
  };

  const handleDeleteClick = async (userId, userName) => {
    toast.warning(
      <div>
        <p className="font-semibold">Delete {userName}?</p>
        <p className="text-sm">This action cannot be undone.</p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => {
              confirmDeleteUser(userId);
              toast.dismiss();
            }}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            Delete
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

  const confirmDeleteUser = async (userId) => {
    try {
      const response = await deleteUser(userId);
      console.log("✅ User deleted:", response);
      toast.success(response.message || "User deleted successfully!");
      
      // Refresh the list
      fetchUsersData();
      fetchStatistics();
    } catch (err) {
      console.error("❌ Error deleting user:", err);
      toast.error(err.message || "Failed to delete user");
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-light text-gray-900">Client Management</h1>

              <div className="flex gap-2 items-center">
                {/* Refresh Button */}
                <Button
                  onClick={() => {
                    fetchUsersData();
                    fetchStatistics();
                  }}
                  variant="outline"
                  className="flex items-center gap-2"
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>

                {/* Search Bar */}
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {stats.map((stat, index) => (
                <Card key={index} className="bg-white shadow-sm rounded-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                        <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-sm text-gray-600">{stat.title}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* User Account Section */}
            <Card className="bg-white shadow-sm rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Client Account</h2>
                  <div className="flex items-center gap-2">
                    <Button className="bg-[#15592F] hover:bg-[#124b28] text-white flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      <Link to="/Client-register">
                        Register Client
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Filter Selects */}
                <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">Course:</span>
                    <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                      <SelectTrigger className="w-40 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course} value={course}>
                            {course}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-3">
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

                {/* Table */}
                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="text-center py-12">
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-500">Loading users...</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Program</TableHead>
                          <TableHead>Year</TableHead>
                          <TableHead>Reg.Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-12">
                              <Users className="w-12 h-12 mx-auto mb-2 opacity-30 text-gray-400" />
                              <p className="text-sm text-gray-400">
                                {searchQuery ? 'No users found matching your search.' : 'No users found. Add a new user to get started.'}
                              </p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.student_id}</TableCell>
                              <TableCell className="font-medium">
                                {`${user.fname || ''} ${user.mname || ''} ${user.lname || ''}`.trim()}
                              </TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>{user.course}</TableCell>
                              <TableCell>{user.year_level}</TableCell>
                              <TableCell>{formatDate(user.created_at)}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={user.status === 'Active' ? 'default' : 'destructive'}
                                  className={user.status === 'Active' ? 'bg-green-600' : ''}
                                >
                                  {user.status || 'Active'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    onClick={() => handleEditClick(user)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleDeleteClick(user.id, `${user.fname} ${user.lname}`)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Edit Client Dialog */}
      <EditClientDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        client={selectedClient}
        onUserUpdated={handleUserUpdated}
      />
    </SidebarProvider>
  );
};

export default ManageClient;