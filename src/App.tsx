import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import InterviewPage from "./pages/Interview";
import AnalysisPage from "./pages/Analysis";
import RecruiterLogin from "./pages/RecruiterLogin";
import CandidateLogin from "./pages/CandidateLogin";
import CreateTest from "./pages/CreateTest";
import TestInstructions from "./pages/TestInstructions";
import NotFound from "./pages/NotFound";
import AdminLoginPage from "../app/admin/login/page";
import AdminDashboardPage from "../app/admin/dashboard/page";
import CandidateLoginPage from "../app/candidate/login/page";
import CandidateTestPage from "../app/candidate/test/[testId]/page";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/interview" element={<InterviewPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          
          {/* Recruiter Routes */}
          <Route path="/recruiter-login" element={<RecruiterLogin />} />
          <Route path="/create-test" element={<CreateTest />} />
          
          {/* Candidate Routes */}
          <Route path="/candidate-login" element={<CandidateLogin />} />
          <Route path="/test-instructions" element={<TestInstructions />} />
          <Route path="/candidate/login" element={<CandidateLoginPage />} />
          <Route path="/candidate/test/:testId" element={<CandidateTestPage />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
