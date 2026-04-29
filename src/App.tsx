import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import ReportMonthly from "./pages/ReportMonthly.tsx";
import ReportYearly from "./pages/ReportYearly.tsx";
import EnergyQuota from "./pages/EnergyQuota.tsx";
import Archives from "./pages/Archives.tsx";
import DualControl from "./pages/DualControl.tsx";
import Assets from "./pages/Assets.tsx";
import GreenMfg from "./pages/GreenMfg.tsx";
import Benchmark from "./pages/Benchmark.tsx";
import Enterprise from "./pages/Enterprise.tsx";
import System from "./pages/System.tsx";
import SystemUsers from "./pages/SystemUsers.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/report-monthly" element={<ReportMonthly />} />
          <Route path="/report-yearly" element={<ReportYearly />} />
          <Route path="/energy-quota" element={<EnergyQuota />} />
          <Route path="/energy-quota/standard" element={<EnergyQuota />} />
          <Route path="/energy-quota/declaration" element={<EnergyQuota />} />
          <Route path="/archives" element={<Archives />} />
          <Route path="/dual-control" element={<DualControl />} />
          <Route path="/assets" element={<Assets />} />
          <Route path="/green-mfg" element={<GreenMfg />} />
          <Route path="/benchmark" element={<Benchmark />} />
          <Route path="/enterprise" element={<Enterprise />} />
          <Route path="/system" element={<System />} />
          <Route path="/system/users" element={<SystemUsers />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
