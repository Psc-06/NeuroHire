import { Link } from "react-router-dom";
import { Brain, Shield, UserCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center max-w-4xl mx-auto"
      >
        {/* Logo/Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
          className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
        >
          <Brain className="w-10 h-10 text-white" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tight"
        >
          NeuroHire
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-xl md:text-2xl text-gray-300 mb-3"
        >
          AI Behavioral Hiring Platform
        </motion.p>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-base text-gray-400 mb-12 max-w-2xl mx-auto"
        >
          Revolutionize your hiring process with AI-powered behavioral analytics. 
          Analyze coding patterns, problem-solving skills, and match candidates to job requirements with precision.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          {/* Candidate Login Button */}
          <Link
            to="/candidate/login"
            className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 w-full sm:w-auto"
          >
            <UserCheck className="w-5 h-5" />
            <span>Candidate Login</span>
          </Link>

          {/* Admin Login Button */}
          <Link
            to="/admin/login"
            className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gray-800 text-white font-semibold rounded-xl border border-gray-700 hover:bg-gray-700 hover:border-gray-600 transition-all duration-300 hover:scale-105 w-full sm:w-auto"
          >
            <Shield className="w-5 h-5" />
            <span>Admin Login</span>
          </Link>
        </motion.div>

        {/* Feature highlights */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm"
        >
          <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700/50 backdrop-blur-sm">
            <h3 className="text-indigo-400 font-semibold mb-2">Resume Analysis</h3>
            <p className="text-gray-400">AI-powered skill extraction and verification</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700/50 backdrop-blur-sm">
            <h3 className="text-purple-400 font-semibold mb-2">Live Coding Tests</h3>
            <p className="text-gray-400">Real-time code execution and behavior tracking</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700/50 backdrop-blur-sm">
            <h3 className="text-indigo-400 font-semibold mb-2">Smart Reports</h3>
            <p className="text-gray-400">Comprehensive analytics and insights</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
