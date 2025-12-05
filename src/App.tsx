import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { OptionsProvider } from "@/context/OptionsContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { RestaurantProvider } from "@/context/RestaurantContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import CustomerView from "./pages/CustomerView";
import ManagerDashboard from "./pages/ManagerDashboard";
import ManagerLogin from "./pages/ManagerLogin";
import ManagerProfile from "./pages/ManagerProfile";
import NotFound from "./pages/NotFound";
import KitchenDisplay from "./pages/KitchenDisplay";
import { PaymentVerify } from "./pages/PaymentVerify";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <OptionsProvider>
      <RestaurantProvider>
        <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/:restaurantSlug/customer" element={<CustomerView />} />
            <Route path="/:restaurantSlug/manager" element={
              <ProtectedRoute requiredRole="manager">
                <ManagerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/customer" element={<CustomerView />} />
            <Route path="/manager/login" element={<ManagerLogin />} />
            <Route
              path="/manager/profile"
              element={
                <ProtectedRoute requiredRole="manager">
                  <ManagerProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager"
              element={
                <ProtectedRoute requiredRole="manager">
                  <ManagerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/kitchen"
              element={
                <ProtectedRoute requiredRole="kitchen">
                  <KitchenDisplay />
                </ProtectedRoute>
              }
            />
            <Route path="/payment/verify" element={<PaymentVerify />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
    </RestaurantProvider>
      </OptionsProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
