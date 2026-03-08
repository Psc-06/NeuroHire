"use client";

import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserCheck } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import FormField from "@/components/ui/FormField";

interface CandidateRecord {
  testId: string;
  email: string;
  password: string;
  resumeFileName: string;
  status: "pending";
}

const CANDIDATES_STORAGE_KEY = "candidates";
const CANDIDATE_SESSION_KEY = "candidateSession";

const getCandidateRecords = (): CandidateRecord[] => {
  try {
    const stored = localStorage.getItem(CANDIDATES_STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export default function CandidateLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Clear form and errors on component mount to ensure fresh login every time
  useEffect(() => {
    setEmail("");
    setPassword("");
    setError("");
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const records = getCandidateRecords();
    const matched = records.find(
      (record) => record.email.toLowerCase() === email.trim().toLowerCase() && record.password === password,
    );

    if (!matched) {
      setError("Invalid credentials");
      return;
    }

    localStorage.setItem(CANDIDATE_SESSION_KEY, matched.testId);
    sessionStorage.setItem(
      "candidateData",
      JSON.stringify({
        interviewId: matched.testId,
        testId: matched.testId,
        email: matched.email,
        challenge: "non-repeating-char",
        skills: [],
      }),
    );

    setError("");
    navigate(`/candidate/test/${matched.testId}`, { replace: true });
  };

  return (
    <AppLayout>
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 mb-4"
            >
              <UserCheck className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-black text-white mb-2">Candidate Portal</h1>
            <p className="text-gray-400">Sign in to start your coding test</p>
          </div>

          <Card className="glass border-glow">
            <CardHeader>
              <CardTitle>Welcome to NeuroHire</CardTitle>
              <CardDescription>Enter your credentials to begin the assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <FormField label="Email" htmlFor="candidate-email" error={error ? " " : undefined}>
                  <Input
                    id="candidate-email"
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (error) setError("");
                    }}
                    placeholder="your.email@example.com"
                    autoComplete="email"
                    required
                    className="bg-gray-900/50 border-gray-700 text-white"
                  />
                </FormField>

                <FormField label="Password" htmlFor="candidate-password">
                  <Input
                    id="candidate-password"
                    type="password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    className="bg-gray-900/50 border-gray-700 text-white"
                  />
                </FormField>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-400"
                  >
                    {error}
                  </motion.p>
                )}

                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                  size="lg"
                >
                  Start Test
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-800">
                <p className="text-xs text-gray-500 text-center mb-3">
                  Don't have credentials?
                </p>
                <Button
                  type="button"
                  onClick={() => navigate("/interview")}
                  variant="outline"
                  className="w-full"
                >
                  Skip to Interview Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}