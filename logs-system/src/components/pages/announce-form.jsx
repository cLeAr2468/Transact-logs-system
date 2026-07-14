"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  ArrowLeft,
  CheckIcon,
  Loader2,
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
import { createAnnouncement } from '@/api/announcementApi';
import { toast } from "sonner";

export default function Announcement() {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!title.trim()) {
      toast.error("Please enter announcement title");
      return;
    }
    if (!content.trim()) {
      toast.error("Please enter announcement content");
      return;
    }
    if (!status) {
      toast.error("Please select status");
      return;
    }

    try {
      setLoading(true);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('status', status);
      
      if (imageFile) {
        formData.append('cover_image', imageFile);
      }

      const response = await createAnnouncement(formData);
      
      toast.success(response.message || 'Announcement created successfully!');
      
      // Navigate back to announcements page after short delay
      setTimeout(() => {
        navigate('/announce');
      }, 1000);
      
    } catch (err) {
      console.error("Failed to create announcement:", err);
      toast.error(err.message || "Failed to create announcement");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (title || content || image) {
      toast.warning(
        <div>
          <p className="font-semibold">Cancel Announcement?</p>
          <p className="text-sm">All unsaved changes will be lost.</p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => {
                navigate('/announce');
                toast.dismiss();
              }}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Yes, Cancel
            </button>
            <button
              onClick={() => toast.dismiss()}
              className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
            >
              No, Continue
            </button>
          </div>
        </div>,
        { duration: 10000 }
      );
    } else {
      navigate('/announce');
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
                        Announcement Title <span className="text-red-500">*</span>
                      </label>

                      <Input
                        placeholder="Enter title here..."
                        className="h-11"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={loading}
                      />
                    </div>

                    {/* Status Select */}
                    <div> 
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Status <span className="text-red-500">*</span>
                      </label>

                      <Select value={status} onValueChange={setStatus} disabled={loading}>
  <SelectTrigger className="w-[220px] h-11">
    <SelectValue placeholder="Select Status" />
  </SelectTrigger>

  <SelectContent>
    <SelectItem value="archive">Archive</SelectItem>
    <SelectItem value="draft">Draft</SelectItem>
    <SelectItem value="published">Published</SelectItem>
  </SelectContent>
</Select>
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
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Content Editor */}
                <div className="mt-6">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Content <span className="text-red-500">*</span>
                  </label>

                  
                    <div className="flex gap-2 mb-2">    
                    {/* Editor */}
                    <textarea
                      placeholder="Write announcement details here..."
                      className="w-full h-[230px] resize-none border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 p-4 text-sm"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      disabled={loading}
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
                    onClick={handleCancel}
                    disabled={loading}
                    type="button"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>

                  <div className="flex gap-3">
                    <Button
                      className="px-8 bg-[#15592F] hover:bg-[#124b28]"
                      onClick={handleSubmit}
                      disabled={loading}
                      type="button"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckIcon className="mr-2 h-4 w-4" />
                          Save Announcement
                        </>
                      )}
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