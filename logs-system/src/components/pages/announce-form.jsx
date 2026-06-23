"use client";

import { useState } from "react";
import {
  Calendar,
  Upload,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link,
  ImageIcon,
  Plus,
  NotepadTextDashed,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/Asidebar';

export default function Announcement() {
  const [image, setImage] = useState(null);
  const [publishDate, setPublishDate] = useState("");

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#f6f7fb]">
        <AppSidebar />
        <main className="flex-1 overflow-auto p-6">
          <div className="bg-gray-100 min-h-screen">
            <h1 className="text-4xl font-light text-gray-700 mb-6">
              Announcement
            </h1>

            <Card className="rounded-xl shadow-sm border">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left Side */}
                  <div className="space-y-6">
                    {/* Title */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Announcement Title
                      </label>

                      <Input
                        placeholder="Enter title here..."
                        className="h-11"
                      />
                    </div>

                    {/* Audience */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Target Audience
                      </label>

                      <Select>
                        <SelectTrigger className="w-[220px] h-11">
                          <SelectValue placeholder="Select Audience" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="all">All Students</SelectItem>
                          <SelectItem value="faculty">Faculty</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Publish Date
                      </label>

                      <input
                        type="date"
                        value={publishDate}
                        onChange={(e) => setPublishDate(e.target.value)}
                        placeholder="mm/dd/yyyy"
                        className="w-55 h-8 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Right Side */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Cover Image (Optional)
                    </label>

                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer border-2 border-dashed border-gray-300 rounded-xl h-[180px] flex flex-col justify-center items-center bg-white hover:bg-gray-50 transition"
                    >
                      {image ? (
                        <img
                          src={image}
                          alt="Preview"
                          className="h-full w-full object-cover rounded-xl"
                        />
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                            <Upload className="w-5 h-5 text-blue-600" />
                          </div>

                          <p className="font-medium text-gray-700">
                            Click to upload or drag and drop
                          </p>

                          <p className="text-sm text-gray-500">
                            PNG, JPG or WEBP (Max 2MB)
                          </p>
                        </>
                      )}
                    </label>

                    <input
                      id="image-upload"
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </div>
                </div>

                {/* Content Editor */}
                <div className="mt-6">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Content
                  </label>

                  <div className="border rounded-lg overflow-hidden bg-white">
                    {/* Toolbar */}
                    <div className="border-b px-3 py-2 flex items-center gap-3 text-gray-600">
                      <button className="hover:text-black">
                        <Bold className="w-4 h-4" />
                      </button>

                      <button className="hover:text-black">
                        <Italic className="w-4 h-4" />
                      </button>

                      <button className="hover:text-black">
                        <Underline className="w-4 h-4" />
                      </button>

                      <Separator orientation="vertical" className="h-5" />

                      <button className="hover:text-black">
                        <List className="w-4 h-4" />
                      </button>

                      <button className="hover:text-black">
                        <ListOrdered className="w-4 h-4" />
                      </button>

                      <Separator orientation="vertical" className="h-5" />

                      <button className="hover:text-black">
                        <Link className="w-4 h-4" />
                      </button>

                      <button className="hover:text-black">
                        <ImageIcon className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Editor */}
                    <textarea
                      placeholder="Write announcement details here..."
                      className="w-full h-[230px] resize-none border-0 focus:outline-none focus:ring-0 p-4 text-sm"
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="my-6">
                  <Separator />
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-between items-center">
                  <Button
                    variant="secondary"
                    className="px-8"
                  >
                    Cancel
                  </Button>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="px-8"
                    >
                      <NotepadTextDashed />
                      Save as Draft
                    </Button>

                    <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8">
                      <Plus className="w-4 h-4 mr-2" />
                      PUBLISH ANNOUNCEMENT
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}