import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Clock, Activity, Hash, Terminal, Braces, Zap, ChevronRight, CheckCircle2, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AppLayout from "@/components/layout/AppLayout";
import Navbar from "@/components/ui/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CodingEnvironment from "@/components/CodingEnvironment";
import type { BehaviorMetrics } from "@/types/behavior";

// Multi-question coding interview questions
const codingQuestions = [
  {
    id: 1,
    title: "Two Sum",
    description: "Given an array of integers and a target sum, return the indices of two numbers that add up to the target.",
    examples: [
      { input: "[2,7,11,15], target=9", output: "[0,1]" },
      { input: "[3,2,4], target=6", output: "[1,2]" }
    ],
  },
  {
    id: 2,
    title: "Reverse String",
    description: "Write a function that reverses a string in-place. You must do this by modifying the input array directly with O(1) extra memory.",
    examples: [
      { input: '["h","e","l","l","o"]', output: '["o","l","l","e","h"]' },
      { input: '["H","a","n","n","a","h"]', output: '["h","a","n","n","a","H"]' }
    ],
  },
  {
    id: 3,
    title: "Find Maximum Number",
    description: "Write a function that returns the maximum number in an array. If the array is empty, return null.",
    examples: [
      { input: "[1, 5, 3, 9, 2]", output: "9" },
      { input: "[-10, -5, -3]", output: "-3" },
      { input: "[]", output: "null" }
    ],
  },
];

interface QuestionAnswer {
  questionId: number;
  questionTitle: string;
  code: string;
  language: "python" | "javascript";
  behaviorMetrics: BehaviorMetrics;
  timeSpent: number;
  timestamp: number;
}

const InterviewPage = () => {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  const [currentAnswerSaved, setCurrentAnswerSaved] = useState(false);
  const [startTime] = useState(Date.now());
    const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [behaviorMetrics, setBehaviorMetrics] = useState<BehaviorMetrics | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentCode, setCurrentCode] = useState("");
  const [currentLanguage, setCurrentLanguage] = useState<"python" | "javascript">("javascript");

  const currentQuestion = codingQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === codingQuestions.length - 1;
  const totalQuestions = codingQuestions.length;

  useEffect(() => {
    const interval = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const handleBehaviorMetricsUpdate = useCallback((metrics: BehaviorMetrics) => {
    setBehaviorMetrics(metrics);
  }, []);

  const handleCodeUpdate = useCallback((code: string) => {
    setCurrentCode(code);
    setCurrentAnswerSaved(false);
  }, []);

  const handleLanguageUpdate = useCallback((language: "python" | "javascript") => {
    setCurrentLanguage(language);
  }, []);

  const handleSaveAnswer = useCallback(() => {
    if (!currentCode.trim()) {
      alert("Please write some code before saving your answer.");
      return;
    }

    if (!behaviorMetrics) {
      alert("Unable to save - metrics not available.");
      return;
    }

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);

    const answer: QuestionAnswer = {
      questionId: currentQuestion.id,
      questionTitle: currentQuestion.title,
      code: currentCode,
      language: currentLanguage,
      behaviorMetrics: { ...behaviorMetrics },
      timeSpent,
      timestamp: Date.now(),
    };

    // Update or add answer for current question
    setAnswers((prev) => {
      const existingIndex = prev.findIndex((a) => a.questionId === currentQuestion.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = answer;
        return updated;
      }
      return [...prev, answer];
    });

    setCurrentAnswerSaved(true);
    alert(`Answer saved for Question ${currentQuestion.id}: ${currentQuestion.title}`);
  }, [currentCode, currentLanguage, behaviorMetrics, currentQuestion, questionStartTime]);

  const handleNextQuestion = useCallback(() => {
    if (!currentAnswerSaved) {
      const confirmProceed = window.confirm(
        "You haven't saved your answer for this question. Do you want to proceed to the next question anyway?"
      );
      if (!confirmProceed) {
        return;
      }
    }

    if (currentQuestionIndex < codingQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setCurrentAnswerSaved(false);
      setQuestionStartTime(Date.now());
      // Code will be cleared by CodingEnvironment key change
    }
  }, [currentQuestionIndex, currentAnswerSaved]);

  const handleSubmitTest = async () => {
    if (!currentAnswerSaved && currentCode.trim()) {
      const confirmSubmit = window.confirm(
        "You haven't saved your answer for the last question. Do you want to submit the test anyway?"
      );
      if (!confirmSubmit) {
        return;
      }
    }

    setIsSubmitting(true);
    const candidateData = JSON.parse(sessionStorage.getItem("candidateData") || "{}");
    const interviewId = candidateData.interviewId;

    if (!interviewId) {
      alert("Error: Missing interview data.");
      setIsSubmitting(false);
      return;
    }

    // Prepare final submission with all answers
    const finalSubmission = {
      candidateId: interviewId,
      totalQuestions: codingQuestions.length,
      answersSubmitted: answers.length,
      answers: answers,
      totalTimeSpent: elapsed,
      submittedAt: Date.now(),
      candidateInfo: {
        interviewId,
        email: candidateData.email || "unknown",
        submissionTime: new Date().toISOString(),
      },
    };

    try {
      // Submit all answers for AI analysis
      const response = await axios.post("/api/behavior/multi-question-logs", finalSubmission);

      if (response.data.success) {
        setIsSubmitted(true);
        setTimeout(() => navigate(`/analysis?interviewId=${interviewId}`), 2000);
      } else {
        alert(`Submission failed: ${response.data.message || "Unknown error"}`);
      }
    } catch (err: any) {
      console.error("Failed to submit:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to submit test";
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-16 rounded-3xl glass glow-box-lg"
          >
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="text-6xl mb-6 inline-block"
            >
              🧠
            </motion.div>
            <h1 className="text-3xl font-black mb-2 gradient-text">Test Submitted!</h1>
            <p className="text-muted-foreground">Analyzing all {answers.length} answers... Redirecting to analysis...</p>
            <motion.div
              className="mt-6 h-1 bg-primary/20 rounded-full overflow-hidden max-w-xs mx-auto"
            >
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2 }}
              />
            </motion.div>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  const m = behaviorMetrics;

  return (
    <AppLayout>
      <Navbar title="Coding Interview" />
      
      <div className="flex-1 pt-24 pb-8 px-6 max-w-7xl mx-auto w-full relative z-10">
                {/* Question Progress Bar */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-2xl glass"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold">
                      Question {currentQuestionIndex + 1} of {totalQuestions}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {answers.length} / {totalQuestions} answered
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {codingQuestions.map((q, idx) => {
                      const isAnswered = answers.some((a) => a.questionId === q.id);
                      const isCurrent = idx === currentQuestionIndex;
                      return (
                        <div
                          key={q.id}
                          className={`flex-1 h-2 rounded-full transition-all ${
                            isAnswered
                              ? "bg-green-500"
                              : isCurrent
                              ? "bg-blue-500 animate-pulse"
                              : "bg-muted/30"
                          }`}
                        />
                      );
                    })}
                  </div>
                </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Problem Description */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
                        key={currentQuestion.id}
            className="lg:col-span-1 p-6 rounded-2xl glass h-fit"
          >
            <div className="flex items-center gap-2 mb-4">
              <Braces size={16} className="text-secondary" />
              <span className="text-xs font-mono text-secondary uppercase tracking-wider">
                Problem {currentQuestionIndex + 1}
              </span>
            </div>
            <h2 className="text-lg font-bold mb-2">{currentQuestion.title}</h2>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{currentQuestion.description}</p>
            <div className="space-y-3">
              {currentQuestion.examples.map((ex, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="p-3 rounded-lg bg-muted/30 border border-border/30 font-mono text-xs"
                >
                  <p className="text-muted-foreground">Input: <span className="text-primary">{ex.input}</span></p>
                  <p className="text-muted-foreground">Output: <span className="text-secondary">{ex.output}</span></p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Coding Environment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            key={`editor-${currentQuestion.id}`}
            className="lg:col-span-2 flex flex-col gap-4"
          >
            <CodingEnvironment
              key={currentQuestion.id}
              challengeTitle={currentQuestion.title}
              challengeDescription={currentQuestion.description}
              onCodeChange={handleCodeUpdate}
              onLanguageChange={handleLanguageUpdate}
              onBehaviorMetricsUpdate={handleBehaviorMetricsUpdate}
              hideDefaultSubmit={true}
            />

            {/* Custom Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 items-center"
            >
              <Button
                onClick={handleSaveAnswer}
                disabled={isSubmitting}
                className={currentAnswerSaved ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}
                size="lg"
              >
                {currentAnswerSaved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Answer Saved
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Answer
                  </>
                )}
              </Button>

              {!isLastQuestion ? (
                <Button
                  onClick={handleNextQuestion}
                  disabled={isSubmitting}
                  className="bg-purple-600 hover:bg-purple-700"
                  size="lg"
                >
                  Next Question
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmitTest}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 font-bold"
                  size="lg"
                >
                  {isSubmitting ? "Submitting..." : "Submit Test"}
                  <Terminal className="w-4 h-4" />
                </Button>
              )}
            </motion.div>
          </motion.div>

          {/* Live Metrics */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1 p-6 rounded-2xl glass h-fit space-y-4"
          >
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Activity size={18} className="text-accent" /> Live Metrics
            </h2>
            {[
              { label: "Time Elapsed", value: formatTime(elapsed), icon: Clock },
              { label: "Code Changes", value: m?.codeChanges ?? 0, icon: Hash },
              { label: "Run Attempts", value: m?.runAttempts ?? 0, icon: Terminal },
              { label: "Compile Errors", value: m?.compileErrors ?? 0, icon: Zap },
              { label: "Lines of Code", value: m?.linesOfCode ?? 0, icon: Braces },
            ].map((metric) => (
              <motion.div
                key={metric.label}
                whileHover={{ scale: 1.02 }}
                className="p-4 rounded-xl bg-muted/20 border border-border/20 hover:border-primary/20 transition-colors"
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1 font-medium">
                  <metric.icon size={12} /> {metric.label}
                </div>
                <p className="text-2xl font-black font-mono">{metric.value}</p>
              </motion.div>
            ))}
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-xs text-muted-foreground/60">
                🔍 These metrics are tracked in real-time and used in the AI behavior analysis report.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
};

export default InterviewPage;
