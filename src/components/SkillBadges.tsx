import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface Skills {
  languages: string[];
  frameworks: string[];
  tools: string[];
  databases: string[];
}

interface SkillBadgesProps {
  skills: Skills | null;
  isLoading?: boolean;
}

const categoryConfig = {
  languages: {
    label: "Languages",
    color: "bg-blue-500/20 text-blue-700 border-blue-200 dark:text-blue-400 dark:border-blue-800",
    icon: "💻",
  },
  frameworks: {
    label: "Frameworks",
    color: "bg-purple-500/20 text-purple-700 border-purple-200 dark:text-purple-400 dark:border-purple-800",
    icon: "🏗️",
  },
  tools: {
    label: "Tools",
    color: "bg-orange-500/20 text-orange-700 border-orange-200 dark:text-orange-400 dark:border-orange-800",
    icon: "🔧",
  },
  databases: {
    label: "Databases",
    color: "bg-green-500/20 text-green-700 border-green-200 dark:text-green-400 dark:border-green-800",
    icon: "🗄️",
  },
};

export const SkillBadges = ({ skills, isLoading }: SkillBadgesProps) => {
  if (!skills) return null;

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

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  };

  const hasAnySkills = Object.values(skills).some((category) => category.length > 0);

  if (!hasAnySkills) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-lg bg-amber-500/10 border border-amber-200 dark:border-amber-800"
      >
        <p className="text-sm text-amber-700 dark:text-amber-400">
          No skills detected in the resume. Please ensure your resume includes relevant technologies.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {Object.entries(categoryConfig).map(([key, config]) => {
        const categorySkills = skills[key as keyof Skills];

        if (categorySkills.length === 0) return null;

        return (
          <motion.div key={key} variants={itemVariants} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{config.icon}</span>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                {config.label}
              </h4>
              <span className="ml-auto text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded">
                {categorySkills.length}
              </span>
            </div>

            <motion.div
              className="flex flex-wrap gap-2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence mode="wait">
                {categorySkills.map((skill, index) => (
                  <motion.div
                    key={`${key}-${skill}-${index}`}
                    variants={badgeVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Badge
                      className={`${config.color} border cursor-pointer hover:shadow-md transition-shadow`}
                      variant="outline"
                    >
                      {skill}
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default SkillBadges;
