import { motion } from "framer-motion";
import { Zap, Brain, Wrench, FileCheck, BarChart3 } from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface CandidateReportData {
  technical_score: number;
  problem_solving: number;
  debugging: number;
  resume_authenticity: number;
  summary: string;
}

interface CandidateReportProps {
  data: CandidateReportData;
  candidateName?: string;
  isLoading?: boolean;
}

const getScoreColor = (score: number): string => {
  if (score >= 8.5) return "text-green-600";
  if (score >= 7.5) return "text-emerald-600";
  if (score >= 6.5) return "text-yellow-600";
  if (score >= 5.5) return "text-orange-600";
  return "text-red-600";
};

const getScoreBgColor = (score: number): string => {
  if (score >= 8.5) return "bg-green-500/10 border-green-500/30";
  if (score >= 7.5) return "bg-emerald-500/10 border-emerald-500/30";
  if (score >= 6.5) return "bg-yellow-500/10 border-yellow-500/30";
  if (score >= 5.5) return "bg-orange-500/10 border-orange-500/30";
  return "bg-red-500/10 border-red-500/30";
};

const getAuthenticityColor = (authenticity: number): string => {
  if (authenticity >= 0.8) return "text-green-600";
  if (authenticity >= 0.7) return "text-emerald-600";
  if (authenticity >= 0.6) return "text-yellow-600";
  if (authenticity >= 0.5) return "text-orange-600";
  return "text-red-600";
};

const getAuthenticityBgColor = (authenticity: number): string => {
  if (authenticity >= 0.8) return "bg-green-500/10 border-green-500/30";
  if (authenticity >= 0.7) return "bg-emerald-500/10 border-emerald-500/30";
  if (authenticity >= 0.6) return "bg-yellow-500/10 border-yellow-500/30";
  if (authenticity >= 0.5) return "bg-orange-500/10 border-orange-500/30";
  return "bg-red-500/10 border-red-500/30";
};

const metricsConfig = [
  {
    key: "technical_score",
    label: "Technical Score",
    icon: Zap,
    color: "from-blue-500/20 to-blue-600/20",
    borderColor: "border-blue-500/30",
    textColor: "text-blue-600",
    bgColor: "bg-blue-500/10",
  },
  {
    key: "problem_solving",
    label: "Problem Solving",
    icon: Brain,
    color: "from-purple-500/20 to-purple-600/20",
    borderColor: "border-purple-500/30",
    textColor: "text-purple-600",
    bgColor: "bg-purple-500/10",
  },
  {
    key: "debugging",
    label: "Debugging",
    icon: Wrench,
    color: "from-orange-500/20 to-orange-600/20",
    borderColor: "border-orange-500/30",
    textColor: "text-orange-600",
    bgColor: "bg-orange-500/10",
  },
  {
    key: "resume_authenticity",
    label: "Resume Authenticity",
    icon: FileCheck,
    color: "from-emerald-500/20 to-emerald-600/20",
    borderColor: "border-emerald-500/30",
    textColor: "text-emerald-600",
    bgColor: "bg-emerald-500/10",
  },
];

export const CandidateReport = ({
  data,
  candidateName = "Candidate",
  isLoading = false,
}: CandidateReportProps) => {
  // Prepare radar chart data
  const radarData = [
    {
      metric: "Technical",
      score: data.technical_score * 10,
      fullMark: 100,
    },
    {
      metric: "Problem Solving",
      score: data.problem_solving * 10,
      fullMark: 100,
    },
    {
      metric: "Debugging",
      score: data.debugging * 10,
      fullMark: 100,
    },
    {
      metric: "Authenticity",
      score: data.resume_authenticity * 100,
      fullMark: 100,
    },
  ];

  // Calculate overall score
  const overallScore = (
    (data.technical_score +
      data.problem_solving +
      data.debugging +
      data.resume_authenticity * 10) /
    40
  ).toFixed(1);

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
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-8 rounded-xl bg-muted/20 border border-border/20 text-center"
        >
          <p className="text-muted-foreground">Loading candidate report...</p>
        </motion.div>
      </div>
    );
  }

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
          <BarChart3 className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Candidate Intelligence Report</h2>
        </div>
        <p className="text-muted-foreground">
          Comprehensive assessment of {candidateName}
        </p>
      </motion.div>

      {/* Overall Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="p-8 rounded-2xl glass border border-border/30 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between flex-col md:flex-row gap-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Overall Assessment Score
            </p>
            <h3 className="text-4xl md:text-5xl font-black gradient-text">
              {overallScore}/10
            </h3>
            <p className="text-muted-foreground mt-2 text-sm">
              {overallScore >= 8
                ? "Excellent candidate - Highly recommended"
                : overallScore >= 7
                  ? "Strong candidate - Recommended for interview"
                  : overallScore >= 6
                    ? "Good candidate - Worth considering"
                    : "Fair candidate - May need further evaluation"}
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
          >
            <p className="text-2xl font-black text-primary-foreground">
              {overallScore}
            </p>
          </motion.div>
        </div>
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
          const value =
            config.key === "resume_authenticity"
              ? data[config.key as keyof CandidateReportData]
              : data[config.key as keyof CandidateReportData];
          const displayValue =
            config.key === "resume_authenticity"
              ? ((value as number) * 100).toFixed(0)
              : value.toFixed(1);
          const scoreColor =
            config.key === "resume_authenticity"
              ? getAuthenticityColor(value as number)
              : getScoreColor(value as number);
          const scoreBgColor =
            config.key === "resume_authenticity"
              ? getAuthenticityBgColor(value as number)
              : getScoreBgColor(value as number);

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
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {config.label}
                    </p>
                  </div>
                  <div className={`p-2.5 rounded-lg ${config.bgColor}`}>
                    <Icon className={`w-5 h-5 ${config.textColor}`} />
                  </div>
                </div>

                {/* Score Value */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                  className="space-y-2"
                >
                  <div className="flex items-baseline gap-1">
                    <p className={`text-3xl font-black font-mono ${scoreColor}`}>
                      {displayValue}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {config.key === "resume_authenticity" ? "%" : "/10"}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full bg-gradient-to-r ${
                        config.key === "resume_authenticity"
                          ? `from-emerald-500 to-emerald-600`
                          : `from-${
                              config.key === "technical_score"
                                ? "blue"
                                : config.key === "problem_solving"
                                  ? "purple"
                                  : "orange"
                            }-500 to-${
                              config.key === "technical_score"
                                ? "blue"
                                : config.key === "problem_solving"
                                  ? "purple"
                                  : "orange"
                            }-600`
                      }`}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${
                          config.key === "resume_authenticity"
                            ? (value as number) * 100
                            : (value as number) * 10
                        }%`,
                      }}
                      transition={{
                        delay: 0.4 + index * 0.1,
                        duration: 0.8,
                        ease: "easeOut",
                      }}
                    />
                  </div>
                </motion.div>

                {/* Status indicator */}
                <div className="text-xs text-muted-foreground">
                  {config.key === "resume_authenticity"
                    ? (value as number) >= 0.75
                      ? "High authenticity"
                      : (value as number) >= 0.6
                        ? "Moderate match"
                        : "Needs verification"
                    : (value as number) >= 8
                      ? "Excellent performance"
                      : (value as number) >= 7
                        ? "Strong performance"
                        : (value as number) >= 6
                          ? "Good performance"
                          : "Needs improvement"}
                </div>
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

      {/* Radar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="p-6 rounded-2xl glass border border-border/30"
      >
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <BarChart3 size={18} className="text-primary" /> Performance Radar
        </h3>

        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(240, 10%, 25%)" />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fill: "hsl(240, 5%, 50%)", fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: "hsl(240, 5%, 40%)", fontSize: 10 }}
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke="hsl(160, 84%, 39%)"
                fill="hsl(160, 84%, 39%)"
                fillOpacity={0.25}
                strokeWidth={2}
                dot={{ fill: "hsl(160, 84%, 39%)", r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(240, 12%, 10%)",
                  border: "1px solid hsl(240, 10%, 25%)",
                  borderRadius: "8px",
                  color: "hsl(60, 10%, 92%)",
                }}
                formatter={(value) => `${(value as number).toFixed(0)}/100`}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="p-6 rounded-2xl glass border border-border/30"
      >
        <h3 className="text-lg font-bold mb-3">Assessment Summary</h3>
        <p className="text-muted-foreground leading-relaxed">{data.summary}</p>
      </motion.div>

      {/* Recommendation Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className={`p-4 rounded-lg ${
          (overallScore as unknown as number) >= 7.5
            ? "bg-green-500/10 border border-green-500/30"
            : (overallScore as unknown as number) >= 6.5
              ? "bg-yellow-500/10 border border-yellow-500/30"
              : "bg-red-500/10 border border-red-500/30"
        }`}
      >
        <p className="text-sm font-semibold mb-1">
          {(overallScore as unknown as number) >= 7.5
            ? "✅ Recommended for Advancement"
            : (overallScore as unknown as number) >= 6.5
              ? "⚠️ Conditional Recommendation"
              : "❌ Needs Further Evaluation"}
        </p>
        <p className="text-xs text-muted-foreground">
          This report should be used alongside other hiring criteria and human judgment
        </p>
      </motion.div>
    </div>
  );
};

export default CandidateReport;
