import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Editor from "@monaco-editor/react";
import { Play, Send, Loader2, CheckCircle, AlertCircle, Clock } from "lucide-react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import type { BehaviorMetrics } from "@/types/behavior";

const DEFAULT_PYTHON_CODE = `def solve(input_data):
    # Write your solution here
    pass

# Test code
if __name__ == "__main__":
    result = solve("test")
    print(result)
`;

const DEFAULT_JAVASCRIPT_CODE = `function solve(inputData) {
  // Write your solution here
  
}

// Test code
const result = solve("test");
console.log(result);
`;

interface ExecutionResult {
  success: boolean;
  tests_passed?: number;
  tests_failed?: number;
  execution_time?: string;
  output?: string;
  error?: string;
  message?: string;
}

interface CodingEnvironmentProps {
  challengeTitle?: string;
  challengeDescription?: string;
  onCodeChange?: (code: string) => void;
  onSubmit?: (code: string, behaviorMetrics: BehaviorMetrics, language: "python" | "javascript") => void;
  onBehaviorMetricsUpdate?: (metrics: BehaviorMetrics) => void;
}

function countLinesOfCode(code: string): number {
  return code
    .split("\n")
    .filter((line) => line.trim().length > 0 && !line.trim().startsWith("//") && !line.trim().startsWith("#"))
    .length;
}

const createInitialMetrics = (): BehaviorMetrics => ({
  runAttempts: 0,
  compileErrors: 0,
  timeToFirstRun: 0,
  totalCodingTime: 0,
  linesOfCode: 0,
  codeChanges: 0,
});

export const CodingEnvironment = ({
  challengeTitle = "Coding Challenge",
  challengeDescription = "Write your solution to the coding challenge",
  onCodeChange,
  onSubmit,
  onBehaviorMetricsUpdate,
}: CodingEnvironmentProps) => {
  const { toast } = useToast();
  const [language, setLanguage] = useState<"python" | "javascript">("javascript");
  const [code, setCode] = useState(language === "python" ? DEFAULT_PYTHON_CODE : DEFAULT_JAVASCRIPT_CODE);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sessionStartRef = useRef(Date.now());
  const firstRunTimeRef = useRef<number | null>(null);
  const codeChangeCounterRef = useRef(0);

  const [behaviorMetrics, setBehaviorMetrics] = useState<BehaviorMetrics>(createInitialMetrics);

  const updateMetrics = useCallback(
    (updates: Partial<BehaviorMetrics>) => {
      setBehaviorMetrics((prev) => {
        return { ...prev, ...updates };
      });
    },
    []
  );

  // Notify parent of metrics changes via effect, not during state setter
  const notifyMetricsChange = useCallback(() => {
    onBehaviorMetricsUpdate?.(behaviorMetrics);
  }, [behaviorMetrics, onBehaviorMetricsUpdate]);

  useEffect(() => {
    notifyMetricsChange();
  }, [notifyMetricsChange]);

  const handleLanguageChange = (newLanguage: "python" | "javascript") => {
    setLanguage(newLanguage);
    const defaultCode = newLanguage === "python" ? DEFAULT_PYTHON_CODE : DEFAULT_JAVASCRIPT_CODE;
    setCode(defaultCode);
    setResult(null);
    updateMetrics({
      linesOfCode: countLinesOfCode(defaultCode),
      codeChanges: 0,
    });
    codeChangeCounterRef.current = 0;
    onCodeChange?.(defaultCode);
  };

  const handleCodeChange = useCallback(
    (value: string | undefined) => {
      if (value !== undefined) {
        setCode(value);
        codeChangeCounterRef.current += 1;
        updateMetrics({
          codeChanges: codeChangeCounterRef.current,
          linesOfCode: countLinesOfCode(value),
        });
        onCodeChange?.(value);
      }
    },
    [onCodeChange, updateMetrics]
  );

  const handleRunCode = async () => {
    if (!code.trim()) {
      toast({
        title: "Empty Code",
        description: "Please write some code before running",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    setResult(null);

    const now = Date.now();
    const runAttempts = behaviorMetrics.runAttempts + 1;
    if (firstRunTimeRef.current === null) {
      firstRunTimeRef.current = now;
      updateMetrics({
        runAttempts,
        timeToFirstRun: Math.floor((now - sessionStartRef.current) / 1000),
      });
    } else {
      updateMetrics({ runAttempts });
    }

    try {
      const response = await axios.post<ExecutionResult>("/api/run-code", {
        language,
        code,
      });

      if (response.data.success) {
        setResult(response.data);
        updateMetrics({
          totalCodingTime: Math.floor((Date.now() - sessionStartRef.current) / 1000),
        });
        toast({
          title: "Code Executed",
          description: `Tests passed: ${response.data.tests_passed}, Failed: ${response.data.tests_failed}`,
        });
      } else {
        throw new Error(response.data.message || "Execution failed");
      }
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : "Failed to run code";

      setResult({
        success: false,
        error: errorMessage,
      });

      updateMetrics({
        compileErrors: behaviorMetrics.compileErrors + 1,
        totalCodingTime: Math.floor((Date.now() - sessionStartRef.current) / 1000),
      });

      toast({
        title: "Execution Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitSolution = async () => {
    if (!code.trim()) {
      toast({
        title: "Empty Code",
        description: "Please write some code before submitting",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const finalMetrics: BehaviorMetrics = {
      ...behaviorMetrics,
      totalCodingTime: Math.floor((Date.now() - sessionStartRef.current) / 1000),
      linesOfCode: countLinesOfCode(code),
    };

    try {
      const response = await axios.post<ExecutionResult>("/api/run-code", {
        language,
        code,
        submit: true,
      });

      if (response.data.success) {
        setResult(response.data);
        toast({
          title: "Solution Submitted",
          description: "Your solution has been evaluated",
        });
        onSubmit?.(code, finalMetrics, language);
      } else {
        throw new Error(response.data.message || "Submission failed");
      }
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : "Failed to submit solution";

      setResult({
        success: false,
        error: errorMessage,
      });

      updateMetrics({
        compileErrors: behaviorMetrics.compileErrors + 1,
      });

      toast({
        title: "Submission Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Challenge Info */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h2 className="text-2xl font-bold">{challengeTitle}</h2>
        <p className="text-muted-foreground">{challengeDescription}</p>
      </motion.div>

      {/* Language Selector */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-3"
      >
        <span className="text-sm font-medium text-muted-foreground">Language:</span>
        <div className="flex gap-2">
          {(["javascript", "python"] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                language === lang
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
              }`}
            >
              {lang === "javascript" ? "JavaScript" : "Python"}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Editor Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="flex-1 border border-border rounded-lg overflow-hidden bg-secondary/30"
      >
        <Editor
          height="100%"
          language={language === "python" ? "python" : "javascript"}
          value={code}
          onChange={handleCodeChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'Fira Code', 'Monaco', monospace",
            lineNumbers: "on",
            wordWrap: "on",
            automaticLayout: true,
            tabSize: 2,
            scrollBeyondLastLine: false,
          }}
        />
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex gap-3"
      >
        <button
          onClick={handleRunCode}
          disabled={isRunning || isSubmitting}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-medium rounded-lg transition-colors"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Run Code
            </>
          )}
        </button>

        <button
          onClick={handleSubmitSolution}
          disabled={isRunning || isSubmitting}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white font-medium rounded-lg transition-colors"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit Solution
            </>
          )}
        </button>
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-6 rounded-lg border-2 ${
              result.success
                ? "bg-green-500/10 border-green-500/30"
                : "bg-red-500/10 border-red-500/30"
            }`}
          >
            <div className="flex items-start gap-3">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}

              <div className="flex-1 space-y-3">
                <h4 className={`font-semibold ${result.success ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
                  {result.success ? "Execution Successful" : "Execution Failed"}
                </h4>

                {result.success && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Tests Passed</p>
                      <p className="text-xl font-bold text-green-600">{result.tests_passed}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Tests Failed</p>
                      <p className="text-xl font-bold text-red-600">{result.tests_failed}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Execution Time</p>
                      <p className="text-xl font-bold text-blue-600 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {result.execution_time}
                      </p>
                    </div>
                  </div>
                )}

                {result.output && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Output:</p>
                    <div className="bg-black/20 p-3 rounded text-sm font-mono whitespace-pre-wrap break-words max-h-40 overflow-y-auto">
                      {result.output}
                    </div>
                  </div>
                )}

                {result.error && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Error:</p>
                    <div className="bg-black/20 p-3 rounded text-sm font-mono text-red-400 whitespace-pre-wrap break-words max-h-40 overflow-y-auto">
                      {result.error}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setResult(null)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CodingEnvironment;
