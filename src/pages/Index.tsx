import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles, Brain, Code2, BarChart3, Zap, FileText, Eye, Target, TrendingUp, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import Navbar from "@/components/ui/Navbar";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const steps = [
  {
    icon: FileText,
    num: "01",
    title: "Upload Resume",
    desc: "AI extracts skills, experience, and claimed expertise from the candidate's resume.",
    tags: ["React", "Node.js", "Problem Solving"],
    gradient: "from-primary/20 to-primary/5",
    borderColor: "border-primary/30",
    iconColor: "text-primary",
  },
  {
    icon: Code2,
    num: "02",
    title: "Coding Challenge",
    desc: "Candidate solves a real coding problem in our built-in editor with live execution.",
    tags: ["JavaScript", "Python", "Java"],
    gradient: "from-secondary/20 to-secondary/5",
    borderColor: "border-secondary/30",
    iconColor: "text-secondary",
  },
  {
    icon: Eye,
    num: "03",
    title: "Behavior Tracking",
    desc: "System tracks time, edits, debugging attempts, and problem-solving patterns.",
    tags: ["Time to code", "Debug count", "Edit patterns"],
    gradient: "from-accent/20 to-accent/5",
    borderColor: "border-accent/30",
    iconColor: "text-accent",
  },
  {
    icon: Target,
    num: "04",
    title: "AI Analysis",
    desc: "Compare resume claims vs actual performance with an AI-generated detailed report.",
    tags: ["Skill gaps", "Strengths", "Score"],
    gradient: "from-primary/20 to-secondary/5",
    borderColor: "border-primary/30",
    iconColor: "text-primary",
  },
];

const features = [
  { icon: BarChart3, title: "Behavioral Analytics", desc: "Track problem-solving patterns, debugging habits, and coding speed in real-time.", color: "primary" },
  { icon: Brain, title: "AI-Powered Reports", desc: "Deep analysis comparing resume claims against observed coding performance.", color: "secondary" },
  { icon: Zap, title: "Real-Time Execution", desc: "Execute code with test cases, measure performance, and verify solutions instantly.", color: "accent" },
  { icon: TrendingUp, title: "Interactive Dashboard", desc: "Charts, analytics, and comparison reports for data-driven hiring decisions.", color: "primary" },
];

const Index = () => {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    <AppLayout>
      <Navbar title="NeuroHire" showLinks={true} />

      {/* Dot grid bg */}
      <div className="fixed inset-0 dot-bg pointer-events-none opacity-30" />

      {/* Hero */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden min-h-screen flex flex-col items-center justify-center">
        {/* Morphing blobs */}
        <motion.div
          className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-primary/8 animate-morph blur-3xl pointer-events-none"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-secondary/8 animate-morph blur-3xl pointer-events-none"
          style={{ animationDelay: "3s" }}
          animate={{ scale: [1, 1.15, 1], rotate: [0, -10, 0] }}
          transition={{ duration: 12, repeat: Infinity, delay: 2 }}
        />
        <motion.div
          className="absolute bottom-10 left-1/2 w-[350px] h-[350px] bg-accent/6 animate-morph blur-3xl pointer-events-none"
          style={{ animationDelay: "5s" }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 14, repeat: Infinity, delay: 4 }}
        />

        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass border-glow mb-8 text-sm text-primary font-medium"
          >
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
              <Sparkles size={14} />
            </motion.div>
            AI-Powered Hiring Analytics
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-6xl md:text-8xl lg:text-9xl font-black mb-6 leading-[0.9] tracking-tight"
          >
            See Beyond
            <br />
            <span className="gradient-text">the Resume</span>
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Stop guessing. NeuroHire analyzes{" "}
            <span className="text-primary font-semibold text-glow-primary">actual coding behavior</span>{" "}
            and compares it against resume claims with AI-generated insights.
          </motion.p>

          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 50px hsl(160 84% 39% / 0.4)" }}
                whileTap={{ scale: 0.97 }}
                className="px-10 py-5 rounded-2xl font-bold bg-primary text-primary-foreground inline-flex items-center gap-2 text-lg animate-pulse-glow relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Start Analysis
                  <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    <ArrowRight size={20} />
                  </motion.span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-glow-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.button>
            </Link>
            <Link to="/interview">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="px-10 py-5 rounded-2xl font-bold glass border-glow text-foreground inline-flex items-center gap-2 text-lg"
              >
                Try Demo Interview
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="text-muted-foreground/40" size={24} />
        </motion.div>
      </section>

      {/* Stats bar */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-12 px-6 border-y border-border/30"
      >
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: "Candidates Analyzed", value: "10K+" },
            { label: "Accuracy Rate", value: "94%" },
            { label: "Time Saved", value: "60%" },
            { label: "Skill Gaps Found", value: "3.2x" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <p className="text-3xl md:text-4xl font-black gradient-text mb-1">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* How it works */}
      <section className="py-28 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-sm font-mono text-primary uppercase tracking-widest mb-4 block"
            >
              Process
            </motion.span>
            <h2 className="text-4xl md:text-6xl font-black mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Four steps to data-driven hiring decisions</p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-6"
          >
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -6, transition: { duration: 0.3 } }}
                className={`p-8 rounded-2xl bg-gradient-to-br ${step.gradient} border ${step.borderColor} group cursor-default relative overflow-hidden`}
              >
                <div className="absolute top-4 right-4 text-6xl font-black text-foreground/[0.03] select-none">{step.num}</div>
                <div className="flex items-start gap-4 mb-4 relative z-10">
                  <motion.div
                    whileHover={{ rotate: 12, scale: 1.1 }}
                    className={`w-12 h-12 rounded-xl bg-background/50 flex items-center justify-center border ${step.borderColor}`}
                  >
                    <step.icon className={`w-5 h-5 ${step.iconColor}`} />
                  </motion.div>
                  <div>
                    <span className="text-xs font-mono text-muted-foreground">{step.num}</span>
                    <h3 className="text-xl font-bold">{step.title}</h3>
                  </div>
                </div>
                <p className="text-muted-foreground mb-5 leading-relaxed relative z-10">{step.desc}</p>
                <div className="flex flex-wrap gap-2 relative z-10">
                  {step.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium bg-background/40 text-muted-foreground border border-border/30">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-sm font-mono text-secondary uppercase tracking-widest mb-4 block"
            >
              Features
            </motion.span>
            <h2 className="text-4xl md:text-6xl font-black mb-4">Powerful Features</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Everything you need for smarter hiring</p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-6"
          >
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                custom={i}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                className="p-8 rounded-2xl glass group relative overflow-hidden"
              >
                <div className={`absolute -top-20 -right-20 w-40 h-40 bg-${f.color}/5 rounded-full blur-3xl group-hover:bg-${f.color}/10 transition-colors duration-500`} />
                <f.icon className={`w-10 h-10 text-${f.color} mb-5 group-hover:scale-110 transition-transform duration-300`} />
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center p-14 rounded-3xl glass glow-box relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
          <h2 className="text-3xl md:text-5xl font-black mb-4 relative z-10">Ready to hire smarter?</h2>
          <p className="text-muted-foreground mb-10 text-lg relative z-10">Try NeuroHire now with our interactive demo.</p>
          <Link to="/dashboard">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 50px hsl(160 84% 39% / 0.3)" }}
              whileTap={{ scale: 0.97 }}
              className="px-10 py-5 rounded-2xl font-bold bg-primary text-primary-foreground inline-flex items-center gap-2 text-lg relative z-10"
            >
              Get Started <ArrowRight size={20} />
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border/30">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-muted-foreground text-sm">
          <p>© 2025 NeuroHire. Behavior-Based Hiring Analytics Platform.</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs">All systems operational</span>
          </div>
        </div>
      </footer>
    </AppLayout>
  );
};

export default Index;
