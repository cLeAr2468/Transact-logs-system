import { useState } from 'react';
import { Calendar, RefreshCw, CheckCircle, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './Asidebar';

const Dashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState('5'); // May
  const [selectedYear, setSelectedYear] = useState('2026');

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const years = ['2024', '2025', '2026', '2027'];

  const getMonthName = (monthValue) => {
    return months.find(m => m.value === monthValue)?.label || 'May';
  };

  const getDateRange = () => {
    const monthName = getMonthName(selectedMonth);
    const lastDay = new Date(selectedYear, parseInt(selectedMonth), 0).getDate();
    return `${monthName} 1 - ${monthName} ${lastDay}, ${selectedYear}`;
  };
  const stats = [
    {
      title: 'Total Transactions',
      value: '4,821',
      description: '26% of monthly target',
      icon: RefreshCw,
      trend: '+2.4%',
      trendUp: true,
      progress: 26,
      progressColor: 'from-black to-gray-800'
    },
    {
      title: 'Pending Requests',
      value: '148',
      description: 'Needs attention soon',
      icon: Calendar,
      trend: '+3.1%',
      trendUp: false,
      progress: 45,
      progressColor: 'from-orange-500 to-orange-600'
    },
    {
      title: 'Completed Services',
      value: '3,609',
      description: '88% completion rate',
      icon: CheckCircle,
      trend: '+8.7%',
      trendUp: true,
      progress: 88,
      progressColor: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Feedback Score',
      value: '4.7',
      suffix: '/5',
      description: 'Based on 1,284 reviews',
      icon: Star,
      trend: '+0.3',
      trendUp: true,
      rating: 4.5
    }
  ];

  const transactions = [
    {
      date: 'Jun 30, 2025',
      student: 'Criscel Jane',
      purpose: 'Good Moral Certificate',
      address: 'Brgy. Quezon, San Jorge',
      course: 'BS Agriculture',
      status: 'Completed'
    },
    {
      date: 'Jun 30, 2025',
      student: 'Lean Cabarles',
      purpose: 'TES Scholarship',
      address: 'Brgy. Erenas, San Jorge',
      course: 'BS Education',
      status: 'Pending'
    },
    {
      date: 'Jun 29, 2025',
      student: 'Kyla Aliman',
      purpose: 'Student Clearance',
      address: 'Gandara Samar',
      course: 'BS Information Technology',
      status: 'Processing'
    },
    {
      date: 'Jun 28, 2025',
      student: 'Renato Bordallo',
      purpose: 'ID Validation',
      address: 'Pagsaghan Samar',
      course: 'BS Criminology',
      status: 'Processing'
    }
  ];

  const performanceData = [
    { label: 'ID Validation', value: 920, color: 'from-emerald-400 to-emerald-500' },
    { label: 'Good Moral', value: 640, color: 'from-lime-400 to-lime-500' },
    { label: 'Scholarship', value: 838, color: 'from-yellow-400 to-yellow-500' },
    { label: 'Student Clearance', value: 1102, color: 'from-green-400 to-green-500' },
    { label: 'Request ID Form', value: 355, color: 'from-pink-400 to-pink-500' }
  ];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : i < rating
            ? 'text-yellow-400 fill-current opacity-50'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />  
        <main className="flex-1 overflow-auto">
          <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Calendar className="w-5 h-5 text-green-600" />
                <div className="flex items-center gap-2">
                  <select 
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="text-sm text-gray-700 bg-white border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {months.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                  <select 
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="text-sm text-gray-700 bg-white border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <span className="text-sm text-gray-500">({getDateRange()})</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <Card key={index} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <stat.icon className="w-5 h-5 text-gray-500" />
                      <span className={`text-sm font-medium ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.trend}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                      {stat.suffix && <span className="text-lg text-gray-500">{stat.suffix}</span>}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{stat.title}</p>
                    <p className="text-xs text-gray-500">{stat.description}</p>
                    
                    {stat.progress !== undefined && (
                      <div className="mt-3">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full bg-gradient-to-r ${stat.progressColor} transition-all duration-500`}
                            style={{ width: `${stat.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {stat.rating && (
                      <div className="flex mt-2">
                        {renderStars(stat.rating)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Recent Transactions */}
              <div className="lg:col-span-3">
                <Card className="bg-white border-0 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
                        <CardDescription>Latest service requests and updates</CardDescription>
                      </div>
                      <Button variant="ghost" size="sm" className="text-green-600">
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Student</TableHead>
                          <TableHead>Purpose</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead>Course</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((transaction, index) => (
                          <TableRow key={index}>
                            <TableCell>{transaction.date}</TableCell>
                            <TableCell className="font-medium">{transaction.student}</TableCell>
                            <TableCell>{transaction.purpose}</TableCell>
                            <TableCell>{transaction.address}</TableCell>
                            <TableCell>{transaction.course}</TableCell>
                            <TableCell>
                              <Badge className={`${getStatusColor(transaction.status)}`}>
                                {transaction.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Summary */}
              <div className="lg:col-span-1 left">
                <Card className="bg-gradient-to-br from-[#15592F] to-[#0d3d20] text-white h-full">
                  <CardHeader>
                    <CardTitle className="text-white text-[14px]">Performance Summary</CardTitle>
                    <CardDescription className="text-green-100 text-[14px]">Current semester overview</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {performanceData.map((item, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-green-100">{item.label}</span>
                            <span className="text-sm font-semibold text-white">{item.value}</span>
                          </div>
                          <div className="h-2 bg-green-900/40 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-500`}
                              style={{ width: `${(item.value / 1200) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
