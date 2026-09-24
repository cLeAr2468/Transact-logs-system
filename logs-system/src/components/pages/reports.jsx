import { useState, useEffect } from "react";

import {
  FileDown,
  ArrowRightLeft,
  BadgeCheck,
  CircleCheck,
  MoreHorizontal,
  Download,
  FileText,
  FileSpreadsheet,
  Calendar,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Star,
  MessageSquare,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/Asidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export default function Reports() {
  const [statistics, setStatistics] = useState({
    total_transactions: 0,
    target_percentage: 0,
    avg_processing_time: '0 min',
    most_requested: { purpose: 'N/A', count: 0 },
    completion_rate: 0,
    avg_rating: 0,
    total_feedback: 0
  });
  const [purposeData, setPurposeData] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [feedbackData, setFeedbackData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  
  // Export dialog state
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [reportType, setReportType] = useState("Student Affairs Services Summary");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [fileFormat, setFileFormat] = useState("pdf");
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeDetails, setIncludeDetails] = useState(true);
  const [includeFeedback, setIncludeFeedback] = useState(false);
  
  // Pagination state for recent reports
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [clearingReports, setClearingReports] = useState(false);
  
  // Pagination state for feedback table
  const [feedbackCurrentPage, setFeedbackCurrentPage] = useState(1);
  const [feedbackItemsPerPage] = useState(10);

  // Report type descriptions
  const reportTypeDescriptions = {
    "Student Affairs Services Summary": "Comprehensive summary of all student affairs services and transactions",
    "Monthly Transaction Summary": "Monthly overview of all transaction activities",
    "Student ID Validation Report": "Report on student ID validation and verification services",
    "Good Moral Character Certificates": "Records of good moral character certificates issued",
    "Student Clearance Forms Report": "Student clearance forms processing and status",
    "Affidavits of Loss Report": "Reports of lost school IDs and affidavits issued",
    "Student Handbooks Distribution": "Distribution records of student handbooks",
    "Certifications and Documents Report": "Various certifications and documents issued to students",
    "Scholarship Applications Report": "Scholarship application submissions and processing",
    "Documentary Requirements Report": "Documentary requirements collected and organized",
    "Detailed Transaction Report": "Detailed breakdown of all individual transactions",
    "Performance Metrics Report": "Performance metrics and efficiency analysis"
  };

  const API_BASE_URL = import.meta.env.VITE_API_URL || "https://logs-server-system-production.up.railway.app/api";

  useEffect(() => {
    fetchReportsData();
    // Set default dates (current month)
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  }, []);

  const fetchReportsData = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Fetch statistics and purposes in parallel (critical data)
      const [statsRes, purposeRes] = await Promise.all([
        fetch(`${API_BASE_URL}/reports/statistics`, { headers }).catch(err => {
          console.error('Stats fetch failed:', err);
          return { ok: false };
        }),
        fetch(`${API_BASE_URL}/reports/by-purpose`, { headers }).catch(err => {
          console.error('Purpose data fetch failed:', err);
          return { ok: false };
        })
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStatistics({
          ...statsData.statistics,
          avg_rating: statsData.statistics.avg_rating || 0,
          total_feedback: statsData.statistics.total_feedback || 0
        });
      } else {
        console.warn('Failed to load statistics');
      }

      if (purposeRes.ok) {
        const purposeResData = await purposeRes.json();
        setPurposeData(purposeResData.data || []);
      } else {
        console.warn('Failed to load purpose data');
      }

      // Fetch recent reports (non-critical, can fail gracefully)
      try {
        const reportsRes = await fetch(`${API_BASE_URL}/reports/recent`, { headers });
        if (reportsRes.ok) {
          const reportsResData = await reportsRes.json();
          setRecentReports(reportsResData.reports || []);
        }
      } catch (err) {
        console.warn('Failed to load recent reports:', err);
      }

      // Fetch feedback data and statistics (non-critical)
      try {
        const [feedbackRes, feedbackStatsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/feedback?per_page=1000`, { headers }),
          fetch(`${API_BASE_URL}/feedback/statistics`, { headers })
        ]);
        
        if (feedbackRes.ok && feedbackStatsRes.ok) {
          const feedbackResData = await feedbackRes.json();
          const statsResData = await feedbackStatsRes.json();
          
          setFeedbackData(feedbackResData.data || []);
          
          setStatistics(prev => ({
            ...prev,
            avg_rating: statsResData.average_rating || 0,
            total_feedback: statsResData.total || 0
          }));
        }
      } catch (error) {
        console.warn('Feedback data unavailable:', error);
        setFeedbackData([]);
      }

    } catch (error) {
      console.error('Error fetching reports data:', error);
      toast.error('Failed to load reports data. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    // Validate that at least one section is selected
    if (!includeSummary && !includeDetails && !includeFeedback) {
      toast.error('Please select at least one section to include in the report');
      return;
    }

    // Validate date range
    if (!startDate || !endDate) {
      toast.error('Please select a date range');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Start date must be before end date');
      return;
    }

    try {
      setExporting(true);
      const token = localStorage.getItem('admin_token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      // Build query parameters
      const params = new URLSearchParams({
        format: fileFormat,
        start_date: startDate,
        end_date: endDate,
        report_type: reportType,
        include_summary: includeSummary ? '1' : '0',
        include_details: includeDetails ? '1' : '0',
        include_feedback: includeFeedback ? '1' : '0',
      });

      const response = await fetch(`${API_BASE_URL}/reports/export?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get the filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `transactions_report_${startDate}_to_${endDate}.${fileFormat}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Report exported successfully');
      setExportDialogOpen(false);
      
      // Refresh recent reports
      fetchReportsData();
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadReport = async (downloadUrl) => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`${API_BASE_URL}${downloadUrl}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'report.csv';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    }
  };

  const handleClearAllReports = async () => {
    if (!window.confirm('Are you sure you want to clear all recent reports? This action cannot be undone.')) {
      return;
    }

    try {
      setClearingReports(true);
      const token = localStorage.getItem('admin_token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/reports/clear-all`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to clear reports');
      }

      toast.success('All reports cleared successfully');
      setRecentReports([]);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error clearing reports:', error);
      toast.error('Failed to clear reports');
    } finally {
      setClearingReports(false);
    }
  };
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#F5F7FB]">
        <AppSidebar />
      
        <main className="flex-1 p-6 overflow-auto">

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-slate-800">
              Reports & Analytics
            </h1>

            <Button 
              className="bg-[#15592F] hover:bg-[#104624]"
              onClick={() => setExportDialogOpen(true)}
            >
              <FileDown className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>

          {/* Stats */}
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4 mb-6">

            <Card className="border-0 shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <div className="flex justify-between mb-4">
                  <div className="bg-green-100 p-2 rounded-xl">
                    <ArrowRightLeft className="w-4 h-4 text-green-700" />
                  </div>

                  <Badge className="bg-green-100 text-green-700">
                    {statistics.target_percentage > 0 ? '+' : ''}{statistics.target_percentage.toFixed(1)}%
                  </Badge>
                </div>

                <h2 className="text-3xl font-bold">{statistics.total_transactions.toLocaleString()}</h2>
                <p className="text-muted-foreground text-sm">
                  Total Transactions
                </p>

                <div className="w-full h-2 bg-gray-200 rounded-full mt-4">
                  <div 
                    className="h-full bg-[#15592F] rounded-full" 
                    style={{ width: `${Math.min(statistics.target_percentage, 100)}%` }}
                  />
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  {statistics.target_percentage.toFixed(0)}% of monthly target
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <div className="flex justify-between mb-4">
                  <div className="bg-yellow-100 p-2 rounded-xl">
                    <Star className="w-4 h-4 text-yellow-600" />
                  </div>

                  <Badge className="bg-blue-100 text-blue-600">
                    Avg
                  </Badge>
                </div>

                <h2 className="text-3xl font-bold">{(statistics.avg_rating || 0).toFixed(1)}/5.0</h2>
                <p className="text-muted-foreground text-sm">
                  Feedback & Rates
                </p>

                <div className="w-full h-2 bg-gray-200 rounded-full mt-4">
                  <div 
                    className="h-full bg-yellow-500 rounded-full" 
                    style={{ width: `${((statistics.avg_rating || 0) / 5) * 100}%` }}
                  />
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  {(statistics.total_feedback || 0).toLocaleString()} total feedback
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <div className="flex justify-between mb-4">
                  <div className="bg-blue-100 p-2 rounded-xl">
                    <BadgeCheck className="w-4 h-4 text-blue-600" />
                  </div>

                  <Badge className="bg-green-100 text-green-700">
                    High
                  </Badge>
                </div>

                <h2 className="text-xl font-bold">
                  {statistics.most_requested.purpose}
                </h2>

                <p className="text-muted-foreground text-sm">
                  Most Requested
                </p>

                <div className="w-full h-2 bg-gray-200 rounded-full mt-4">
                  <div className="w-[82%] h-full bg-blue-500 rounded-full" />
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  {statistics.most_requested.count.toLocaleString()} requests
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <div className="flex justify-between mb-4">
                  <div className="bg-purple-100 p-2 rounded-xl">
                    <CircleCheck className="w-4 h-4 text-purple-600" />
                  </div>

                  <Badge className="bg-green-100 text-green-700">
                    {statistics.completion_rate >= 90 ? 'Excellent' : 'Good'}
                  </Badge>
                </div>

                <h2 className="text-3xl font-bold">{statistics.completion_rate}%</h2>

                <p className="text-muted-foreground text-sm">
                  Completion Rate
                </p>

                <div className="w-full h-2 bg-gray-200 rounded-full mt-4">
                  <div 
                    className="h-full bg-purple-500 rounded-full" 
                    style={{ width: `${statistics.completion_rate}%` }}
                  />
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  {statistics.completion_rate >= 90 ? 'Highest performance tier' : 'Good performance'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-1 gap-6 mb-6">

                       {/* Bar Chart */}
            <Card className="border-0 shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <div className="flex justify-between mb-5">
                  <h3 className="font-semibold">
                    Transactions by Purpose
                  </h3>

                  <MoreHorizontal className="w-5 h-5 text-gray-400" />
                </div>

                <div className="h-[280px]">
                  {loading ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Loading chart data...
                    </div>
                  ) : purposeData.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No data available
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={purposeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: 12 }}
                          interval={0}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" radius={[5, 5, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Reports - NOW VISIBLE */}
          <Card className="border-0 shadow-sm rounded-2xl">
            <CardContent className="p-6">

            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-semibold text-lg">
                  Recent Reports
                </h3>

                <p className="text-sm text-muted-foreground">
                  View and download previously generated analytics
                </p>
              </div>
              
              {recentReports.length > 0 && (
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  onClick={handleClearAllReports}
                  disabled={clearingReports}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {clearingReports ? 'Clearing...' : 'Clear All'}
                </Button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading reports...
              </div>
            ) : recentReports.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-gray-50 rounded-lg border-2 border-dashed">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="font-medium">No recent reports available</p>
                <p className="text-sm mt-1">Click "Export Report" above to generate your first report</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Report Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Generated Date</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Format</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Size</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentReports
                        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                        .map((report, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${
                                report.format === 'PDF' ? 'bg-red-100' :
                                report.format === 'XLSX' ? 'bg-green-100' :
                                'bg-blue-100'
                              }`}>
                                {report.format === 'PDF' ? (
                                  <FileText className="w-5 h-5 text-red-600" />
                                ) : (
                                  <FileSpreadsheet className="w-5 h-5 text-green-600" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {report.name}
                                </h4>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {report.date}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <Badge 
                              variant="secondary" 
                              className={`uppercase font-semibold ${
                                report.format === 'PDF' ? 'bg-red-100 text-red-700' :
                                report.format === 'XLSX' ? 'bg-green-100 text-green-700' :
                                'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {report.format}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-center text-sm text-gray-600">
                            {report.size}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                {recentReports.length > itemsPerPage && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, recentReports.length)} of {recentReports.length} reports
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </Button>
                      <div className="text-sm text-gray-600 px-3">
                        Page {currentPage} of {Math.ceil(recentReports.length / itemsPerPage)}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(Math.ceil(recentReports.length / itemsPerPage), prev + 1))}
                        disabled={currentPage >= Math.ceil(recentReports.length / itemsPerPage)}
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Feedback and Rates Table */}
        <Card className="border-0 shadow-sm rounded-2xl mt-6">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#15592F]" />
                  User Feedback & Ratings
                </h3>
                <p className="text-sm text-muted-foreground">
                  View all user feedback and ratings for transactions
                </p>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading feedback data...
              </div>
            ) : feedbackData.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-gray-50 rounded-lg border-2 border-dashed">
                <Star className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="font-medium">No feedback available</p>
                <p className="text-sm mt-1">Feedback will appear here once users submit ratings</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Student Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Student ID</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Transaction Purpose</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Rating</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Feedback</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feedbackData
                        .slice((feedbackCurrentPage - 1) * feedbackItemsPerPage, feedbackCurrentPage * feedbackItemsPerPage)
                        .map((feedback, index) => {
                          const studentName = feedback.user 
                            ? `${feedback.user.fname || ''} ${feedback.user.mname || ''} ${feedback.user.lname || ''}`.trim()
                            : 'N/A';
                          
                          const transactionPurpose = feedback.transaction?.purpose || 'N/A';
                          
                          return (
                            <tr
                              key={feedback.id || index}
                              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                              <td className="py-4 px-4">
                                <div className="font-medium text-gray-900">
                                  {studentName}
                                </div>
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-600">
                                {feedback.user?.student_id || 'N/A'}
                              </td>
                              <td className="py-4 px-4">
                                <div className="text-sm text-gray-900 font-medium">
                                  {transactionPurpose}
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center justify-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`w-4 h-4 ${
                                        star <= (feedback.rating || 0)
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                  <span className="ml-2 text-sm font-semibold text-gray-700">
                                    {feedback.rating || 0}/5
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-4 max-w-xs">
                                <div className="text-sm text-gray-600 truncate" title={feedback.message || 'No comment'}>
                                  {feedback.message || 'No comment provided'}
                                </div>
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-600">
                                {feedback.created_at ? new Date(feedback.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                }) : 'N/A'}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination for Feedback */}
                {feedbackData.length > feedbackItemsPerPage && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      Showing {((feedbackCurrentPage - 1) * feedbackItemsPerPage) + 1} to {Math.min(feedbackCurrentPage * feedbackItemsPerPage, feedbackData.length)} of {feedbackData.length} feedback
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFeedbackCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={feedbackCurrentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </Button>
                      <div className="text-sm text-gray-600 px-3">
                        Page {feedbackCurrentPage} of {Math.ceil(feedbackData.length / feedbackItemsPerPage)}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFeedbackCurrentPage(prev => Math.min(Math.ceil(feedbackData.length / feedbackItemsPerPage), prev + 1))}
                        disabled={feedbackCurrentPage >= Math.ceil(feedbackData.length / feedbackItemsPerPage)}
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Export Report Dialog */}
        <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <FileDown className="w-5 h-5 text-[#15592F]" />
                Export Report
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Report Type */}
              <div className="space-y-2">
                <Label>Select Report Type</Label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#15592F]"
                >
                  <option>Student Affairs Services Summary</option>
                  <option>Monthly Transaction Summary</option>
                  <option>Student ID Validation Report</option>
                  <option>Good Moral Character Certificates</option>
                  <option>Student Clearance Forms Report</option>
                  <option>Affidavits of Loss Report</option>
                  <option>Student Handbooks Distribution</option>
                  <option>Certifications and Documents Report</option>
                  <option>Scholarship Applications Report</option>
                  <option>Documentary Requirements Report</option>
                  <option>Detailed Transaction Report</option>
                  <option>Performance Metrics Report</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {reportTypeDescriptions[reportType]}
                </p>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <Label>Date Range</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500">START DATE</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">END DATE</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* File Format */}
              <div className="space-y-2">
                <Label>File Format</Label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setFileFormat('pdf')}
                    className={`flex flex-col items-center justify-center gap-2 p-4 border-2 rounded-lg transition-all ${
                      fileFormat === 'pdf'
                        ? 'border-[#15592F] bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <FileText className={`w-6 h-6 ${fileFormat === 'pdf' ? 'text-[#15592F]' : 'text-red-500'}`} />
                    <span className="text-sm font-medium">PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFileFormat('excel')}
                    className={`flex flex-col items-center justify-center gap-2 p-4 border-2 rounded-lg transition-all ${
                      fileFormat === 'excel'
                        ? 'border-[#15592F] bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <FileSpreadsheet className={`w-6 h-6 ${fileFormat === 'excel' ? 'text-[#15592F]' : 'text-green-600'}`} />
                    <span className="text-sm font-medium">Excel</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFileFormat('csv')}
                    className={`flex flex-col items-center justify-center gap-2 p-4 border-2 rounded-lg transition-all ${
                      fileFormat === 'csv'
                        ? 'border-[#15592F] bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <FileSpreadsheet className={`w-6 h-6 ${fileFormat === 'csv' ? 'text-[#15592F]' : 'text-gray-600'}`} />
                    <span className="text-sm font-medium">CSV</span>
                  </button>
                </div>
              </div>

              {/* Include in Report */}
              <div className="space-y-2">
                <Label>Include in Report</Label>
                <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="summary"
                      checked={includeSummary}
                      onCheckedChange={setIncludeSummary}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor="summary"
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        Summary Overview
                      </label>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Include status breakdown, total transactions, and top requested purposes
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="details"
                      checked={includeDetails}
                      onCheckedChange={setIncludeDetails}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor="details"
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        Detailed Transactions
                      </label>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Include complete list of all transactions with student information
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="feedback"
                      checked={includeFeedback}
                      onCheckedChange={setIncludeFeedback}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor="feedback"
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        Feedback Summary
                      </label>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Include student feedback ratings and distribution
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setExportDialogOpen(false)}
                disabled={exporting}
              >
                Cancel
              </Button>
              <Button
                className="bg-[#15592F] hover:bg-[#104624]"
                onClick={handleExportReport}
                disabled={exporting || (!includeSummary && !includeDetails && !includeFeedback)}
              >
                {exporting ? (
                  <>
                    <FileDown className="w-4 h-4 mr-2 animate-pulse" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4 mr-2" />
                    Export Report
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </main>
      </div>
    </SidebarProvider>
  );
}