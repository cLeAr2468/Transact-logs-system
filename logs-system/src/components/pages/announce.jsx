"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Pencil, Trash2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/Asidebar';
import { Link } from "react-router-dom";
import { getAllAnnouncements, deleteAnnouncement, updateAnnouncement } from '@/api/announcementApi';
import { toast } from "sonner";

export default function AnnouncementPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleting, setDeleting] = useState(null);
  
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    status: 'draft',
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await getAllAnnouncements();
      setAnnouncements(response.data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    // Show confirmation toast
    toast.warning(
      <div>
        <p className="font-semibold">Delete Announcement?</p>
        <p className="text-sm">This action cannot be undone.</p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => {
              confirmDelete(id);
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
      {
        duration: 10000,
      }
    );
  };

  const confirmDelete = async (id) => {
    try {
      setDeleting(id);
      await deleteAnnouncement(id);
      toast.success('Announcement deleted successfully');
      fetchAnnouncements(); // Refresh list
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Failed to delete announcement');
    } finally {
      setDeleting(null);
    }
  };

  const handleFilter = () => {
    // Implement filter logic here if needed
    fetchAnnouncements();
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setEditForm({
      title: announcement.title,
      content: announcement.content,
      status: announcement.status,
    });
    setEditDialogOpen(true);
  };

  const handleUpdateAnnouncement = async () => {
    if (!editForm.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!editForm.content.trim()) {
      toast.error('Content is required');
      return;
    }

    try {
      setUpdating(true);
      const formData = new FormData();
      formData.append('title', editForm.title);
      formData.append('content', editForm.content);
      formData.append('status', editForm.status);
      formData.append('_method', 'PUT'); // Laravel method spoofing

      await updateAnnouncement(editingAnnouncement.id, formData);
      
      toast.success('Announcement updated successfully');
      setEditDialogOpen(false);
      fetchAnnouncements(); // Refresh list
    } catch (error) {
      console.error('Error updating announcement:', error);
      toast.error(error.message || 'Failed to update announcement');
    } finally {
      setUpdating(false);
    }
  };

  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || announcement.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#f6f7fb]">
        <AppSidebar />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="border-t-2 bg-white rounded-t-lg mb-0">
              <div className="flex items-center justify-between p-6">
                <h1 className="text-3xl font-light text-slate-800">
                  Announcement
                </h1>

                <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold gap-2 px-6">
                  <Plus className="h-4 w-4" />
                  <Link to="/add-announcement" className="text-black">
                    CREATE NEW ANNOUNCEMENT
                  </Link>
                </Button>
              </div>
            </div>

            {/* Main Container */}
            <Card className="shadow-sm rounded-b-lg rounded-t-none">
              <CardContent className="p-6">
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
                  {/* Search */}
                  <div className="md:col-span-5">
                    <label className="text-sm font-medium text-slate-600 mb-2 block">
                      Search Announcements
                    </label>

                    <div className="relative bg-white">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                      <Input
                        placeholder="Search by title..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Spacer */}
                  <div className="md:col-span-3">
                    
                  </div>

                  {/* Status */}
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-slate-600 mb-2 block">
                      Status
                    </label>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full rounded-md bg-white border-gray-300">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="">All Status</SelectItem>
                        <SelectItem value="published">
                          Published
                        </SelectItem>
                        <SelectItem value="draft">
                          Draft
                        </SelectItem>
                        <SelectItem value="archive">
                          Archive
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filter Button */}
                  <div className="md:col-span-2 flex items-end">
                    <Button 
                      className="w-full bg-green-700 hover:bg-green-800 rounded-md text-white font-semibold"
                      onClick={handleFilter}
                    >
                      REFRESH
                    </Button>
                  </div>
                </div>

                {/* Table */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="w-1/3 text-left">Title</TableHead>
                        <TableHead className="w-1/6 text-left">Date Posted</TableHead>
                        <TableHead className="w-1/5 text-left">Audience</TableHead>
                        <TableHead className="w-1/6 text-left">Status</TableHead>
                        <TableHead className="w-1/6 text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                            <p className="text-sm text-gray-500 mt-2">Loading announcements...</p>
                          </TableCell>
                        </TableRow>
                      ) : filteredAnnouncements.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <p className="text-sm text-gray-500">No announcements found</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredAnnouncements.map((item) => (
                          <TableRow key={item.id} className="align-top">
                            <TableCell className="w-1/3 align-top py-4">
                              <div className="flex flex-col gap-1">
                                <h3 className="font-semibold text-slate-900 text-sm break-words whitespace-normal">
                                  {item.title}
                                </h3>

                                <p className="text-xs text-slate-500 break-words whitespace-normal line-clamp-2">
                                  {item.content}
                                </p>
                              </div>
                            </TableCell>

                            <TableCell className="w-1/6 text-slate-600 align-top text-sm whitespace-nowrap py-4">
                              {formatDate(item.created_at)}
                            </TableCell>

                            <TableCell className="w-1/5 align-top py-4">
                              <Badge
                                variant="secondary"
                                className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-xs"
                              >
                                ALL USERS
                              </Badge>
                            </TableCell>

                            <TableCell className="w-1/6 align-top py-4">
                              <div className="flex items-center gap-1">
                                <span
                                  className={`h-2 w-2 rounded-full flex-shrink-0 ${
                                    item.status === "published"
                                      ? "bg-green-500"
                                      : "bg-yellow-500"
                                  }`}
                                />

                                <span className="text-sm whitespace-nowrap capitalize">
                                  {item.status}
                                </span>
                              </div>
                            </TableCell>

                            <TableCell className="w-1/6 align-top py-4">
                              <div className="flex items-center justify-center gap-2">
                                {/* Show edit icon only for draft or archive status */}
                                {(item.status === 'draft' || item.status === 'archive') && (
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-8 w-8 flex-shrink-0 border-blue-500 text-blue-500 hover:bg-blue-50"
                                    onClick={() => handleEdit(item)}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                                
                                <Button
                                  size="icon"
                                  variant="destructive"
                                  className="h-8 w-8 flex-shrink-0"
                                  onClick={() => handleDelete(item.id)}
                                  disabled={deleting === item.id}
                                >
                                  {deleting === item.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-3.5 w-3.5" />
                                  )}
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

        {/* Edit Announcement Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Pencil className="w-5 h-5 text-blue-500" />
                Edit Announcement
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  placeholder="Enter announcement title"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full"
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="edit-content">Content *</Label>
                <Textarea
                  id="edit-content"
                  placeholder="Enter announcement content"
                  value={editForm.content}
                  onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                  className="w-full min-h-[150px]"
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status *</Label>
                <Select 
                  value={editForm.status} 
                  onValueChange={(value) => setEditForm({ ...editForm, status: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archive">Archive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={updating}
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleUpdateAnnouncement}
                disabled={updating}
              >
                {updating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Pencil className="w-4 h-4 mr-2" />
                    Update Announcement
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarProvider>
  );
}