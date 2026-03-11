import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import GoalChat from "./pages/GoalChat";
import GoalFinalize from "./pages/GoalFinalize";
import GoalDetailPage from "./pages/GoalDetailPage";
import SharedGoalPage from "./pages/SharedGoalPage";
import PublicGoals from "./pages/PublicGoals";
import AdminSettings from "./pages/AdminSettings";
import UserSettings from "./pages/UserSettings";
import PaymentSuccess from "./pages/PaymentSuccess";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthCallback from "./pages/AuthCallback";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/goal/new"
              element={
                <ProtectedRoute>
                  <GoalChat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/goal/finalize"
              element={
                <ProtectedRoute>
                  <GoalFinalize />
                </ProtectedRoute>
              }
            />
            <Route
              path="/goal/:id"
              element={
                <ProtectedRoute>
                  <GoalDetailPage />
                </ProtectedRoute>
              }
            />
            <Route path="/shared/:slug" element={<SharedGoalPage />} />
            <Route
              path="/explore"
              element={
                <ProtectedRoute>
                  <PublicGoals />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment-success"
              element={
                <ProtectedRoute>
                  <PaymentSuccess />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <UserSettings />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
