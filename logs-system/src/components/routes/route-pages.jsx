import { Routes, Route } from "react-router-dom";
import Login from "@/components/pages/login";
import Dashboard from "@/components/layout/dashboard";
import Staff from "@/components/pages/manage-staff";
import Client from "@/components/pages/manage-client";
import Transaction from "@/components/pages/transact";
import Reports from "@/components/pages/reports";
import Announcement from "@/components/pages/announce";
import AddTransaction from "@/components/pages/add-transact"
import AddAnnouncement from "@/components/pages/announce-form";
import Register from "@/components/pages/Client-register";
import Masteerlist from "@/components/pages/master-list";
import AddManual from "@/components/pages/add-manual";
import AddStaff from "@/components/pages/add-staff";
import RecentTransact from "@/components/pages/recent-transact";
import Profile from "@/components/pages/profile";
import ManagePurpose from "@/components/pages/manage-purpose";
import ProtectedRoute from "./ProtectedRoute";

function Reroutes() {
  return (
    <Routes>
      {/* Public Route - Login */}
      <Route path="/" element={<Login />} />
      
      {/* Protected Routes - Require Authentication */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/manage-users" element={<ProtectedRoute><Staff /></ProtectedRoute>} />
      <Route path="/manage-client" element={<ProtectedRoute><Client /></ProtectedRoute>} />
      <Route path="/transact" element={<ProtectedRoute><Transaction /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/announce" element={<ProtectedRoute><Announcement /></ProtectedRoute>} />
      <Route path="/add-transact" element={<ProtectedRoute><AddTransaction /></ProtectedRoute>} />
      <Route path="/add-announcement" element={<ProtectedRoute><AddAnnouncement /></ProtectedRoute>} />
      <Route path="/Client-register" element={<ProtectedRoute><Register /></ProtectedRoute>} />
      <Route path="/master-list" element={<ProtectedRoute><Masteerlist /></ProtectedRoute>} />
      <Route path="/add-manual" element={<ProtectedRoute><AddManual /></ProtectedRoute>} />
      <Route path="/add-staff" element={<ProtectedRoute><AddStaff /></ProtectedRoute>} />
      <Route path="/Activity" element={<ProtectedRoute><RecentTransact /></ProtectedRoute>} />
      <Route path="/manage-purpose" element={<ProtectedRoute><ManagePurpose /></ProtectedRoute>} />
    </Routes>
  );
}

export default Reroutes;