import { useState, useEffect } from 'react';
import { Search, Users, CheckCircle, XCircle, Crown, Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import { getAllStaff, deleteStaff } from '../../api/staffApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
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
import { AppSidebar } from '../layout/Asidebar';
import EditStaffDialog from "@/components/modals/edit-staff";
import { toast } from "sonner";

const Managestaff = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch staff data on component mount
  useEffect(() => {
    fetchStaffData();
  }, []);

  const fetchStaffData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await getAllStaff();
      console.log("✅ Staff data fetched:", response);
      setUsers(response.staff || []);
    } catch (err) {
      console.error("❌ Error fetching staff:", err);
      setError(err.message || "Failed to load staff data");
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats from real data
  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.status === 'Active').length;
  const inactiveUsers = users.filter(user => user.status === 'Inactive').length;

  const stats = [
    {
      title: 'Total Users',
      value: totalUsers.toString(),
      icon: Users,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Active Accounts',
      value: activeUsers.toString(),
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Inactive Accounts',
      value: inactiveUsers.toString(),
      icon: XCircle,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600'
    },
  ];

  const statuses = ['All', 'Active', 'Inactive'];

  // Filter users based on search query and status filter
  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      user.fname.toLowerCase().includes(query) ||
      user.mname.toLowerCase().includes(query) ||
      user.lname.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.status.toLowerCase().includes(query);
    
    const matchesStatus = selectedStatus === 'All' || user.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleEditClick = (user) => {
    setSelectedStaff(user);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedStaff(null);
  };

  const handleStaffUpdated = () => {
    // Refresh staff data after update
    fetchStaffData();
  };

  const handleDeleteClick = async (staffId, staffName) => {
    if (!confirm(`Are you sure you want to delete ${staffName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await deleteStaff(staffId);
      console.log("✅ Staff deleted:", response);
      toast.success(response.message || "Staff member deleted successfully!");
      
      // Refresh the list
      fetchStaffData();
    } catch (err) {
      console.error("❌ Error deleting staff:", err);
      toast.error(err.message || "Failed to delete staff member");
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
              <h1 className="text-3xl font-light text-gray-900">Staff Management</h1>

              <div className="flex gap-2 items-center">
                {/* Refresh Button */}
                <Button
                  onClick={fetchStaffData}
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
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-8">
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
                  <h2 className="text-xl font-semibold text-gray-900">Staff Accounts</h2>
                  <Button className="bg-[#15592F] hover:bg-[#124b28] text-white flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    <Link to="/add-staff">
                    Add New Staff
                    </Link>
                  </Button>
                </div>

                {/* Filter Select */}
                <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b border-gray-200">
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
                      <p className="text-gray-500">Loading staff data...</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Staff ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-12">
                              <Users className="w-12 h-12 mx-auto mb-2 opacity-30 text-gray-400" />
                              <p className="text-sm text-gray-400">
                                {searchQuery ? 'No users found matching your search.' : 'No users found. Add a new user to get started.'}
                              </p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.staff_id}</TableCell>
                              <TableCell className="font-medium">{`${user.fname} ${user.mname || ''} ${user.lname}`}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={user.status === 'Active' ? 'default' : 'destructive'}
                                  className={user.status === 'Active' ? 'bg-green-600' : ''}
                                >
                                  {user.status || 'Active'}
                                </Badge>
                              </TableCell>
                            
                              <TableCell>
                                <div className="flex items-center">
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

      {/* Edit Staff Dialog */}
      <EditStaffDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        staff={selectedStaff}
        onStaffUpdated={handleStaffUpdated}
      />
    </SidebarProvider>
  );
};

export default Managestaff;