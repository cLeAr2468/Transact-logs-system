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


function Reroutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/manage-users" element={<Staff />} />
      <Route path="/manage-client" element={<Client />} />
      <Route path="/transact" element={<Transaction />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/announce" element={<Announcement />} />
      <Route path="/add-transact" element={<AddTransaction />} />
      <Route path="/add-announcement" element={<AddAnnouncement />} />
      <Route path="/Client-register" element={<Register />} />
    </Routes>
  );
}

export default Reroutes;