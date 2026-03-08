import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Code2, ArrowRight, CheckCircle, Loader2, Cpu, Shield, Zap, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/layout/AppLayout";
import Navbar from "@/components/ui/Navbar";
import Container from "@/components/ui/Container";

const challenges = [
  { id: "non-repeating-char", title: "First Non-Repeating Character", difficulty: "Medium", tags: ["Strings", "Hash Map"], time: "25 min" },
  { id: "two-sum", title: "Two Sum", difficulty: "Easy", tags: ["Arrays", "Hash Map"], time: "15 min" },
  { id: "palindrome", title: "Valid Palindrome", difficulty: "Easy", tags: ["Strings", "Two Pointer"], time: "15 min" },
  { id: "fizzbuzz", title: "FizzBuzz", difficulty: "Easy", tags: ["Logic", "Loops"], time: "10 min" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

const categoryIcons = { languages: Cpu, frameworks: Shield, tools: Zap } as const;

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState("");
  const [skills, setSkills] = useState<{
    languages: string[];
    frameworks: string[];
    tools: string[];
    databases: string[];
  } | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [resumeText, setResumeText] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const ALLOWED_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Only PDF and DOCX files are allowed";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File size must be less than 5MB";
    }
    return null;
  };

  const uploadResume = async (file: File) => {
    const error = validateFile(file);
    if (error) {
      setUploadError(error);
      toast({ title: "Invalid File", description: error, variant: "destructive" });
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      // Step 1: Upload file
      const formData = new FormData();
      formData.append("resume", file);

      const uploadResponse = await axios.post("/api/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!uploadResponse.data.success) {
        throw new Error(uploadResponse.data.message || "Upload failed");
      }

      const filePath = uploadResponse.data.filePath;
      setUploadedFile(file.name);

      // Step 2: Parse resume text
      const parseResponse = await axios.post("/api/parse-resume", {
        file_path: filePath,
      });

      if (!parseResponse.data.success) {
        throw new Error(parseResponse.data.message || "Parse failed");
      }

      setResumeText(parseResponse.data.text);

      // Step 3: Extract skills
      const skillsResponse = await axios.post("/api/extract-skills", {
        resume_text: parseResponse.data.text,
      });

      if (skillsResponse.data.success) {
        setSkills({
          languages: skillsResponse.data.languages || [],
          frameworks: skillsResponse.data.frameworks || [],
          tools: skillsResponse.data.tools || [],
          databases: skillsResponse.data.databases || [],
        });

        setResumeUploaded(true);
        toast({
          title: "Resume Uploaded & Parsed",
          description: `Skills extracted successfully from ${file.name}`,
        });
      } else {
        throw new Error(skillsResponse.data.message || "Failed to extract skills");
      }
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : "Failed to upload resume";

      setUploadError(errorMessage);
      toast({ title: "Upload Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      uploadResume(files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const resetUpload = () => {
    setResumeUploaded(false);
    setSkills(null);
    setUploadedFile(null);
    setResumeText(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleStart = () => {
    if (!resumeUploaded || !skills || !selectedChallenge) {
      toast({
        title: "Missing Information",
        description: "Please upload a resume and select a challenge",
        variant: "destructive",
      });
      return;
    }

    sessionStorage.setItem("candidateData", JSON.stringify({
      resume: { text: resumeText, fileName: uploadedFile },
      skills,
      challenge: selectedChallenge,
      interviewId: crypto.randomUUID(),
    }));
    navigate("/interview");
  };

  return (
    <AppLayout>
      <Navbar title="Recruiter Dashboard" />
      <div className="fixed inset-0 dot-bg pointer-events-none opacity-20" />

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx"
        onChange={handleFileSelect}
        className="hidden"
      />

      <Container className="pt-24 pb-16 relative z-10" size="lg">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm font-mono text-primary uppercase tracking-widest mb-3 block"
            >
              Dashboard
            </motion.span>
            <h1 className="text-4xl md:text-6xl font-black mb-3">Recruiter Dashboard</h1>
            <p className="text-muted-foreground text-lg">Upload a resume, extract skills, and set up a coding challenge</p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: Resume Upload */}
            <div className="space-y-6">
              <motion.div
                custom={0}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="p-8 rounded-2xl glass border-glow"
              >
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Upload className="text-primary" size={20} /> Resume Upload
                </h2>

                {!resumeUploaded ? (
                  <motion.div
                    whileHover={!uploading ? { scale: 1.01, borderColor: "hsl(160 84% 39% / 0.5)" } : {}}
                    onClick={handleUploadClick}
                    className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:bg-primary/5 transition-all duration-300 relative overflow-hidden"
                  >
                    {uploading ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        <p className="text-muted-foreground">Processing resume...</p>
                        <motion.div
                          className="absolute bottom-0 left-0 h-1 bg-primary"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 2 }}
                        />
                      </div>
                    ) : uploadError ? (
                      <div className="flex flex-col items-center gap-3">
                        <AlertCircle className="w-10 h-10 text-destructive" />
                        <p className="text-destructive font-medium text-sm">{uploadError}</p>
                        <p className="text-xs text-muted-foreground">Click to try again</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <FileText className="w-12 h-12 text-muted-foreground" />
                        </motion.div>
                        <p className="text-muted-foreground font-medium">Click to upload your resume</p>
                        <p className="text-xs text-muted-foreground/60">PDF or DOCX • Max 5MB</p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/30 glow-box">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}>
                        <CheckCircle className="text-primary" size={24} />
                      </motion.div>
                      <div className="flex-1">
                        <p className="font-semibold">{uploadedFile}</p>
                        <p className="text-sm text-muted-foreground">Skills extracted successfully</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={resetUpload}
                      className="w-full px-4 py-2 text-sm font-medium bg-secondary/20 text-muted-foreground rounded-lg hover:bg-secondary/30 transition-colors"
                    >
                      Upload Different Resume
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>

              {/* Skills */}
              <AnimatePresence>
                {skills && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-8 rounded-2xl glass overflow-hidden"
                  >
                    <h2 className="text-xl font-bold mb-6">Extracted Skills</h2>
                    <div className="space-y-5">
                      {(["languages", "frameworks", "tools", "databases"] as const).map((cat, catIdx) => {
                        const Icon = categoryIcons[cat as keyof typeof categoryIcons] || Cpu;
                        const skillsList = skills[cat];
                        return skillsList && skillsList.length > 0 ? (
                          <div key={cat}>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2.5 flex items-center gap-2">
                              <Icon size={14} /> {cat}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {skillsList.map((s, sIdx) => (
                                <motion.span
                                  key={s}
                                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  transition={{ delay: catIdx * 0.15 + sIdx * 0.05 }}
                                  whileHover={{ scale: 1.05 }}
                                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-primary/10 text-primary border border-primary/20 cursor-default"
                                >
                                  {s}
                                </motion.span>
                              ))}
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right: Challenge Selection */}
            <div className="space-y-6">
              <motion.div
                custom={1}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="p-8 rounded-2xl glass"
              >
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Code2 className="text-secondary" size={20} /> Select Challenge
                </h2>
                <div className="space-y-3">
                  {challenges.map((c, i) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ x: 6 }}
                      onClick={() => setSelectedChallenge(c.id)}
                      className={`p-5 rounded-xl cursor-pointer border transition-all duration-300 ${
                        selectedChallenge === c.id
                          ? "border-primary bg-primary/10 glow-box"
                          : "border-border/30 hover:border-border bg-muted/20 hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold">{c.title}</h3>
                          <div className="flex gap-2 mt-2">
                            {c.tags.map((t) => (
                              <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground border border-border/20">{t}</span>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            c.difficulty === "Easy" ? "bg-primary/15 text-primary" : "bg-secondary/15 text-secondary"
                          }`}>
                            {c.difficulty}
                          </span>
                          <span className="text-xs text-muted-foreground">{c.time}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Start button */}
              <AnimatePresence>
                {resumeUploaded && selectedChallenge && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    className="p-6 rounded-2xl glass glow-box relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
                    <h3 className="text-lg font-bold mb-2 relative z-10">Ready to Begin</h3>
                    <p className="text-sm text-muted-foreground mb-4 relative z-10">All requirements met. Start the coding interview.</p>
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: "0 0 40px hsl(160 84% 39% / 0.3)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleStart}
                      className="w-full py-4 rounded-xl font-bold bg-primary text-primary-foreground flex items-center justify-center gap-2 relative z-10"
                    >
                      Start Interview <ArrowRight size={18} />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
      </Container>
    </AppLayout>
  );
};

export default Dashboard;
