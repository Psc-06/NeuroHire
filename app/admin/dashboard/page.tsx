"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Copy, ExternalLink } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import Navbar from "@/components/ui/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import ResumeUploader, { CandidateRecord } from "../../../components/admin/ResumeUploader";

interface GeneratedCredentials {
  loginLink: string;
  directInterviewLink?: string;
  email: string;
  password: string;
  testId: string;
}

const CANDIDATES_STORAGE_KEY = "candidates";

const generateRandomPassword = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = Math.floor(Math.random() * 3) + 6;
  let output = "";

  for (let index = 0; index < length; index += 1) {
    output += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return output;
};

const getStoredCandidates = (): CandidateRecord[] => {
  try {
    const stored = localStorage.getItem(CANDIDATES_STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [generatedCredentials, setGeneratedCredentials] = useState<GeneratedCredentials | null>(null);

  useEffect(() => {
    if (localStorage.getItem("adminAuth") !== "true") {
      navigate("/admin/login", { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    navigate("/admin/login", { replace: true });
  };

  const handleGenerateCandidate = (payload: { resumeFile: File | null; candidateEmail: string }) => {
    if (!payload.resumeFile || !payload.candidateEmail) {
      return;
    }

    const testId = Math.random().toString(36).substring(2, 8);
    const password = generateRandomPassword();

    const candidateRecord: CandidateRecord = {
      testId,
      email: payload.candidateEmail,
      password,
      resumeFileName: payload.resumeFile.name,
      status: "pending",
    };

    const existingCandidates = getStoredCandidates();
    const candidateList = [...existingCandidates, candidateRecord];
    localStorage.setItem(CANDIDATES_STORAGE_KEY, JSON.stringify(candidateList));

    // Generate login link using current origin (works on any port/domain)
    const loginLink = `${window.location.origin}/candidate/login`;
    const directInterviewLink = `${window.location.origin}/interview`;

    setGeneratedCredentials({
      loginLink,
      directInterviewLink,
      email: payload.candidateEmail,
      password,
      testId,
    });
  };

  const handleCopyLoginDetails = async () => {
    if (!generatedCredentials) {
      return;
    }

    const textToCopy = [
      "Candidate Login Details",
      `Login Link: ${generatedCredentials.loginLink}`,
      `Email: ${generatedCredentials.email}`,
      `Password: ${generatedCredentials.password}`,
      `Test ID: ${generatedCredentials.testId}`,
      "",
      "Alternative (Direct Access):",
      `Direct Interview Link: ${generatedCredentials.directInterviewLink || window.location.origin + '/interview'}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(textToCopy);
      toast({
        title: "Copied!",
        description: "Candidate credentials copied to clipboard",
      });
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please copy manually",
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout>
      <Navbar onLogout={handleLogout} title="Admin Panel" showLinks={false} />
      
      <Container className="pt-32" size="md">
        <PageHeader
          title="NeuroHire Admin Panel"
          description="Upload candidate resumes and generate interview credentials"
          icon={
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500">
              <Shield className="w-8 h-8 text-white" />
            </div>
          }
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass border-glow">
            <CardHeader>
              <CardTitle>Upload Candidate Resume</CardTitle>
              <CardDescription>
                Upload resume details and generate secure candidate access credentials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-2">
                <ResumeUploader onGenerateCandidateAccess={handleGenerateCandidate} />
              </div>

          {generatedCredentials && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="mt-8"
                >
                  <Card className="border-indigo-500/50 bg-gray-900/80">
                    <CardHeader>
                      <CardTitle className="text-lg">Candidate Login Details</CardTitle>
                      <CardDescription>Share these credentials with the candidate</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="text-gray-400 font-medium mb-1">Secure Login Link</p>
                          <a
                            href={generatedCredentials.loginLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:text-indigo-300 underline flex items-center gap-1 break-all"
                          >
                            {generatedCredentials.loginLink}
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                        </div>
                        <div>
                          <p className="text-gray-400 font-medium">Email</p>
                          <p className="text-white">{generatedCredentials.email}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-medium">Password</p>
                          <p className="text-white font-mono">{generatedCredentials.password}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-medium">Test ID</p>
                          <p className="text-white font-mono">{generatedCredentials.testId}</p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-800">
                        <p className="text-xs text-gray-500 mb-2">Alternative (if candidate can't login):</p>
                        <div>
                          <p className="text-gray-400 font-medium text-sm mb-1">Direct Interview Link</p>
                          <a
                            href={generatedCredentials.directInterviewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:text-emerald-300 underline text-sm flex items-center gap-1 break-all"
                          >
                            {generatedCredentials.directInterviewLink}
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                        </div>
                      </div>

                      <Button
                        onClick={handleCopyLoginDetails}
                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy All Details
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
          )}
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </AppLayout>
  );
}