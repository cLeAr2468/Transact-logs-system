"use client";

import { useState, useEffect } from "react";
import { Search, ArrowLeft, RotateCcw, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
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
import { useNavigate } from "react-router-dom";
import { getArchivedAnnouncements, restoreAnnouncement } from '@/api/announcementApi';
import { toast } from "sonner";

export default function AnnouncementHistoryPage() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [restoring, setRestoring] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchArchivedAnnouncements();
  }, []);

  const fetchArchivedAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await getArchivedAnnouncements();
      setAnnouncements(response.data || []);
    } catch (error) {
      console.error('Error fetching archived announcements:', error);
      toast.error('Failed to load archived announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id) => {
    // Show confirmation toast
    toast.warning(
      <div>
        <p className="font-semibold">Restore Announcement?</p>
        <p className="text-sm">This will restore the announcement to draft status.</p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => {
              confirmRestore(id);
              toast.dismiss();
            }}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Restore
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

  const confirmRestore = async (id) => {
    try {
      setRestoring(id);
      await restoreAnnouncement(id);
      toast.success('Announcement restored successfully');
      fetchArchivedAnnouncements(); // Refresh list
    } catch (error) {
      console.error('Error restoring announcement:', error);
      toast.error('Failed to restore announcement');
    } finally {
      setRestoring(null);
    }
  };

  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredAnnouncements.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAnnouncements = filteredAnnouncements.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#f6f7fb]">
        <AppSidebar />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="border-t-2 bg-white rounded-t-lg mb-0">
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate('/announce')}
                    className="border-slate-300 hover:bg-slate-50"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <h1 className="text-3xl font-light text-slate-800">
                    Announcement Delete History
                  </h1>
                </div>
              </div>
            </div>

            {/* Main Container */}
            <Card className="shadow-sm rounded-b-lg rounded-t-none">
              <CardContent className="p-6">
                {/* Search */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-slate-600 mb-2 block">
                    Search Archived Announcements
                  </label>
                  <div className="relative bg-white max-w-md">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by title..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="w-1/3 text-left">Title</TableHead>
                        <TableHead className="w-1/6 text-left">Deleted Date</TableHead>
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
                            <p className="text-sm text-gray-500 mt-2">Loading archived announcements...</p>
                          </TableCell>
                        </TableRow>
                      ) : filteredAnnouncements.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <p className="text-sm text-gray-500">No archived announcements found</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedAnnouncements.map((item) => (
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
                              {formatDate(item.updated_at)}
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
                                <span className="h-2 w-2 rounded-full flex-shrink-0 bg-red-500" />
                                <span className="text-sm whitespace-nowrap capitalize">
                                  Archived
                                </span>
                              </div>
                            </TableCell>

                            <TableCell className="w-1/6 align-top py-4">
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-3 flex-shrink-0 border-blue-500 text-blue-600 hover:bg-blue-50 gap-1"
                                  onClick={() => handleRestore(item.id)}
                                  disabled={restoring === item.id}
                                >
                                  {restoring === item.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <>
                                      <RotateCcw className="h-3.5 w-3.5" />
                                      Restore
                                    </>
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  
                  {/* Pagination */}
                  {!loading && filteredAnnouncements.length > 0 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
