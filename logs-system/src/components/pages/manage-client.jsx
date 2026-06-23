import { useState } from 'react';
import { Search, Users, CheckCircle, XCircle, Plus, Edit, Trash2, Import } from 'lucide-react';
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

const ManageClient = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const stats = [
    {
      title: 'Total Student',
      value: '5',
      icon: Users,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Active Accounts',
      value: '4',
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Inactive Accounts',
      value: '1',
      icon: XCircle,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600'
    }
  ];

  const users = [
    {
      id: 1,
      name: 'Juan Dela Cruz',
      email: 'juan.delacruz@nwssu.edu.ph',
      Program: 'BSIT',
      RegDate: 'Jun 14, 2026 09:30 AM',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Maria Santos',
      email: 'maria.santos@nwssu.edu.ph',
      Program: 'BSIT',
      RegDate: 'Jun 14, 2026 09:30 AM',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Pedro Reyes',
      email: 'pedro.reyes@nwssu.edu.ph',
      Program: 'BSIT',
      RegDate: 'Jun 14, 2026 09:30 AM',
      status: 'Active'
    },
    {
      id: 4,
      name: 'Ana Garcia',
      email: 'ana.garcia@nwssu.edu.ph',
      Program: 'BEED',
      RegDate: 'Jun 14, 2026 09:30 AM',
      status: 'Active'
    },
    {
      id: 5,
      name: 'Carlos Mendoza',
      email: 'carlos.mendoza@nwssu.edu.ph',
      Program: 'BSIT',
      RegDate: 'Jun 14, 2026 09:30 AM',
      status: 'Inactive'
    }
  ];

  // Get unique courses
  const courses = ['All', ...new Set(users.map(user => user.Program))];
  const statuses = ['All', 'Active', 'Inactive'];

  // Filter users based on search query and filters
  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.Program.toLowerCase().includes(query) ||
      user.status.toLowerCase().includes(query);

    const matchesCourse = selectedCourse === 'All' || user.Program === selectedCourse;
    const matchesStatus = selectedStatus === 'All' || user.status === selectedStatus;

    return matchesSearch && matchesCourse && matchesStatus;
  });

  const handleEditClick = (user) => {
    setSelectedClient(user);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedClient(null);
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
                    <Button className="bg-white hover:bg-[#15592F] border border-[#15592F] hover:text-white text-[#15592F] flex items-center gap-2 transition-colors">
                      <Import className="w-4 h-4" />
                      Import CSV
                    </Button>
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
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Program</TableHead>
                        <TableHead>Reg.Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-12">
                            <Users className="w-12 h-12 mx-auto mb-2 opacity-30 text-gray-400" />
                            <p className="text-sm text-gray-400">
                              {searchQuery ? 'No users found matching your search.' : 'No users found. Add a new user to get started.'}
                            </p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.Program}</TableCell>
                            <TableCell>{user.RegDate}</TableCell>
                            <TableCell>
                              <Badge
                                variant={user.status === 'Active' ? 'default' : 'destructive'}
                                className={user.status === 'Active' ? 'bg-green-600' : ''}
                              >
                                {user.status}
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
      />
    </SidebarProvider>
  );
};

export default ManageClient;