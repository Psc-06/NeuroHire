import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, UserPlus, Mail, FileText, Hash, Zap, Loader2 } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import Container from "@/components/ui/Container";
import Navbar from "@/components/ui/Navbar";
import axios from "axios";

const challenges = [
  { id: "non-repeating-char", title: "First Non-Repeating Character", difficulty: "Easy" },
  { id: "two-sum", title: "Two Sum", difficulty: "Easy" },
  { id: "palindrome", title: "Valid Palindrome", difficulty: "Easy" },
  { id: "fizzbuzz", title: "FizzBuzz", difficulty: "Easy" },
];

const CreateTest = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    challenge: "non-repeating-char",
    difficulty: "Easy",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Generate test ID and credentials
      const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const password = Math.random().toString(36).slice(-8);

      // Create test via backend
      const response = await axios.post("/api/recruiter/create-test", {
        testId,
        name: formData.name,
        email: formData.email,
        password,
        challenge: formData.challenge,
        difficulty: formData.difficulty,
        status: "Pending",
        createdAt: new Date().toISOString(),
      });

      if (response.data.success) {
        toast({
          title: "Test Created Successfully!",
          description: `Candidate ${formData.name} has been invited`,
        });

        // Show credentials modal or copy to clipboard
        const credentials = `
Test Link: ${window.location.origin}/candidate-login?testId=${testId}
Email: ${formData.email}
Password: ${password}
        `;

        // Copy to clipboard
        navigator.clipboard.writeText(credentials);

        toast({
          title: "Credentials Copied!",
          description: "Share these with the candidate via email",
        });

        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      }
    } catch (error: any) {
      toast({
        title: "Failed to Create Test",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <Navbar title="Create Test" />
      <div className="fixed inset-0 dot-bg pointer-events-none opacity-20" />

      <Container className="pt-24 pb-16 relative z-10" size="md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>

            <h1 className="text-4xl font-black mb-3">
              Create Candidate Test
            </h1>
            <p className="text-muted-foreground text-lg">
              Generate a unique coding assessment for your candidate
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass border-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-500" />
                  Candidate Information
                </CardTitle>
                <CardDescription>
                  Enter the candidate's details and select the challenge
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Candidate Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Candidate Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g., Rahul Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="bg-background/50"
                    />
                  </div>

                  {/* Candidate Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Candidate Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="rahul@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="bg-background/50"
                    />
                  </div>

                  {/* Challenge Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="challenge" className="flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      Coding Challenge
                    </Label>
                    <Select
                      value={formData.challenge}
                      onValueChange={(value) => setFormData({ ...formData, challenge: value })}
                    >
                      <SelectTrigger className="bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {challenges.map((challenge) => (
                          <SelectItem key={challenge.id} value={challenge.id}>
                            {challenge.title} ({challenge.difficulty})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Difficulty */}
                  <div className="space-y-2">
                    <Label htmlFor="difficulty" className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Difficulty Level
                    </Label>
                    <Select
                      value={formData.difficulty}
                      onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                    >
                      <SelectTrigger className="bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Info Box */}
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <p className="text-sm text-muted-foreground">
                      <strong>Note:</strong> After creating the test, unique credentials will be generated automatically. 
                      Share the test link, email, and password with the candidate.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Test...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Generate Candidate Test
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Preview Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6"
          >
            <Card className="glass border-glow">
              <CardHeader>
                <CardTitle className="text-sm">Preview</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2 text-muted-foreground">
                <p>The candidate will receive:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Unique test link with their Test ID</li>
                  <li>Auto-generated secure password</li>
                  <li>Challenge: {challenges.find(c => c.id === formData.challenge)?.title}</li>
                  <li>Difficulty: {formData.difficulty}</li>
                  <li>Time limit: 45 minutes</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
      </Container>
    </AppLayout>
  );
};

export default CreateTest;
