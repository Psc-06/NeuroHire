import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export default function PageHeader({ 
  title, 
  description, 
  actions, 
  icon,
  className 
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("mb-8", className)}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          {icon && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="flex-shrink-0"
            >
              {icon}
            </motion.div>
          )}
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
              {title}
            </h1>
            {description && (
              <p className="text-base sm:text-lg text-gray-400">
                {description}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </motion.div>
  );
}
