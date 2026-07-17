import { useState, useEffect } from "react";
import {
  FileDown,
  ArrowRightLeft,
  Clock3,
  BadgeCheck,
  CircleCheck,
  MoreHorizontal,
  Download,
  FileText,
  FileSpreadsheet,
  X,
  Calendar,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
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
    completion_rate: 0
  });
  const [purposeData, setPurposeData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  
  // Export dialog state
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [reportType, setReportType] = useState("Monthly Transaction Summary");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [fileFormat, setFileFormat] = useState("pdf");
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeDetails, setIncludeDetails] = useState(true);
  const [includeFeedback, setIncludeFeedback] = useState(false);

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

      // Fetch all data in parallel
      const [statsRes, purposeRes, trendsRes, reportsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/reports/statistics`, { headers }),
        fetch(`${API_BASE_URL}/reports/by-purpose`, { headers }),
        fetch(`${API_BASE_URL}/reports/monthly-trends`, { headers }),
        fetch(`${API_BASE_URL}/reports/recent`, { headers })
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStatistics(statsData.statistics);
      }

      if (purposeRes.ok) {
        const purposeResData = await purposeRes.json();
        setPurposeData(purposeResData.data);
      }

      if (trendsRes.ok) {
        const trendsResData = await trendsRes.json();
        setMonthlyData(trendsResData.data);
      }

      if (reportsRes.ok) {
        const reportsResData = await reportsRes.json();
        setRecentReports(reportsResData.reports);
      }

    } catch (error) {
      console.error('Error fetching reports data:', error);
      toast.error('Failed to load reports data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
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
                    <Clock3 className="w-4 h-4 text-yellow-600" />
                  </div>

                  <Badge className="bg-blue-100 text-blue-600">
                    Avg
                  </Badge>
                </div>

                <h2 className="text-3xl font-bold">{statistics.avg_processing_time}</h2>
                <p className="text-muted-foreground text-sm">
                  Avg. Processing Time
                </p>

                <div className="w-full h-2 bg-gray-200 rounded-full mt-4">
                  <div className="w-[55%] h-full bg-yellow-500 rounded-full" />
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  Processing efficiency
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
          <div className="grid lg:grid-cols-2 gap-6 mb-6">

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

            {/* Line Chart */}
            <Card className="border-0 shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <div className="flex justify-between mb-5">
                  <h3 className="font-semibold">
                    Monthly Transaction Trends
                  </h3>

                  <MoreHorizontal className="w-5 h-5 text-gray-400" />
                </div>

                <div className="h-[280px]">
                  {loading ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Loading chart data...
                    </div>
                  ) : monthlyData.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No data available
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#15592F"
                          strokeWidth={3}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Reports - NOW VISIBLE */}
          <Card className="border-0 shadow-sm rounded-2xl">
            <CardContent className="p-6">

            <div className="flex justify-between mb-6">
              <div>
                <h3 className="font-semibold text-lg">
                  Recent Reports
                </h3>

                <p className="text-sm text-muted-foreground">
                  View and download previously generated analytics
                </p>
              </div>

              <Button variant="secondary">
                View History
              </Button>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading reports...
                </div>
              ) : recentReports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No recent reports available. Click "Export Report" to generate one.
                </div>
              ) : (
                recentReports.map((report, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border rounded-xl p-4 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-red-100 p-3 rounded-lg">
                        <FileText className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">
                          {report.name}
                        </h4>

                        <p className="text-sm text-muted-foreground">
                          Generated: {report.date}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <Badge variant="secondary" className="uppercase">
                        {report.format}
                      </Badge>

                      <span className="text-sm text-muted-foreground">
                        {report.size}
                      </span>

                      <Button
                        size="sm"
                        className="bg-[#15592F] hover:bg-[#104624]"
                        onClick={() => handleDownloadReport(report.download_url)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Export Report Dialog */}
        <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <FileDown className="w-5 h-5 text-[#15592F]" />
                Export Report
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Report Type */}
              <div className="space-y-2">
                <Label>Select Report Type</Label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-gray-50"
                >
                  <option>Monthly Transaction Summary</option>
                  <option>Detailed Transaction Report</option>
                  <option>Purpose Analysis Report</option>
                  <option>Performance Metrics Report</option>
                </select>
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
              <div className="space-y-3">
                <Label>Include in Report</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="summary"
                      checked={includeSummary}
                      onCheckedChange={setIncludeSummary}
                    />
                    <label
                      htmlFor="summary"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Summary (status overview)
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="details"
                      checked={includeDetails}
                      onCheckedChange={setIncludeDetails}
                    />
                    <label
                      htmlFor="details"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Detailed Transactions
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="feedback"
                      checked={includeFeedback}
                      onCheckedChange={setIncludeFeedback}
                    />
                    <label
                      htmlFor="feedback"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Feedback Summary
                    </label>
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
                disabled={exporting}
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