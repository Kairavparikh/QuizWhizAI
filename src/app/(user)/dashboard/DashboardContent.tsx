"use client";

import MetricCard from "./metricCard";
import SubmissionsHeatMap from "./heatMap";
import QuizzesGrid from "./QuizzesGrid";
import { Button } from "@/components/ui/button";
import updateExistingQuizzes from "@/app/actions/updateExistingQuizzes";
import type { Quiz } from "./QuizCard";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

type Props = {
  userData: { label: string; value: number | string | null }[] | null;
  heatMapData: { data: { createdAt: Date; count: number }[] } | null;
  enrichedQuizzes: Quiz[];
};

export default function DashboardContent({ userData, heatMapData, enrichedQuizzes }: Props) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await updateExistingQuizzes();
      window.location.reload();
    } catch (error) {
      console.error("Error refreshing quizzes:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Stats Grid with staggered animation */}
      {userData && userData.length > 0 && (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          {userData.map((metric, index) => (
            <MetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              index={index}
            />
          ))}
        </motion.div>
      )}

      {/* Heatmap with entrance animation */}
      {heatMapData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="relative group"
        >
          {/* Gradient border effect */}
          <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500" />

          <div className="relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 overflow-hidden">
            {/* Background gradient */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/30 to-pink-50/30 dark:from-blue-950/10 dark:via-purple-950/10 dark:to-pink-950/10 opacity-0 group-hover:opacity-100"
              transition={{ duration: 0.3 }}
            />

            <div className="relative z-10">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-gray-100 dark:via-gray-200 dark:to-gray-100 bg-clip-text text-transparent mb-4">
                Activity Overview
              </h2>
              <SubmissionsHeatMap data={heatMapData.data} />
            </div>

            {/* Corner accent */}
            <motion.div
              className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-blue-500/10 to-transparent rounded-tl-full"
              initial={{ scale: 1, opacity: 0 }}
              whileHover={{ scale: 1.2, opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      )}

      {/* Quizzes Grid */}
      <QuizzesGrid quizzes={enrichedQuizzes} />

      {/* Database maintenance section with modern design */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="relative group"
      >
        <div className="absolute -inset-[1px] bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-2xl opacity-50 group-hover:opacity-100 blur-sm transition-all duration-500" />

        <div className="relative bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100"
            transition={{ duration: 0.3 }}
          />

          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                Don&apos;t see your Quiz?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click below to refresh and sync your quizzes
              </p>
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="outline"
                size="lg"
                className="group/refresh"
              >
                <motion.div
                  animate={{ rotate: isRefreshing ? 360 : 0 }}
                  transition={{
                    duration: 1,
                    repeat: isRefreshing ? Infinity : 0,
                    ease: "linear"
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                </motion.div>
                {isRefreshing ? "Refreshing..." : "Refresh Quizzes"}
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
