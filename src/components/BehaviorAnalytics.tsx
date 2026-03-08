import { motion } from "framer-motion";
import { AlertCircle, Bug, TestTube2, Clock, TrendingUp } from "lucide-react";

interface BehaviorMetrics {
  compile_errors?: number;
  debug_attempts?: number;
  test_runs?: number;
  time_to_first_code?: string;
  runAttempts?: number;
  compileErrors?: number;
  timeToFirstRun?: number;
  totalCodingTime?: number;
  linesOfCode?: number;
  codeChanges?: number;
  [key: string]: number | string | undefined;
}

interface AIBehaviorScores {
  problemSolving?: number;
  debuggingAbility?: number;
  codeQuality?: number;
  thinkingClarity?: number;
  overall?: number;
}

interface BehaviorAnalyticsProps {
  metrics: BehaviorMetrics;
  aiScores?: AIBehaviorScores;
  aiSummary?: string;
  isLoading?: boolean;
}

const metricsConfig = [
  {
    key: "runAttempts",
    fallbackKey: "debug_attempts",
    label: "Run Attempts",
    hint: "Times code was run",
    icon: TestTube2,
    color: "from-blue-500/20 to-blue-600/20",
    borderColor: "border-blue-500/30",
    textColor: "text-blue-600",
    bgColor: "bg-blue-500/10",
  },
  {
    key: "compileErrors",
    fallbackKey: "compile_errors",
    label: "Compile Errors",
    hint: "Failed compilations",
    icon: AlertCircle,
    color: "from-red-500/20 to-red-600/20",
    borderColor: "border-red-500/30",
    textColor: "text-red-600",
    bgColor: "bg-red-500/10",
  },
  {
    key: "timeToFirstRun",
    fallbackKey: "time_to_first_code",
    label: "Time to First Run",
    hint: "Seconds to first run",
    icon: Clock,
    color: "from-emerald-500/20 to-emerald-600/20",
    borderColor: "border-emerald-500/30",
    textColor: "text-emerald-600",
    bgColor: "bg-emerald-500/10",
  },
  {
    key: "totalCodingTime",
    label: "Total Coding Time",
    hint: "Session duration (sec)",
    icon: Clock,
    color: "from-blue-500/20 to-blue-600/20",
    borderColor: "border-blue-500/30",
    textColor: "text-blue-600",
    bgColor: "bg-blue-500/10",
  },
  {
    key: "linesOfCode",
    label: "Lines of Code",
    hint: "Non-empty, non-comment lines",
    icon: Bug,
    color: "from-violet-500/20 to-violet-600/20",
    borderColor: "border-violet-500/30",
    textColor: "text-violet-600",
    bgColor: "bg-violet-500/10",
  },
  {
    key: "codeChanges",
    label: "Code Changes",
    hint: "Total edit count",
    icon: TestTube2,
    color: "from-orange-500/20 to-orange-600/20",
    borderColor: "border-orange-500/30",
    textColor: "text-orange-600",
    bgColor: "bg-orange-500/10",
  },
];

export const BehaviorAnalytics = ({
  metrics,
  aiScores,
  aiSummary,
  isLoading = false,
}: BehaviorAnalyticsProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Behavior Analytics</h2>
        </div>
        <p className="text-muted-foreground">
          Key metrics from your coding interview performance
        </p>
      </motion.div>

      {/* Metrics Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {metricsConfig.map((config, index) => {
          const Icon = config.icon;
          const raw = metrics[config.key] ?? metrics[(config as { fallbackKey?: string }).fallbackKey as string];
          const value = raw ?? "—";
          const displayValue =
            config.key === "time_to_first_code" && typeof raw === "string"
              ? raw
              : config.key === "timeToFirstRun" && typeof raw === "number"
              ? `${Math.floor(raw / 60)}m ${raw % 60}s`
              : value;

          return (
            <motion.div
              key={config.key}
              variants={cardVariants}
              whileHover={{ scale: 1.02, translateY: -4 }}
              className={`relative overflow-hidden rounded-xl border-2 ${config.borderColor} p-6 glass transition-all duration-300`}
            >
              {/* Background gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${config.color} pointer-events-none`}
              />

              {/* Content */}
              <div className="relative z-10 flex flex-col gap-4">
                {/* Icon and Label */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      {config.label}
                    </p>
                  </div>
                  <div className={`p-2.5 rounded-lg ${config.bgColor}`}>
                    <Icon className={`w-5 h-5 ${config.textColor}`} />
                  </div>
                </div>

                {/* Value */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                  className="space-y-1"
                >
                  <p className="text-3xl font-black font-mono">
                    {isLoading ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      <span className={config.textColor}>{displayValue}</span>
                    )}
                  </p>
                  <div className="h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 rounded-full" />
                </motion.div>

                {/* Footer hint */}
                <p className="text-xs text-muted-foreground/60">
                  {config.hint ?? ""}
                </p>
              </div>

              {/* Hover accent */}
              <motion.div
                className="absolute inset-0 border-t border-white/10 pointer-events-none"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
              />
            </motion.div>
          );
        })}
      </motion.div>

      {/* Empty State */}
      {Object.keys(metrics).length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-8 rounded-xl bg-muted/20 border border-border/20 text-center"
        >
          <p className="text-muted-foreground">
            No metrics available. Complete a coding interview to see behavior analytics.
          </p>
        </motion.div>
      )}

      {/* AI Analysis Summary */}
      {aiSummary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-4 rounded-xl bg-primary/5 border border-primary/20"
        >
          <p className="text-sm font-semibold text-foreground mb-2">📋 AI Behavior Analysis</p>
          <p className="text-sm text-muted-foreground">{aiSummary}</p>
        </motion.div>
      )}

      {/* AI Scores */}
      {aiScores && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-3"
        >
          {[
            { key: "problemSolving", label: "Problem Solving" },
            { key: "debuggingAbility", label: "Debugging" },
            { key: "codeQuality", label: "Code Quality" },
            { key: "thinkingClarity", label: "Thinking Clarity" },
            { key: "overall", label: "Overall" },
          ].map(({ key, label }) => {
            const score = aiScores[key as keyof AIBehaviorScores] ?? 0;
            return (
              <div key={key} className="p-3 rounded-lg bg-muted/20 border">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-lg font-bold">{score}/100</p>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* Fallback Summary */}
      {Object.keys(metrics).length > 0 && !aiSummary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-4 rounded-xl bg-primary/5 border border-primary/20"
        >
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">💡 Insight:</span> Your coding patterns show{" "}
            {(metrics.compileErrors ?? metrics.compile_errors ?? 0) > 3
              ? "multiple debugging cycles. Focus on understanding requirements before coding."
              : "efficient problem-solving. Consider tackling more challenging problems."}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default BehaviorAnalytics;
