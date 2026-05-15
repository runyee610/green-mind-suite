import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleProvider } from "@/contexts/RoleContext";
import ScrollToTop from "@/components/ScrollToTop";
import { Navigate } from "react-router-dom";
import { useRole } from "@/contexts/RoleContext";
import Index from "./pages/Index.tsx";

const HomeRoute = () => {
  const { role } = useRole();
  if (role === "ent") return <Navigate to="/green-mfg/ent" replace />;
  return <Index />;
};
import NotFound from "./pages/NotFound.tsx";
import ReportMonthly from "./pages/ReportMonthly.tsx";
import ReportMonthlyFilling from "./pages/ReportMonthlyFilling.tsx";
import EnergyQuota from "./pages/EnergyQuota.tsx";
import Assets from "./pages/Assets.tsx";
import GreenMfg from "./pages/GreenMfg.tsx";
import GreenMfgGov from "./pages/GreenMfgGov.tsx";
import GreenMfgGovDeclarationDetail from "./pages/GreenMfgGovDeclarationDetail.tsx";
import GreenMfgGovDynamicEdit from "./pages/GreenMfgGovDynamicEdit.tsx";
import GreenMfgGovIncubator from "./pages/GreenMfgGovIncubator.tsx";
import GreenMfgEnt from "./pages/GreenMfgEnt.tsx";
import GreenMfgEntDeclarationDetail from "./pages/GreenMfgEntDeclarationDetail.tsx";
import GreenMfgEntDeclarationNew from "./pages/GreenMfgEntDeclarationNew.tsx";
import GreenMfgEntDynamicEdit from "./pages/GreenMfgEntDynamicEdit.tsx";
import GreenMfgEntIncubator from "./pages/GreenMfgEntIncubator.tsx";
import GreenMfgEntReview from "./pages/GreenMfgEntReview.tsx";
import GreenMfgEntZeroCarbon from "./pages/GreenMfgEntZeroCarbon.tsx";
import GreenMfgGovZeroCarbon from "./pages/GreenMfgGovZeroCarbon.tsx";
import System from "./pages/System.tsx";
import SystemUsers from "./pages/SystemUsers.tsx";
import SystemPermissions from "./pages/SystemPermissions.tsx";
import PolicyAgent from "./pages/PolicyAgent.tsx";
import GreenMfgAgent from "./pages/GreenMfgAgent.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RoleProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomeRoute />} />
          <Route path="/report-monthly" element={<ReportMonthly />} />
          <Route path="/report-monthly/filling" element={<ReportMonthlyFilling />} />
          <Route path="/energy-quota" element={<EnergyQuota />} />
          <Route path="/energy-quota/standard" element={<EnergyQuota />} />
          <Route path="/energy-quota/declaration" element={<EnergyQuota />} />
          <Route path="/assets" element={<Assets />} />
          <Route path="/green-mfg" element={<GreenMfg />} />
          <Route path="/green-mfg/gov" element={<GreenMfgGov section="declaration" />} />
          <Route path="/green-mfg/gov/review" element={<GreenMfgGov section="declaration" />} />
          <Route path="/green-mfg/gov/dynamic" element={<GreenMfgGov section="dynamic" />} />
          <Route path="/green-mfg/gov/zerocarbon" element={<GreenMfgGovZeroCarbon />} />
          <Route path="/green-mfg/gov/incubator" element={<GreenMfgGovIncubator />} />
          <Route path="/green-mfg/gov/declaration/:id" element={<GreenMfgGovDeclarationDetail />} />
          <Route path="/green-mfg/gov/dynamic/:id" element={<GreenMfgGovDynamicEdit />} />
          <Route path="/green-mfg/ent" element={<GreenMfgEnt section="declaration" />} />
          <Route path="/green-mfg/ent/review" element={<GreenMfgEntReview />} />
          <Route path="/green-mfg/ent/dynamic" element={<GreenMfgEnt section="dynamic" />} />
          <Route path="/green-mfg/ent/zerocarbon" element={<GreenMfgEntZeroCarbon />} />
          <Route path="/green-mfg/ent/incubator" element={<GreenMfgEntIncubator />} />
          <Route path="/green-mfg/ent/declaration/new" element={<GreenMfgEntDeclarationNew />} />
          <Route path="/green-mfg/ent/declaration/:id" element={<GreenMfgEntDeclarationDetail />} />
          <Route path="/green-mfg/ent/dynamic/:id" element={<GreenMfgEntDynamicEdit />} />
          <Route path="/system" element={<System />} />
          <Route path="/system/users" element={<SystemUsers />} />
          <Route path="/system/permissions" element={<SystemPermissions />} />
          <Route path="/policy-agent" element={<PolicyAgent />} />
          <Route path="/green-mfg-agent" element={<GreenMfgAgent />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </RoleProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
