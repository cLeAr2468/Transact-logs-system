import { useState, useEffect } from 'react';
import { Search, Users, Plus, Import, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/Asidebar';
import ImportMasterlistDialog from "@/components/modals/import-masterlist";
import { Link } from 'react-router-dom';
import { getAllMasterlist, updateMasterlistEntry } from '../../api/masterlistApi';
import { toast } from 'sonner';

const Masteerlist = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [masterlistData, setMasterlistData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingStatus, setUpdatingStatus] = useState(null); // Track which entry is being updated
  const itemsPerPage = 10;

  // Fetch masterlist data on component mount
  useEffect(() => {
    fetchMasterlistData();
  }, []);

  const fetchMasterlistData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllMasterlist();
      console.log("📋 Masterlist data:", response);
      setMasterlistData(response.masterlist || []);
    } catch (err) {
      console.error("❌ Error fetching masterlist:", err);
      setError(err.message || "Failed to fetch masterlist");
    } finally {
      setLoading(false);
    }
  };

  // Get unique courses
  const courses = ['All', ...new Set(masterlistData.map(item => item.course))];

  // Filter masterlist based on search query and filters
  const filteredMasterlist = masterlistData.filter((item) => {
    const query = searchQuery.toLowerCase();
    const fullName = `${item.fname} ${item.mname || ''} ${item.lname}`.toLowerCase();
    const matchesSearch =
      fullName.includes(query) ||
      item.student_id.toLowerCase().includes(query) ||
      item.email.toLowerCase().includes(query) ||
      item.course.toLowerCase().includes(query) ||
      item.year_level.toLowerCase().includes(query) ||
      item.status.toLowerCase().includes(query);

    const matchesCourse = selectedCourse === 'All' || item.course === selectedCourse;

    return matchesSearch && matchesCourse;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredMasterlist.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMasterlist = filteredMasterlist.slice(startIndex, endIndex);

  // Reset to page 1 when search or course filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCourse]);

  const handleToggleStatus = async (item) => {
    const newStatus = item.status === 'Active' ? 'Inactive' : 'Active';
    const actionText = newStatus === 'Inactive' ? 'deactivate' : 'activate';
    
    toast.warning(
      <div>
        <p className="font-semibold">
          {newStatus === 'Inactive' ? 'Deactivate' : 'Activate'} {item.fname} {item.lname}?
        </p>
        <p className="text-sm">This will change the student's status to {newStatus}.</p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => {
              confirmToggleStatus(item.id, newStatus, `${item.fname} ${item.lname}`);
              toast.dismiss();
            }}
            className={`px-3 py-1 ${newStatus === 'Inactive' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded text-sm`}
          >
            Confirm
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

  const confirmToggleStatus = async (id, newStatus, studentName) => {
    setUpdatingStatus(id);
    try {
      await updateMasterlistEntry(id, { status: newStatus });
      toast.success(`${studentName} is now ${newStatus}!`);
      // Refresh the masterlist data
      fetchMasterlistData();
    } catch (err) {
      console.error("❌ Error updating status:", err);
      toast.error(err.message || "Failed to update status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleImportSuccess = () => {
    // Refresh the masterlist data after import
    fetchMasterlistData();
  };

  const handleOpenImportDialog = () => {
    setIsImportDialogOpen(true);
  };

  const handleCloseImportDialog = () => {
    setIsImportDialogOpen(false);
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-light text-gray-900">Master List</h1>

              {/* Search Bar */}
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white"
                />
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#15592F]" />
                <span className="ml-3 text-gray-600">Loading masterlist...</span>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                {error}
              </div>
            )}

            {/* Master List Table */}
            {!loading && !error && (
            <Card className="bg-white shadow-sm rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Master List</h2>
                  <div className="flex items-center gap-2">
                    <Button 
                      className="bg-white hover:bg-[#15592F] border border-[#15592F] hover:text-white text-[#15592F] flex items-center gap-2 transition-colors"
                      onClick={handleOpenImportDialog}
                    >
                      <Import className="w-4 h-4" />
                      Import CSV
                    </Button>
                    <Button className="bg-[#15592F] hover:bg-[#124b28] text-white flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      <Link to="/add-manual">
                        Add Manual
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
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Year Level</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMasterlist.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-12">
                            <Users className="w-12 h-12 mx-auto mb-2 opacity-30 text-gray-400" />
                            <p className="text-sm text-gray-400">
                              {searchQuery ? 'No students found matching your search.' : 'No students found. Add a new student to get started.'}
                            </p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedMasterlist.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.student_id}</TableCell>
                            <TableCell>
                              {`${item.fname} ${item.mname ? item.mname + ' ' : ''}${item.lname}`}
                            </TableCell>
                            <TableCell>{item.email}</TableCell>
                            <TableCell>{item.course}</TableCell>
                            <TableCell>{item.year_level}</TableCell>
                            <TableCell>
                              <Badge
                                variant={item.status === 'Active' ? 'default' : 'destructive'}
                                className={item.status === 'Active' ? 'bg-green-600' : ''}
                              >
                                {item.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                className={`${
                                  item.status === 'Active' 
                                    ? 'text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300' 
                                    : 'text-green-600 hover:text-green-700 hover:bg-green-50 border-green-300'
                                }`}
                                onClick={() => handleToggleStatus(item)}
                                disabled={updatingStatus === item.id}
                              >
                                {updatingStatus === item.id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                    Updating...
                                  </>
                                ) : (
                                  item.status === 'Active' ? 'Set Inactive' : 'Set Active'
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  
                  {/* Pagination */}
                  {filteredMasterlist.length > 0 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
            )}
          </div>
        </main>
      </div>

      {/* Import Masterlist Dialog */}
      <ImportMasterlistDialog
        isOpen={isImportDialogOpen}
        onClose={handleCloseImportDialog}
        onImportSuccess={handleImportSuccess}
      />
    </SidebarProvider>
  );
};

export default Masteerlist;