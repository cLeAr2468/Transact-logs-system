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

function Reroutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/manage-users" element={<Staff />} />
      <Route path="/manage-client" element={<Client />} />
      <Route path="/transact" element={<Transaction />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/announce" element={<Announcement />} />
      <Route path="/add-transact" element={<AddTransaction />} />
      <Route path="/add-announcement" element={<AddAnnouncement />} />
      <Route path="/Client-register" element={<Register />} />
      <Route path="/master-list" element={<Masteerlist />} />
      <Route path="/add-manual" element={<AddManual />} />
      <Route path="/add-staff" element={<AddStaff />} />
      <Route path="/recent-transact" element={<RecentTransact />} />
      <Route path="/manage-purpose" element={<ManagePurpose />} />
    </Routes>
  );
}

export default Reroutes;