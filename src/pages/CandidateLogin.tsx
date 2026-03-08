import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import FormField from "@/components/ui/FormField";
import { useToast } from "@/hooks/use-toast";
import { LogIn, UserCheck } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import axios from "axios";

const CandidateLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [testId, setTestId] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get("testId");
    if (id) {
      setTestId(id);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Verify credentials with backend
      const response = await axios.post("/api/candidate/login", {
        email,
        password,
        testId,
      });

      if (response.data.success) {
        const candidateData = response.data.candidate;
        sessionStorage.setItem("candidateAuth", JSON.stringify(candidateData));
        
        toast({
          title: "Login Successful",
          description: "Welcome to your coding test!",
        });
        
        navigate(`/test-instructions?testId=${candidateData.testId}`);
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.response?.data?.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
          <h1 className="text-3xl font-black mb-2">Candidate Portal</h1>
          <p className="text-muted-foreground">Login to start your coding assessment</p>
        </div>

        <Card className="glass border-glow">
          <CardHeader>
            <CardTitle>Welcome to NeuroHire</CardTitle>
            <CardDescription>
              {testId ? `Test ID: ${testId.slice(0, 8)}...` : "Enter your credentials to begin"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your test password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background/50"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>Verifying...</>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Start Coding Test
                  </>
                )}
              </Button>

              <div className="text-xs text-center text-muted-foreground pt-2 space-y-1">
                <p>Your credentials were sent via email</p>
                {testId && <p className="text-emerald-500">Test invitation link detected ✓</p>}
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-sm"
          >
            Back to Home
          </Button>
        </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default CandidateLogin;
