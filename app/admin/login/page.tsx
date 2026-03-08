"use client";

import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import FormField from "@/components/ui/FormField";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Clear form on component mount to ensure fresh login every time
  useEffect(() => {
    setUsername("");
    setPassword("");
    setError("");
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (username === "admin" && password === "admin") {
      localStorage.setItem("adminAuth", "true");
      setError("");
      navigate("/admin/dashboard", { replace: true });
      return;
    }

    setError("Invalid admin credentials");
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
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 mb-4"
            >
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-black text-white mb-2">NeuroHire Admin Panel</h1>
            <p className="text-gray-400">Behavior-Based Hiring Analytics Platform</p>
          </div>

          <Card className="glass border-glow">
            <CardHeader>
              <CardTitle>Admin Login</CardTitle>
              <CardDescription>Enter your credentials to access the admin panel</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <FormField label="Username" htmlFor="admin-username" error={error ? " " : undefined}>
                  <Input
                    id="admin-username"
                    type="text"
                    value={username}
                    onChange={(event) => {
                      setUsername(event.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Enter username"
                    autoComplete="username"
                    className="bg-gray-900/50 border-gray-700 text-white"
                  />
                </FormField>

                <FormField label="Password" htmlFor="admin-password">
                  <Input
                    id="admin-password"
                    type="password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Enter password"
                    autoComplete="current-password"
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
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                  size="lg"
                >
                  Admin Login
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}