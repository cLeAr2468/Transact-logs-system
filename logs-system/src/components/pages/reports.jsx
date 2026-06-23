import {
  FileDown,
  ArrowRightLeft,
  Clock3,
  BadgeCheck,
  CircleCheck,
  MoreHorizontal,
  Download,
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

const purposeData = [
  { name: "Good Moral", value: 1300, fill: "#15592F" },
  { name: "ID Valid.", value: 1000, fill: "#f59e0b" },
  { name: "Scholarship", value: 900, fill: "#3b82f6" },
  { name: "Clearance", value: 1200, fill: "#155d59" },
  { name: "Diplomas", value: 450, fill: "#8b5cf6" },
];

const monthlyData = [
  { month: "Jan", value: 320 },
  { month: "Feb", value: 380 },
  { month: "Mar", value: 350 },
  { month: "Apr", value: 420 },
  { month: "May", value: 490 },
  { month: "Jun", value: 410 },
];

const reports = [
  {
    name: "Monthly Transaction Summary - May",
    date: "May 31, 2026",
    format: "PDF",
    size: "1.2 MB",
  },
  {
    name: "Service Request Analytics",
    date: "May 28, 2026",
    format: "PDF",
    size: "980 KB",
  },
  {
    name: "Department Performance Report",
    date: "May 25, 2026",
    format: "Excel",
    size: "2.4 MB",
  },
];

export default function Reports() {
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

            <Button className="bg-[#15592F] hover:bg-[#104624]">
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
                    +12.4%
                  </Badge>
                </div>

                <h2 className="text-3xl font-bold">4,821</h2>
                <p className="text-muted-foreground text-sm">
                  Total Transactions
                </p>

                <div className="w-full h-2 bg-gray-200 rounded-full mt-4">
                  <div className="w-[74%] h-full bg-[#15592F] rounded-full" />
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  74% of monthly target
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <div className="flex justify-between mb-4">
                  <div className="bg-yellow-100 p-2 rounded-xl">
                    <Clock3 className="w-4 h-4 text-yellow-600" />
                  </div>

                  <Badge className="bg-red-100 text-red-600">
                    -5.2m
                  </Badge>
                </div>

                <h2 className="text-3xl font-bold">12.5 min</h2>
                <p className="text-muted-foreground text-sm">
                  Avg. Processing Time
                </p>

                <div className="w-full h-2 bg-gray-200 rounded-full mt-4">
                  <div className="w-[55%] h-full bg-yellow-500 rounded-full" />
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  Improving from last month
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
                  Good Moral Cert.
                </h2>

                <p className="text-muted-foreground text-sm">
                  Most Requested
                </p>

                <div className="w-full h-2 bg-gray-200 rounded-full mt-4">
                  <div className="w-[82%] h-full bg-blue-500 rounded-full" />
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  1,240 requests this month
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
                    +2.1%
                  </Badge>
                </div>

                <h2 className="text-3xl font-bold">94.8%</h2>

                <p className="text-muted-foreground text-sm">
                  Completion Rate
                </p>

                <div className="w-full h-2 bg-gray-200 rounded-full mt-4">
                  <div className="w-[95%] h-full bg-purple-500 rounded-full" />
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  Highest performance tier
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
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reports Table */}
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
                {reports.map((report, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border rounded-xl p-4 bg-white"
                  >
                    <div>
                      <h4 className="font-medium">
                        {report.name}
                      </h4>

                      <p className="text-sm text-muted-foreground">
                        {report.date}
                      </p>
                    </div>

                    <div className="flex items-center gap-6">
                      <Badge variant="secondary">
                        {report.format}
                      </Badge>

                      <span className="text-sm text-muted-foreground">
                        {report.size}
                      </span>

                      <Button
                        size="sm"
                        className="bg-[#15592F] hover:bg-[#104624]"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarProvider>
  );
}