import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/Asidebar";

import {
  Search,
  Plus,
  ArrowRightLeft,
  Hourglass,
  CheckCircle2,
} from "lucide-react";

import { Link } from "react-router-dom";

const Transaction = () => {
  const transactions = [
    {
      date: "Jun 30, 2025",
      student: "Criscel Jane",
      purpose: "Good Moral Certificate",
      address: "Brgy. Quezon, San Jorge",
      course: "BSA",
      status: "Completed",
    },
    {
      date: "Jun 30, 2025",
      student: "Lean Cabarles",
      purpose: "TES Scholarship",
      address: "Brgy. Erenas, San Jorge",
      course: "BEED",
      status: "Pending",
    },
    {
      date: "May 1, 2026",
      student: "Kyla Aliman",
      purpose: "Student Clearance",
      address: "Gandara Samar",
      course: "BSIT",
      status: "Processing",
    },
    {
      date: "Jun 28, 2025",
      student: "Renato Bordallo",
      purpose: "ID Validation",
      address: "Pagsanghan Samar",
      course: "BSCRIM",
      status: "Processing",
    },
    {
      date: "Jun 30, 2025",
      student: "Kathy Acera",
      purpose: "TES Scholarship",
      address: "Brgy. Aurora, San Jorge",
      course: "BTLED",
      status: "Pending",
    },
    {
      date: "May 12, 2026",
      student: "Miguel Manozo",
      purpose: "Request ID Form",
      address: "Brgy. Catores, Gandara",
      course: "BSF",
      status: "Completed",
    },
    {
      date: "Jun 30, 2025",
      student: "Edriel Gabuya",
      purpose: "Affidavit of Loss",
      address: "Brgy. Blanca, San Jorge",
      course: "BSABE",
      status: "Completed",
    },
  ];

  // ✅ FILTER & SEARCH STATE
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");


  // ✅ COMBINED FILTER & SEARCH LOGIC
  const filteredTransactions = transactions.filter((item) => {
    // First filter by status
    const statusMatch = filter === "All" || item.status === filter;

    // Then search by query (searches in multiple fields)
    const searchMatch = searchQuery === "" || 
      item.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.date.toLowerCase().includes(searchQuery.toLowerCase());


    // Return true only if all conditions are met
    return statusMatch && searchMatch;
  });

  // STATUS COLORS
  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700 hover:bg-green-100";
      case "Pending":
        return "bg-red-100 text-red-700 hover:bg-red-100";
      case "Processing":
        return "bg-blue-100 text-blue-700 hover:bg-blue-100";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#f6f7fb]">
        <AppSidebar />

        <main className="flex-1 overflow-auto">
          <div className="p-6">

            {/* SEARCH + CALENDAR + BUTTON */}
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
              <div className="relative w-full md:w-[380px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

                <Input
                  placeholder="Search by Name, Date, or Program..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 bg-white border-gray-200"
                />
              </div>

              <Link to="/add-transact">
                <Button className="bg-[#15592F] hover:bg-[#124b28] text-white shadow-md h-11 w-full rounded-md md:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  ADD TRANSACTION
                </Button>
              </Link>
            </div>

            {/* CARDS (UNCHANGED) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="border-0 shadow-sm rounded-2xl">
                <CardContent className="p-5">
                  <div className="flex justify-between items-center mb-5">
                    <div className="bg-green-100 p-2 rounded-full">
                      <ArrowRightLeft className="h-4 w-4 text-green-700" />
                    </div>
                    <Badge className="bg-green-100 text-green-700">
                      +12.4%
                    </Badge>
                  </div>

                  <h2 className="text-3xl font-bold text-slate-800">
                    4,821
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Total Transactions
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm rounded-2xl">
                <CardContent className="p-5">
                  <div className="flex justify-between items-center mb-5">
                    <div className="bg-yellow-100 p-2 rounded-full">
                      <Hourglass className="h-4 w-4 text-yellow-600" />
                    </div>
                    <Badge className="bg-red-100 text-red-600">
                      +3.1%
                    </Badge>
                  </div>

                  <h2 className="text-3xl font-bold text-slate-800">
                    148
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Pending Requests
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm rounded-2xl">
                <CardContent className="p-5">
                  <div className="flex justify-between items-center mb-5">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    </div>
                    <Badge className="bg-green-100 text-green-700">
                      +8.7%
                    </Badge>
                  </div>

                  <h2 className="text-3xl font-bold text-slate-800">
                    3,609
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Completed Services
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* TABLE */}
            <Card className="border-0 shadow-sm rounded-2xl">
              <CardContent className="p-6">

                {/* TITLE + FILTER BUTTONS */}
                <div className="flex flex-col gap-4 mb-6">
                  <h2 className="text-2xl font-semibold text-[#15592F]">
                    Transaction Records
                  </h2>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={filter === "All" ? "default" : "outline"}
                      onClick={() => setFilter("All")}
                      className={
                        filter === "All"
                          ? "bg-[#15592F] hover:bg-[#124b28] text-white"
                          : ""
                      }
                    >
                      All
                    </Button>

                    <Button
                      variant={filter === "Completed" ? "default" : "outline"}
                      onClick={() => setFilter("Completed")}
                      className={
                        filter === "Completed"
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : ""
                      }
                    >
                      Completed
                    </Button>

                    <Button
                      variant={filter === "Pending" ? "default" : "outline"}
                      onClick={() => setFilter("Pending")}
                      className={
                        filter === "Pending"
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : ""
                      }
                    >
                      Pending
                    </Button>

                    <Button
                      variant={filter === "Processing" ? "default" : "outline"}
                      onClick={() => setFilter("Processing")}
                      className={
                        filter === "Processing"
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : ""
                      }
                    >
                      Processing
                    </Button>
                  </div>
                </div>

                {/* TABLE */}
                <div className="overflow-x-auto">
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
                      {filteredTransactions.length > 0 ? (
                        filteredTransactions.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.date}</TableCell>
                            <TableCell className="font-medium">
                              {item.student}
                            </TableCell>
                            <TableCell>{item.purpose}</TableCell>
                            <TableCell>{item.address}</TableCell>
                            <TableCell>{item.course}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(item.status)}>
                                {item.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center py-8 text-gray-500"
                          >
                            {searchQuery
                              ? `No transactions found matching "${searchQuery}" in ${filter} status.`
                              : `No ${filter} transactions found.`}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

              </CardContent>
            </Card>

          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Transaction;