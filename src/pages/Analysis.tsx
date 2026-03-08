import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Download, Share2, ArrowLeft, CheckCircle, AlertTriangle, Target, TrendingUp, Loader2, FileDown, AlertCircle as AlertIcon } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import AppLayout from "@/components/layout/AppLayout";
import Container from "@/components/ui/Container";
import Navbar from "@/components/ui/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AnimatedCounter from "@/components/AnimatedCounter";
import BehaviorAnalytics from "@/components/BehaviorAnalytics";
import SkillComparison from "@/components/SkillComparison";
import CandidateReport from "@/components/CandidateReport";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import jsPDF from "jspdf";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const AnalysisPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const searchParams = new URLSearchParams(location.search);
        let interviewId = searchParams.get("interviewId");
        
        if (!interviewId) {
          // Fallback to sessionStorage if not in URL
          const candidateData = JSON.parse(sessionStorage.getItem("candidateData") || "{}");
          interviewId = candidateData.interviewId;
        }

        if (!interviewId) {
          setError("No interview session found. Please start a coding interview first.");
          setLoading(false);
          return;
        }

        // Fetch analysis from backend
        const response = await axios.get(`/api/analysis?interviewId=${interviewId}`);
        
        if (response.data.success && response.data.analysis) {
          setAnalysisData(response.data.analysis);
        } else {
          setError("No analysis data available");
        }
      } catch (err: any) {
        console.error("Failed to fetch analysis:", err);
        if (err.response?.status === 404) {
          setError("No analysis available. Please complete a coding interview first.");
        } else {
          setError("Failed to load analysis data. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [location.search]);

  const handleDownloadPDF = () => {
    if (!analysisData) return;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFillColor(10, 10, 20);
  doc.rect(0, 0, pageWidth, 297, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text("NeuroHire AI Analysis Report", pageWidth / 2, 25, { align: "center" });

  doc.setFontSize(12);
  doc.setTextColor(150, 150, 150);
  doc.text("Resume Claims vs Actual Coding Behavior", pageWidth / 2, 33, { align: "center" });

  // Score
  doc.setFontSize(16);
  doc.setTextColor(40, 180, 120);
  doc.text(`Overall Score: ${analysisData.overallScore}/100`, 20, 50);
  doc.setTextColor(255, 255, 255);
  doc.text(`Verdict: ${analysisData.rating}`, 120, 50);

  // Resume vs Observed
  doc.setFontSize(14);
  doc.setTextColor(40, 180, 120);
  doc.text("Resume Claim:", 20, 65);
  doc.setTextColor(255, 255, 255);
  doc.text(analysisData.resumeClaim, 75, 65);

  doc.setTextColor(230, 160, 50);
  doc.text("Observed Skill:", 20, 73);
  doc.setTextColor(255, 255, 255);
  doc.text(analysisData.observedSkill, 78, 73);

  // Strengths
  let y = 90;
  doc.setFontSize(14);
  doc.setTextColor(40, 180, 120);
  doc.text("Strengths", 20, y);
  doc.setFontSize(11);
  doc.setTextColor(200, 200, 200);
  analysisData.strengths.forEach((s: string) => {
    y += 8;
    doc.text(`• ${s}`, 25, y);
  });

  // Weaknesses
  y += 16;
  doc.setFontSize(14);
  doc.setTextColor(230, 160, 50);
  doc.text("Weaknesses", 20, y);
  doc.setFontSize(11);
  doc.setTextColor(200, 200, 200);
  analysisData.weaknesses.forEach((s: string) => {
    y += 8;
    doc.text(`• ${s}`, 25, y);
  });

  // Skill Gaps
  y += 16;
  doc.setFontSize(14);
  doc.setTextColor(220, 80, 100);
  doc.text("Skill Gaps", 20, y);
  doc.setFontSize(11);
  doc.setTextColor(200, 200, 200);
  analysisData.skillGaps.forEach((s: string) => {
    y += 8;
    doc.text(`• ${s}`, 25, y);
  });

  // Performance metrics
  y += 16;
  doc.setFontSize(14);
  doc.setTextColor(40, 180, 120);
  doc.text("Performance Metrics", 20, y);
  doc.setFontSize(11);
  doc.setTextColor(200, 200, 200);
  analysisData.barData.forEach((d: any) => {
    y += 8;
    doc.text(`${d.metric}: ${d.value}/100`, 25, y);
  });

  // Recommendations
  y += 16;
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text("Recommendations", 20, y);
  y += 8;
  doc.setFontSize(10);
  doc.setTextColor(180, 180, 180);
  const recLines = doc.splitTextToSize(analysisData.recommendations, pageWidth - 40);
  doc.text(recLines, 20, y);

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("Generated by NeuroHire AI • " + new Date().toLocaleDateString(), pageWidth / 2, 285, { align: "center" });

  doc.save("neurohire-analysis-report.pdf");
  };

  if (loading) {
    return (
      <AppLayout>
        <Navbar title="Analysis Report" />
        <div className="min-h-screen flex items-center justify-center pt-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-14 rounded-3xl glass border-glow"
          >
            <Loader2 className="w-14 h-14 text-primary animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-black mb-2">Loading Analysis</h2>
            <p className="text-muted-foreground">Retrieving test results...</p>
            <motion.div className="mt-6 h-1 bg-primary/20 rounded-full overflow-hidden max-w-xs mx-auto">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  if (error || !analysisData) {
    return (
      <AppLayout>
        <Navbar title="Analysis Report" />
        <div className="min-h-screen flex items-center justify-center pt-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-14 rounded-3xl glass border-glow max-w-md"
          >
            <AlertIcon className="w-14 h-14 text-secondary mx-auto mb-4" />
            <h2 className="text-2xl font-black mb-2">No Analysis Available</h2>
            <p className="text-muted-foreground mb-6">{error || "Please complete a coding interview first."}</p>
            <Button
              onClick={() => navigate("/dashboard")}
              size="lg"
              className="bg-primary hover:bg-primary/90"
            >
              Go to Dashboard
            </Button>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showParticles={true}>
      <Navbar 
        title="Analysis Report" 
        showBackToDashboard={true}
      />
      
      <Container className="pt-24" size="lg">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 border border-primary/30"
            >
              <CheckCircle size={14} /> Analysis Complete
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-black mb-3 gradient-text">AI-Powered Report</h1>
            <p className="text-muted-foreground text-lg">Resume claims vs actual coding behavior</p>
          </motion.div>

          {/* Hero Comparison */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="p-10 rounded-3xl glass glow-box mb-8 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
            <h2 className="text-2xl font-black text-center mb-8 relative z-10">Resume vs Reality</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto relative z-10">
              <motion.div whileHover={{ scale: 1.03, y: -4 }} transition={{ type: "spring" }} className="p-6 rounded-2xl bg-primary/10 border border-primary/30">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-3">Resume Claim</p>
                <p className="text-4xl font-black text-primary mb-4 text-glow-primary">{analysisData.resumeClaim}</p>
                <div className="text-sm text-muted-foreground space-y-1.5">
                  <p>• 5 years experience stated</p>
                  <p>• Claims "Expert in React & Node.js"</p>
                  <p>• Multiple projects listed</p>
                </div>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03, y: -4 }} transition={{ type: "spring" }} className="p-6 rounded-2xl bg-secondary/10 border border-secondary/30">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-3">Observed Skill</p>
                <p className="text-4xl font-black text-secondary text-glow-secondary mb-4">{analysisData.observedSkill}</p>
                <div className="text-sm text-muted-foreground space-y-1.5">
                  <p>• Moderate proficiency measured</p>
                  <p>• Functional but slower than expected</p>
                  <p>• Score: {analysisData.overallScore}/100</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Score */}
          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="p-8 rounded-2xl glass glow-box mb-8">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="text-center md:text-left">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-2">Overall Score</p>
                <div className="text-7xl font-black gradient-text">
                  <AnimatedCounter value={analysisData.overallScore} />
                </div>
              </div>
              <div className="flex-1 flex flex-wrap gap-4 justify-center md:justify-end">
                {[
                  { label: "Verdict", value: analysisData.rating, color: "text-primary" },
                  { label: "Code Quality", value: "Clean", color: "text-secondary" },
                  { label: "Speed", value: "Average", color: "text-accent" },
                ].map((item) => (
                  <motion.div key={item.label} whileHover={{ scale: 1.05 }} className="p-4 rounded-xl bg-muted/20 border border-border/20 min-w-[140px] text-center">
                    <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                    <p className={`text-lg font-black ${item.color}`}>{item.value}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Candidate Report */}
          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="mb-8">
            <CandidateReport
              data={analysisData.candidateReport}
              candidateName="John Smith"
            />
          </motion.div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" className="p-6 rounded-2xl glass">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Target size={18} className="text-primary" /> Skills Comparison</h3>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={analysisData.radarData}>
                  <PolarGrid stroke="hsl(240, 10%, 18%)" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: "hsl(240, 5%, 50%)", fontSize: 11 }} />
                  <Radar name="Claimed" dataKey="claimed" stroke="hsl(160, 84%, 39%)" fill="hsl(160, 84%, 39%)" fillOpacity={0.15} strokeWidth={2} />
                  <Radar name="Observed" dataKey="observed" stroke="hsl(32, 95%, 55%)" fill="hsl(32, 95%, 55%)" fillOpacity={0.15} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
              <div className="flex gap-6 justify-center text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-primary rounded" /> Claimed</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-secondary rounded" /> Observed</span>
              </div>
            </motion.div>

            <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="p-6 rounded-2xl glass">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-secondary" /> Performance Metrics</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={analysisData.barData} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: "hsl(240, 5%, 50%)", fontSize: 11 }} />
                  <YAxis type="category" dataKey="metric" tick={{ fill: "hsl(240, 5%, 50%)", fontSize: 11 }} width={120} />
                  <Tooltip
                    contentStyle={{ background: "hsl(240, 12%, 7%)", border: "1px solid hsl(240, 10%, 18%)", borderRadius: "8px", color: "hsl(60, 10%, 92%)" }}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {analysisData.barData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Behavior Analytics */}
          <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible" className="mb-8">
            <BehaviorAnalytics
              metrics={analysisData.behaviorMetrics || {}}
              aiScores={analysisData.aiBehaviorScores}
              aiSummary={analysisData.aiAnalysisSummary}
            />
          </motion.div>

          {/* Skill Comparison */}
          <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible" className="mb-8">
            <SkillComparison skills={analysisData.skillComparison} />
          </motion.div>

          {/* Strengths / Weaknesses / Gaps */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              { title: "Strengths", items: analysisData.strengths, icon: CheckCircle, color: "primary" },
              { title: "Weaknesses", items: analysisData.weaknesses, icon: AlertTriangle, color: "secondary" },
              { title: "Skill Gaps", items: analysisData.skillGaps, icon: Target, color: "accent" },
            ].map((section, i) => (
              <motion.div
                key={section.title}
                custom={i + 7}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -6 }}
                className="p-6 rounded-2xl glass"
              >
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 text-${section.color}`}>
                  <section.icon size={18} /> {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.items.map((item, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + idx * 0.1 }}
                      className="flex gap-2 text-sm text-muted-foreground"
                    >
                      <span className={`text-${section.color} mt-0.5`}>•</span>
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Recommendations */}
          <motion.div custom={10} variants={fadeUp} initial="hidden" animate="visible" className="p-8 rounded-2xl glass mb-8">
            <h3 className="text-xl font-black mb-4">📌 Recommendations</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">{analysisData.recommendations}</p>
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-sm text-muted-foreground">💡 This analysis combines resume parsing, code quality assessment, and behavioral metrics for data-driven hiring insights.</p>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div custom={11} variants={fadeUp} initial="hidden" animate="visible" className="flex gap-4">
            <Button
              onClick={handleDownloadPDF}
              className="flex-1 bg-primary hover:bg-primary/90"
              size="lg"
            >
              <FileDown size={18} /> Download PDF Report
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              size="lg"
            >
              <Share2 size={18} /> Share Report
            </Button>
          </motion.div>
      </Container>
    </AppLayout>
  );
};

export default AnalysisPage;
