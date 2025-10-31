import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";

import Welcome from "./pages/Welcome";
import Access from "./pages/Access";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/app/Dashboard";
import Clientes from "./pages/app/Clientes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/welcome" replace />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/access" element={<Access />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            
            <Route path="/app/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
            <Route path="/app/clientes" element={<DashboardLayout><Clientes /></DashboardLayout>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
