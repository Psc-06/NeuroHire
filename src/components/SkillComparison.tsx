import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, TrendingUp, ArrowRight } from "lucide-react";

interface SkillData {
  claimed: string;
  observed: string;
  confidence: number;
}

interface SkillComparisonProps {
  skills: Record<string, SkillData>;
  isLoading?: boolean;
}

const skillLevelMap: Record<string, number> = {
  "Beginner": 1,
  "Intermediate": 2,
  "Advanced": 3,
  "Expert": 4,
};

const levelColors = {
  "Beginner": "bg-blue-500/20 text-blue-600 border-blue-500/30",
  "Intermediate": "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
  "Advanced": "bg-orange-500/20 text-orange-600 border-orange-500/30",
  "Expert": "bg-green-500/20 text-green-600 border-green-500/30",
};

export const SkillComparison = ({
  skills,
  isLoading = false,
}: SkillComparisonProps) => {
  // Handle null or undefined skills
  if (!skills || typeof skills !== 'object' || Object.keys(skills).length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No skill comparison data available.</p>
      </div>
    );
  }
  const skillEntries = Object.entries(skills);

  // Calculate mismatch metrics
  const mismatches = skillEntries.filter(([_, data]) => {
    const claimedLevel = skillLevelMap[data.claimed] || 0;
    const observedLevel = skillLevelMap[data.observed] || 0;
    return claimedLevel > observedLevel;
  });

  const accurateMatches = skillEntries.filter(([_, data]) => {
    const claimedLevel = skillLevelMap[data.claimed] || 0;
    const observedLevel = skillLevelMap[data.observed] || 0;
    return claimedLevel === observedLevel;
  });

  const underestimated = skillEntries.filter(([_, data]) => {
    const claimedLevel = skillLevelMap[data.claimed] || 0;
    const observedLevel = skillLevelMap[data.observed] || 0;
    return claimedLevel < observedLevel;
  });

  const getMismatchIndicator = (data: SkillData): "overestimated" | "accurate" | "underestimated" => {
    const claimedLevel = skillLevelMap[data.claimed] || 0;
    const observedLevel = skillLevelMap[data.observed] || 0;

    if (claimedLevel > observedLevel) return "overestimated";
    if (claimedLevel < observedLevel) return "underestimated";
    return "accurate";
  };

  const tableVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
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
          <h2 className="text-2xl font-bold">Skill Analysis</h2>
        </div>
        <p className="text-muted-foreground">
          Resume claims vs observed performance during coding interview
        </p>
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-4"
      >
        {[
          {
            label: "Overestimated",
            value: mismatches.length,
            color: "from-red-500/20 to-red-600/20",
            textColor: "text-red-600",
            borderColor: "border-red-500/30",
          },
          {
            label: "Accurate",
            value: accurateMatches.length,
            color: "from-green-500/20 to-green-600/20",
            textColor: "text-green-600",
            borderColor: "border-green-500/30",
          },
          {
            label: "Underestimated",
            value: underestimated.length,
            color: "from-blue-500/20 to-blue-600/20",
            textColor: "text-blue-600",
            borderColor: "border-blue-500/30",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            className={`p-4 rounded-lg bg-gradient-to-br ${stat.color} border-2 ${stat.borderColor}`}
          >
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
              {stat.label}
            </p>
            <p className={`text-2xl font-black ${stat.textColor}`}>{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Comparison Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-border overflow-hidden bg-muted/5"
      >
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 p-4 bg-muted/20 border-b border-border font-semibold sticky top-0 z-10">
          <div className="col-span-3">Skill</div>
          <div className="col-span-2">Claimed</div>
          <div className="col-span-2">Observed</div>
          <div className="col-span-2">Confidence</div>
          <div className="col-span-3">Match</div>
        </div>

        {/* Table Body */}
        <motion.div
          variants={tableVariants}
          initial="hidden"
          animate="visible"
          className="divide-y divide-border"
        >
          {isLoading ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">Loading skill comparison...</p>
            </div>
          ) : skillEntries.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">
                No skills to compare. Complete a coding interview first.
              </p>
            </div>
          ) : (
            skillEntries.map(([skillName, data], index) => {
              const mismatchType = getMismatchIndicator(data);
              const isAccurate = mismatchType === "accurate";
              const isOverestimated = mismatchType === "overestimated";
              const isUnderestimated = mismatchType === "underestimated";

              return (
                <motion.div
                  key={skillName}
                  variants={rowVariants}
                  className={`grid grid-cols-12 gap-2 p-4 items-center transition-all duration-300 ${
                    isAccurate
                      ? "bg-transparent hover:bg-green-500/5"
                      : isOverestimated
                        ? "bg-red-500/5 hover:bg-red-500/10"
                        : "bg-blue-500/5 hover:bg-blue-500/10"
                  } border-l-4 ${
                    isAccurate
                      ? "border-l-green-500"
                      : isOverestimated
                        ? "border-l-red-500"
                        : "border-l-blue-500"
                  }`}
                >
                  {/* Skill Name */}
                  <div className="col-span-3">
                    <p className="font-semibold text-foreground">{skillName}</p>
                  </div>

                  {/* Claimed Level */}
                  <div className="col-span-2">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                        levelColors[data.claimed] || levelColors["Beginner"]
                      }`}
                    >
                      {data.claimed}
                    </span>
                  </div>

                  {/* Observed Level */}
                  <div className="col-span-2">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                        levelColors[data.observed] || levelColors["Beginner"]
                      }`}
                    >
                      {data.observed}
                    </span>
                  </div>

                  {/* Confidence Score */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary to-secondary"
                          initial={{ width: 0 }}
                          animate={{ width: `${data.confidence * 100}%` }}
                          transition={{ delay: 0.3 + index * 0.05, duration: 0.6 }}
                        />
                      </div>
                      <span className="text-xs font-mono font-semibold text-muted-foreground w-8">
                        {(data.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Match Status */}
                  <div className="col-span-3 flex items-center gap-2">
                    {isAccurate && (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-xs font-medium text-green-600">Accurate</span>
                      </>
                    )}
                    {isOverestimated && (
                      <>
                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <span className="text-xs font-medium text-red-600">Overestimated</span>
                      </>
                    )}
                    {isUnderestimated && (
                      <>
                        <ArrowRight className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="text-xs font-medium text-blue-600">Underestimated</span>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </motion.div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-4 rounded-lg bg-muted/20 border border-border/30"
      >
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Understanding the Results
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-600">Overestimated</p>
              <p className="text-xs text-muted-foreground">Claimed level exceeds observed performance</p>
            </div>
          </div>
          <div className="flex gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-600">Accurate</p>
              <p className="text-xs text-muted-foreground">Claims align with observed performance</p>
            </div>
          </div>
          <div className="flex gap-2">
            <ArrowRight className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-600">Underestimated</p>
              <p className="text-xs text-muted-foreground">Observed performance exceeds claims</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SkillComparison;
