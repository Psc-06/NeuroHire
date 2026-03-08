import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import FormField from "@/components/ui/FormField";
import { useToast } from "@/hooks/use-toast";
import { LogIn, Shield } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";

const RecruiterLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock authentication for hackathon
    setTimeout(() => {
      if (email === "admin@neurohire.ai" && password === "admin123") {
        sessionStorage.setItem("recruiterAuth", JSON.stringify({ email, role: "recruiter" }));
        toast({
          title: "Login Successful",
          description: "Welcome back to NeuroHire!",
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid credentials. Try admin@neurohire.ai / admin123",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
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
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mb-4"
          >
            <Shield className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-black mb-2">Recruiter Portal</h1>
          <p className="text-muted-foreground">Sign in to access candidate evaluations</p>
        </div>

        <Card className="glass border-glow">
          <CardHeader>
            <CardTitle>Login to NeuroHire</CardTitle>
            <CardDescription>Enter your credentials to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@neurohire.ai"
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
                  placeholder="Enter your password"
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
                  <>Loading...</>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Login as Recruiter
                  </>
                )}
              </Button>

              <div className="text-xs text-center text-muted-foreground pt-2">
                <p>Demo credentials:</p>
                <p className="font-mono">admin@neurohire.ai / admin123</p>
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

export default RecruiterLogin;
