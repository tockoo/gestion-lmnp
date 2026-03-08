import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { initDemoData } from "./lib/store";
import Dashboard from "./pages/Dashboard";
import Properties from "./pages/Properties";
import Tenants from "./pages/Tenants";
import Receipts from "./pages/Receipts";
import Expenses from "./pages/Expenses";
import TaxSummary from "./pages/TaxSummary";
import SettingsPage from "./pages/Settings";
import NotFound from "./pages/NotFound";

// Initialize demo data on first launch
initDemoData();

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/biens" element={<Properties />} />
            <Route path="/locataires" element={<Tenants />} />
            <Route path="/quittances" element={<Receipts />} />
            <Route path="/depenses" element={<Expenses />} />
            <Route path="/recap" element={<TaxSummary />} />
            <Route path="/parametres" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
