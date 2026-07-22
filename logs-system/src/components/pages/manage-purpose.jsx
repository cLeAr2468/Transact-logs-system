import { useState, useEffect } from 'react';
import { Search, Target, Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import { getAllPurposes, deletePurpose } from '../../api/purposeApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import AddPurposeDialog from '@/components/modals/add-purpose';
import EditPurposeDialog from '@/components/modals/edit-purpose';
import { toast } from 'sonner';

const ManagePurpose = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPurpose, setSelectedPurpose] = useState(null);
  const [purposes, setPurposes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch purposes data on component mount
  useEffect(() => {
    fetchPurposesData();
  }, []);

  const fetchPurposesData = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getAllPurposes();
      console.log('✅ Purposes data fetched:', response);
      setPurposes(response.purposes || []);
    } catch (err) {
      console.error('❌ Error fetching purposes:', err);
      setError(err.message || 'Failed to load purposes data');
      toast.error(err.message || 'Failed to load purposes');
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats from real data
  const totalPurposes = purposes.length;

  const stats = [
    {
      title: 'Total Purposes',
      value: totalPurposes.toString(),
      icon: Target,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
  ];

  // Filter purposes based on search query
  const filteredPurposes = purposes.filter((purpose) => {
    const query = searchQuery.toLowerCase();
    return purpose.name.toLowerCase().includes(query);
  });

  const handleAddClick = () => {
    setIsAddDialogOpen(true);
  };

  const handleEditClick = (purpose) => {
    setSelectedPurpose(purpose);
    setIsEditDialogOpen(true);
  };

  const handleCloseAddDialog = () => {
    setIsAddDialogOpen(false);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedPurpose(null);
  };

  const handlePurposeAdded = () => {
    // Refresh purposes data after add
    fetchPurposesData();
  };

  const handlePurposeUpdated = () => {
    // Refresh purposes data after update
    fetchPurposesData();
  };

  const handleDeleteClick = async (purposeId, purposeName) => {
    if (
      !confirm(
        `Are you sure you want to delete "${purposeName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const response = await deletePurpose(purposeId);
      console.log('✅ Purpose deleted:', response);
      toast.success(response.message || 'Purpose deleted successfully!');

      // Refresh the list
      fetchPurposesData();
    } catch (err) {
      console.error('❌ Error deleting purpose:', err);
      toast.error(err.message || 'Failed to delete purpose');
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
              <h1 className="text-3xl font-light text-gray-900">Manage Purposes</h1>

              <div className="flex gap-2 items-center">
                {/* Refresh Button */}
                <Button
                  onClick={fetchPurposesData}
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
                    placeholder="Search purposes..."
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {stats.map((stat, index) => (
                <Card key={index} className="bg-white shadow-sm rounded-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}
                      >
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

            {/* Purposes Section */}
            <Card className="bg-white shadow-sm rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Appointment Purposes</h2>
                  <Button
                    onClick={handleAddClick}
                    className="bg-[#15592F] hover:bg-[#124b28] text-white flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Purpose
                  </Button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="text-center py-12">
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-500">Loading purposes...</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Purpose Name</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPurposes.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-12">
                              <Target className="w-12 h-12 mx-auto mb-2 opacity-30 text-gray-400" />
                              <p className="text-sm text-gray-400">
                                {searchQuery
                                  ? 'No purposes found matching your search.'
                                  : 'No purposes found. Add a new purpose to get started.'}
                              </p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredPurposes.map((purpose) => (
                            <TableRow key={purpose.id}>
                              <TableCell className="font-medium">{purpose.id}</TableCell>
                              <TableCell className="font-medium">{purpose.name}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    onClick={() => handleEditClick(purpose)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleDeleteClick(purpose.id, purpose.name)}
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

      {/* Add Purpose Dialog */}
      <AddPurposeDialog
        isOpen={isAddDialogOpen}
        onClose={handleCloseAddDialog}
        onPurposeAdded={handlePurposeAdded}
      />

      {/* Edit Purpose Dialog */}
      <EditPurposeDialog
        isOpen={isEditDialogOpen}
        onClose={handleCloseEditDialog}
        purpose={selectedPurpose}
        onPurposeUpdated={handlePurposeUpdated}
      />
    </SidebarProvider>
  );
};

export default ManagePurpose;
