import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  Clock,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Code2,
  PlayCircle,
  Info,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import Navbar from "@/components/ui/Navbar";
import Container from "@/components/ui/Container";

const TestInstructions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [testId, setTestId] = useState<string | null>(null);
  const [candidateName, setCandidateName] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [readInstructions, setReadInstructions] = useState(false);

  useEffect(() => {
    const id = searchParams.get("testId");
    const candidateData = sessionStorage.getItem("candidateAuth");
    
    if (!candidateData) {
      toast({
        title: "Authentication Required",
        description: "Please login first",
        variant: "destructive",
      });
      navigate("/candidate-login");
      return;
    }

    const data = JSON.parse(candidateData);
    setTestId(id || data.testId);
    setCandidateName(data.name || "Candidate");
  }, [searchParams, navigate, toast]);

  const handleStartTest = () => {
    if (!agreedToTerms || !readInstructions) {
      toast({
        title: "Please acknowledge all conditions",
        description: "You must read instructions and agree to the terms",
        variant: "destructive",
      });
      return;
    }

    // Navigate to the actual interview page
    navigate("/interview");
  };

  return (
    <AppLayout>
      <Navbar title="Test Instructions" />
      <div className="fixed inset-0 dot-bg pointer-events-none opacity-20" />

      <Container className="pt-24 pb-16 relative z-10" size="md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-black mb-3">
              Welcome, {candidateName}!
            </h1>
            <p className="text-muted-foreground text-lg">
              Please read the following instructions carefully before starting your coding assessment
            </p>
          </motion.div>

          <div className="space-y-6">
            {/* Important Notice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Alert className="border-yellow-500/50 bg-yellow-500/10">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <AlertDescription className="text-base">
                  <strong>Important:</strong> All activity during this test is monitored and analyzed.
                  This includes typing patterns, code execution attempts, and problem-solving behavior.
                </AlertDescription>
              </Alert>
            </motion.div>

            {/* Instructions Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass border-glow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-500" />
                    Test Guidelines
                  </CardTitle>
                  <CardDescription>
                    Follow these rules to ensure a fair evaluation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex gap-3 p-4 rounded-lg bg-background/50">
                      <Clock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold mb-1">Time Limit</h3>
                        <p className="text-sm text-muted-foreground">
                          You have 45 minutes to complete the coding challenge. Time starts when you begin.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 p-4 rounded-lg bg-background/50">
                      <Code2 className="w-5 h-5 text-purple-500 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold mb-1">Language Support</h3>
                        <p className="text-sm text-muted-foreground">
                          Choose between JavaScript or Python. Code editor includes syntax highlighting.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 p-4 rounded-lg bg-background/50">
                      <Eye className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold mb-1">Behavior Tracking</h3>
                        <p className="text-sm text-muted-foreground">
                          We track typing speed, code edits, debugging attempts, and thinking patterns.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 p-4 rounded-lg bg-background/50">
                      <PlayCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold mb-1">Run & Test</h3>
                        <p className="text-sm text-muted-foreground">
                          You can run your code multiple times. Each attempt is recorded for analysis.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-6 space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Shield className="w-5 h-5 text-red-500" />
                      Prohibited Activities
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground ml-7">
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-1">✗</span>
                        <span>No copy-pasting code from external sources</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-1">✗</span>
                        <span>No switching tabs or using other applications</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-1">✗</span>
                        <span>No external help or AI assistance tools</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-1">✗</span>
                        <span>No communication with others during the test</span>
                      </li>
                    </ul>
                  </div>

                  <div className="border-t border-border pt-6 space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      What We Evaluate
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3 text-sm ml-7">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Problem-solving approach</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Code quality & structure</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Debugging ability</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Thinking clarity & speed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Persistence & adaptability</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Coding behavior patterns</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Agreement Checkboxes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="glass border-glow">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="instructions"
                      checked={readInstructions}
                      onCheckedChange={(checked) => setReadInstructions(checked as boolean)}
                    />
                    <label
                      htmlFor="instructions"
                      className="text-sm cursor-pointer leading-relaxed"
                    >
                      I have read and understood all the instructions above
                    </label>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="terms"
                      checked={agreedToTerms}
                      onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm cursor-pointer leading-relaxed"
                    >
                      I agree to the terms and confirm that all work will be my own without external assistance
                    </label>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Start Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center pt-4"
            >
              <Button
                size="lg"
                onClick={handleStartTest}
                disabled={!agreedToTerms || !readInstructions}
                className="px-8 py-6 text-lg"
              >
                <PlayCircle className="w-5 h-5 mr-2" />
                Start Coding Test
              </Button>
            </motion.div>
          </div>
      </Container>
    </AppLayout>
  );
};

export default TestInstructions;
