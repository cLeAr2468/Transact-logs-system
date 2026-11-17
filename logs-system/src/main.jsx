import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import { Toaster } from "sonner";

// Version banner
console.log('%c🚀 NWSSU Logs System - Admin Panel', 'font-size: 20px; font-weight: bold; color: #15592F;');
console.log('%cVersion: 2.1.20261117 (Fixed Sidebar)', 'font-size: 14px; color: #666;');
console.log('%cEnvironment:', window.location.hostname.includes('pages.dev') ? 'Production (Cloudflare Pages)' : 'Development', 'font-size: 14px; color: #666;');
console.log('%cAPI Detection: Automatic', 'font-size: 14px; color: #666;');
console.log('');

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
    <Toaster position="top-right" richColors />
  </BrowserRouter>
);