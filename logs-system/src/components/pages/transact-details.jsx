import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/Asidebar";
import RejectDialog from "@/components/modals/reject-dialog";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Mail,
  MapPin,
  BookOpen,
  FileText,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/api";

export default function TransactionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  useEffect(() => {
    fetchTransactionDetails();
  }, [id]);

  const fetchTransactionDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/appointments/${id}`);
      setTransaction(response.data.transaction);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      } else if (error.response?.status === 404) {
        toast.error('Transaction not found.');
        navigate('/transact');
      } else {
        console.error('Fetch error:', error);
        toast.error('Failed to load transaction details.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus, rejectionReason = null) => {
    setActionLoading(true);
    try {
      const payload = { status: newStatus };
      if (rejectionReason) {
        payload.rejection_reason = rejectionReason;
      }

      const response = await api.put(`/admin/appointments/${id}/status`, payload);

      toast.success(response.data?.message || 'Status updated successfully!');
      await fetchTransactionDetails();
    } catch (error) {
      console.error('Status update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = () => {
    toast.warning(
      <div>
        <p className="font-semibold">Approve this appointment?</p>
        <p className="text-sm">An email notification will be sent to the student.</p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => {
              handleStatusUpdate('approved');
              toast.dismiss();
            }}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
          >
            Approve & Send Email
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

  const handleReject = () => {
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = (reason) => {
    handleStatusUpdate('rejected', reason);
    setRejectDialogOpen(false);
  };

  const handleComplete = () => {
    toast.warning(
      <div>
        <p className="font-semibold">Mark as completed?</p>
        <p className="text-sm">An email notification will be sent to the student.</p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => {
              handleStatusUpdate('completed');
              toast.dismiss();
            }}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Complete & Send Email
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-red-100 text-red-700';
      case 'approved':
        return 'bg-blue-100 text-blue-700';
      case 'rejected':
        return 'bg-gray-100 text-gray-700';
      case 'cancelled':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-[#f6f7fb]">
          <AppSidebar />
          <main className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </main>
        </div>
      </SidebarProvider>
    );
  }

  if (!transaction) {
    return null;
  }

  const studentName = transaction.user?.masterlist
    ? `${transaction.user.masterlist.fname} ${transaction.user.masterlist.mname ? transaction.user.masterlist.mname + ' ' : ''}${transaction.user.masterlist.lname}`
    : 'N/A';

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#f6f7fb]">
        <AppSidebar />

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <Link to="/transact">
                  <Button variant="ghost" className="mb-2 -ml-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Transactions
                  </Button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">
                  Transaction Details
                </h1>
              </div>
              <Badge className={`${getStatusColor(transaction.status)} text-lg px-4 py-2`}>
                {transaction.status?.charAt(0).toUpperCase() + transaction.status?.slice(1)}
              </Badge>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Student Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Student Information Card */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <User className="h-5 w-5 text-green-700" />
                      Student Information
                    </h2>
                    <div className="space-y-3">
                      <div className="flex">
                        <span className="font-medium text-gray-600 w-32">Student ID:</span>
                        <span className="text-gray-900">{transaction.user?.student_id || 'N/A'}</span>
                      </div>
                      <div className="flex">
                        <span className="font-medium text-gray-600 w-32">Full Name:</span>
                        <span className="text-gray-900">{studentName}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="font-medium text-gray-600 w-28">Email:</span>
                        <span className="text-gray-900">{transaction.user?.masterlist?.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="font-medium text-gray-600 w-28">Course:</span>
                        <span className="text-gray-900">{transaction.user?.masterlist?.course || 'N/A'}</span>
                      </div>
                      <div className="flex">
                        <span className="font-medium text-gray-600 w-32">Year Level:</span>
                        <span className="text-gray-900">{transaction.user?.masterlist?.year_level || 'N/A'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Address Information Card */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-green-700" />
                      Address Information
                    </h2>
                    <div className="space-y-3">
                      <div className="flex">
                        <span className="font-medium text-gray-600 w-32">Region:</span>
                        <span className="text-gray-900">{transaction.user?.region || 'N/A'}</span>
                      </div>
                      <div className="flex">
                        <span className="font-medium text-gray-600 w-32">Province:</span>
                        <span className="text-gray-900">{transaction.province || transaction.user?.province || 'N/A'}</span>
                      </div>
                      <div className="flex">
                        <span className="font-medium text-gray-600 w-32">Municipality:</span>
                        <span className="text-gray-900">{transaction.municipality || transaction.user?.municipality || 'N/A'}</span>
                      </div>
                      <div className="flex">
                        <span className="font-medium text-gray-600 w-32">Barangay:</span>
                        <span className="text-gray-900">{transaction.brgy || transaction.user?.barangay || 'N/A'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Appointment Details */}
              <div className="space-y-6">
                {/* Appointment Information Card */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-green-700" />
                      Appointment Details
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center text-gray-600 mb-1">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span className="font-medium">Appointment Date</span>
                        </div>
                        <p className="text-gray-900 ml-6">{formatDate(transaction.schedule_date)}</p>
                      </div>
                      <div>
                        <div className="flex items-center text-gray-600 mb-1">
                          <Clock className="h-4 w-4 mr-2" />
                          <span className="font-medium">Time Slot</span>
                        </div>
                        <p className="text-gray-900 ml-6">{transaction.time_slot || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Purpose:</span>
                        <p className="text-gray-900 mt-1">{transaction.purpose?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Request Type:</span>
                        <p className="mt-1">
                          <Badge className={transaction.request_type === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}>
                            {transaction.request_type === 'online' ? 'Online' : 'Walk-in'}
                          </Badge>
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Created:</span>
                        <p className="text-gray-900 mt-1 text-sm">
                          {formatDate(transaction.date_requested || transaction.created_at)}
                        </p>
                      </div>
                      {transaction.approved_at && (
                        <div>
                          <span className="font-medium text-blue-600">Approved:</span>
                          <p className="text-gray-900 mt-1 text-sm">
                            {formatDate(transaction.approved_at)}
                          </p>
                        </div>
                      )}
                      {transaction.status === 'rejected' && transaction.rejected_at && (
                        <div>
                          <span className="font-medium text-red-600">Rejected:</span>
                          <p className="text-gray-900 mt-1 text-sm">
                            {formatDate(transaction.rejected_at)}
                          </p>
                        </div>
                      )}
                      {transaction.status === 'cancelled' && transaction.cancelled_at && (
                        <div>
                          <span className="font-medium text-orange-600">Cancelled:</span>
                          <p className="text-gray-900 mt-1 text-sm">
                            {formatDate(transaction.cancelled_at)}
                          </p>
                        </div>
                      )}
                      {transaction.status === 'completed' && transaction.release_date && (
                        <div>
                          <span className="font-medium text-green-600">Released/Completed:</span>
                          <p className="text-gray-900 mt-1 text-sm">
                            {formatDate(transaction.release_date)}
                          </p>
                        </div>
                      )}
                      {transaction.status === 'rejected' && transaction.rejection_reason && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <span className="font-medium text-red-600">Rejection Reason:</span>
                          <p className="text-gray-900 mt-2 p-3 bg-red-50 border border-red-200 rounded-md text-sm">
                            {transaction.rejection_reason}
                          </p>
                        </div>
                      )}
                      {transaction.status === 'cancelled' && transaction.rejection_reason && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <span className="font-medium text-orange-600">Cancellation Reason:</span>
                          <p className="text-gray-900 mt-2 p-3 bg-orange-50 border border-orange-200 rounded-md text-sm">
                            {transaction.rejection_reason}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Actions Card */}
                {transaction.status !== 'completed' && transaction.status !== 'rejected' && transaction.status !== 'cancelled' && (
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-xl font-semibold mb-4">Actions</h2>
                      <div className="space-y-3">
                        {transaction.status === 'pending' && (
                          <>
                            <Button
                              onClick={handleApprove}
                              disabled={actionLoading}
                              className="w-full bg-green-600 hover:bg-green-700 text-white"
                            >
                              {actionLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <Check className="h-4 w-4 mr-2" />
                              )}
                              Approve Appointment
                            </Button>
                            <Button
                              onClick={handleReject}
                              disabled={actionLoading}
                              variant="destructive"
                              className="w-full"
                            >
                              {actionLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <X className="h-4 w-4 mr-2" />
                              )}
                              Reject Appointment
                            </Button>
                          </>
                        )}
                        {transaction.status === 'approved' && (
                          <Button
                            onClick={handleComplete}
                            disabled={actionLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            {actionLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Check className="h-4 w-4 mr-2" />
                            )}
                            Mark as Completed
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </main>

        <RejectDialog
          open={rejectDialogOpen}
          onOpenChange={setRejectDialogOpen}
          onConfirm={handleRejectConfirm}
          studentEmail={transaction.user?.masterlist?.email}
        />
      </div>
    </SidebarProvider>
  );
}
