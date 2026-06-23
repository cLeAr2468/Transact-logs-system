"use client";

import { Search, Plus, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
import {Link} from "react-router-dom";

const announcements = [
  {
    id: 1,
    title: "Final Examination Schedule - First Semester",
    description:
      "Please be informed of the following schedule for the final examination.",
    date: "Oct 24, 2023",
    audience: "All Students",
    status: "Published",
  },
  {
    id: 2,
    title: "Maintenance Advisory: Student Portal",
    description:
      "The student portal will be offline for scheduled maintenance.",
    date: "Oct 22, 2023",
    audience: "Staff & Faculty",
    status: "Draft",
  },
  {
    id: 3,
    title: "SAS Scholarship Application Extension",
    description:
      "Great news! The deadline for scholarship applications has been extended.",
    date: "Oct 20, 2023",
    audience: "All Students",
    status: "Published",
  },
  {
    id: 4,
    title: "Campus Clean-up Drive Activity",
    description:
      "Join us this Saturday for our annual campus beautification program adadasdasdadwdadawdawfawfadasdawfdawfawf.",
    date: "Oct 18, 2023",
    audience: "Entire Campus",
    status: "Archived",
  },
];

export default function AnnouncementPage() {
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
                  <Link to="/add-announcement">
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
                      />
                    </div>
                  </div>

                  {/* Audience */}
                  <div className="md:col-span-3">
                    <label className="text-sm font-medium text-slate-600 mb-2 block">
                      Target Audience
                    </label>

                    <Select>
                      <SelectTrigger className="w-full rounded-md border-gray-300 bg-white">
                        <SelectValue placeholder="Select Audience" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="all">
                          All Students
                        </SelectItem>
                        <SelectItem value="faculty">
                          Staff & Faculty
                        </SelectItem>
                        <SelectItem value="campus">
                          Entire Campus
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status */}
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-slate-600 mb-2 block">
                      Status
                    </label>

                    <Select>
                      <SelectTrigger className="w-full rounded-md bg-white border-gray-300">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="published">
                          Published
                        </SelectItem>
                        <SelectItem value="draft">
                          Draft
                        </SelectItem>
                        <SelectItem value="archived">
                          Archived
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filter Button */}
                  <div className="md:col-span-2 flex items-end">
                    <Button className="w-full bg-green-700 hover:bg-green-800 rounded-md text-white font-semibold">
                      FILTER
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
                        <TableHead className="w-1/5 text-left">Target Audience</TableHead>
                        <TableHead className="w-1/6 text-left">Status</TableHead>
                        <TableHead className="w-1/6 text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {announcements.map((item) => (
                        <TableRow key={item.id} className="align-top">
                          <TableCell className="w-1/3 align-top py-4">
                            <div className="flex flex-col gap-1">
                              <h3 className="font-semibold text-slate-900 text-sm break-words whitespace-normal">
                                {item.title}
                              </h3>

                              <p className="text-xs text-slate-500 break-words whitespace-normal">
                                {item.description}
                              </p>
                            </div>
                          </TableCell>

                          <TableCell className="w-1/6 text-slate-600 align-top text-sm whitespace-nowrap py-4">
                            {item.date}
                          </TableCell>

                          <TableCell className="w-1/5 align-top py-4">
                            {item.audience === "All Students" && (
                              <Badge
                                variant="secondary"
                                className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-xs"
                              >
                                ALL STUDENTS
                              </Badge>
                            )}

                            {item.audience === "Staff & Faculty" && (
                              <Badge
                                variant="secondary"
                                className="bg-slate-200 text-slate-700 hover:bg-slate-200 text-xs"
                              >
                                STAFF & FACULTY
                              </Badge>
                            )}

                            {item.audience === "Entire Campus" && (
                              <Badge
                                variant="secondary"
                                className="bg-green-100 text-green-700 hover:bg-green-100 text-xs"
                              >
                                ENTIRE CAMPUS
                              </Badge>
                            )}
                          </TableCell>

                          <TableCell className="w-1/6 align-top py-4">
                            <div className="flex items-center gap-1">
                              <span
                                className={`h-2 w-2 rounded-full flex-shrink-0 ${
                                  item.status === "Published"
                                    ? "bg-green-500"
                                    : item.status === "Draft"
                                    ? "bg-yellow-500"
                                    : "bg-gray-400"
                                }`}
                              />

                              <span className="text-sm whitespace-nowrap">
                                {item.status}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="w-1/6 align-top py-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                size="icon"
                                variant="secondary"
                                className="h-8 w-8 flex-shrink-0"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>

                              <Button
                                size="icon"
                                variant="destructive"
                                className="h-8 w-8 flex-shrink-0"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
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
}