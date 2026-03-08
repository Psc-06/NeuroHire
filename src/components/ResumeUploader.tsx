import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, X, Copy, Check } from "lucide-react";
import axios, { AxiosProgressEvent } from "axios";
import { useToast } from "@/hooks/use-toast";
import SkillBadges from "@/components/SkillBadges";

interface UploadState {
  file: File | null;
  progress: number;
  uploading: boolean;
  success: boolean;
  error: string | null;
}

interface ParseState {
  parsing: boolean;
  text: string | null;
  error: string | null;
}

interface SkillsState {
  languages: string[];
  frameworks: string[];
  tools: string[];
  databases: string[];
}

interface ExtractState {
  extracting: boolean;
  skills: SkillsState | null;
  error: string | null;
}

export const ResumeUploader = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    progress: 0,
    uploading: false,
    success: false,
    error: null,
  });
  const [parseState, setParseState] = useState<ParseState>({
    parsing: false,
    text: null,
    error: null,
  });
  const [extractState, setExtractState] = useState<ExtractState>({
    extracting: false,
    skills: null,
    error: null,
  });
  const [filePath, setFilePath] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

  const extractSkillsFromText = async (text: string) => {
    setExtractState({ extracting: true, skills: null, error: null });

    try {
      const response = await axios.post("/api/extract-skills", {
        resume_text: text,
      });

      if (response.data.success) {
        const skills: SkillsState = {
          languages: response.data.languages || [],
          frameworks: response.data.frameworks || [],
          tools: response.data.tools || [],
          databases: response.data.databases || [],
        };

        setExtractState({
          extracting: false,
          skills,
          error: null,
        });

        const totalSkills = Object.values(skills).reduce((sum, arr) => sum + arr.length, 0);
        toast({
          title: "Skills Extracted",
          description: `Found ${totalSkills} skills across all categories`,
        });
      } else {
        throw new Error(response.data.message || "Failed to extract skills");
      }
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : "Failed to extract skills";

      setExtractState({
        extracting: false,
        skills: null,
        error: errorMessage,
      });

      toast({
        title: "Skill Extraction Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const parseResume = async (path: string) => {
    setParseState({ parsing: true, text: null, error: null });

    try {
      const response = await axios.post("/api/parse-resume", {
        file_path: path,
      });

      if (response.data.success) {
        setParseState({
          parsing: false,
          text: response.data.text,
          error: null,
        });

        toast({
          title: "Resume Parsed",
          description: `Extracted ${response.data.length} characters from resume`,
        });

        // Extract skills after parsing
        await extractSkillsFromText(response.data.text);
      } else {
        throw new Error(response.data.message || "Failed to parse resume");
      }
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : "Failed to parse resume";

      setParseState({
        parsing: false,
        text: null,
        error: errorMessage,
      });

      toast({
        title: "Parse Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = async (file: File) => {
    const error = validateFile(file);
    if (error) {
      setUploadState((prev) => ({ ...prev, error }));
      toast({
        title: "Invalid File",
        description: error,
        variant: "destructive",
      });
      return;
    }

    setUploadState((prev) => ({
      ...prev,
      file,
      error: null,
      progress: 0,
      success: false,
    }));
    setParseState({ parsing: false, text: null, error: null });

    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploadState((prev) => ({ ...prev, uploading: true, error: null }));

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const response = await axios.post("/api/resume/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadState((prev) => ({ ...prev, progress: percentCompleted }));
          }
        },
      });

      if (response.data.success) {
        setUploadState((prev) => ({
          ...prev,
          uploading: false,
          success: true,
          progress: 100,
        }));

        setFilePath(response.data.filePath);

        toast({
          title: "Upload Successful",
          description: `Resume uploaded: ${response.data.filePath}`,
        });

        // Automatically parse the resume after successful upload
        await parseResume(response.data.filePath);
      } else {
        throw new Error(response.data.message || "Upload failed");
      }
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : "Failed to upload resume";

      setUploadState((prev) => ({
        ...prev,
        uploading: false,
        error: errorMessage,
      }));

      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      // Only set drag active if parsing is not in progress
      if (!parseState.parsing) {
        // Can still drag while parsing
      }
    } else if (e.type === "dragleave") {
      // Set drag inactive only if we're not over a child
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const resetUpload = () => {
    setUploadState({
      file: null,
      progress: 0,
      uploading: false,
      success: false,
      error: null,
    });
    setParseState({ parsing: false, text: null, error: null });
    setExtractState({ extracting: false, skills: null, error: null });
    setFilePath(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const copyToClipboard = () => {
    if (parseState.text) {
      navigator.clipboard.writeText(parseState.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied",
        description: "Resume text copied to clipboard",
      });
    }
  };

  return (
    <div className="w-full space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Upload Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Upload Resume</h3>

        <AnimatePresence mode="wait">
          {!uploadState.success || parseState.parsing ? (
            <motion.div
              key="upload-zone"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Drag and Drop Area */}
              <motion.div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-300"
              >
                <AnimatePresence mode="wait">
                  {uploadState.uploading || parseState.parsing ? (
                    <motion.div
                      key="uploading"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <p className="text-sm font-medium">
                        {uploadState.uploading ? "Uploading..." : "Parsing resume..."}
                      </p>
                    </motion.div>
                  ) : uploadState.error ? (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <AlertCircle className="w-8 h-8 text-destructive" />
                      <p className="text-sm font-medium text-destructive">
                        {uploadState.error}
                      </p>
                    </motion.div>
                  ) : uploadState.file && !parseState.text ? (
                    <motion.div
                      key="file-selected"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex flex-col items-center gap-2"
                    >
                      <FileText className="w-8 h-8 text-primary" />
                      <p className="text-sm font-medium">{uploadState.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(uploadState.file.size / 1024).toFixed(2)} KB
                      </p>
                    </motion.div>
                  ) : parseState.text ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex flex-col items-center gap-2"
                    >
                      <CheckCircle className="w-8 h-8 text-green-500" />
                      <p className="text-sm font-medium">Resume parsed successfully!</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          Drag & drop your resume here
                        </p>
                        <p className="text-xs text-muted-foreground">
                          or click to browse
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        PDF or DOCX • Max 5MB
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Progress Bar */}
              <AnimatePresence>
                {uploadState.uploading && uploadState.progress > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium">Upload progress</span>
                      <span className="text-xs text-muted-foreground">
                        {uploadState.progress}%
                      </span>
                    </div>
                    <motion.div
                      className="w-full h-2 bg-secondary rounded-full overflow-hidden"
                    >
                      <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadState.progress}%` }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                      />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Message */}
              <AnimatePresence>
                {uploadState.error && !uploadState.uploading && (
                  <motion.button
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onClick={resetUpload}
                    className="w-full px-4 py-2 text-sm font-medium bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors"
                  >
                    Try Again
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.button
              key="success-btn"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onClick={resetUpload}
              className="w-full px-4 py-3 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Upload Another Resume
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Resume Content Preview */}
      <AnimatePresence>
        {parseState.text && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Resume Content Preview</h3>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-secondary hover:bg-secondary/80 rounded transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Text
                  </>
                )}
              </button>
            </div>

            <div
              ref={textContainerRef}
              className="w-full h-64 bg-secondary/30 border border-border rounded-lg p-4 overflow-y-auto"
            >
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {parseState.text}
                </p>
              </div>
            </div>

            {parseState.error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 rounded-lg bg-destructive/10 border border-destructive/30"
              >
                <p className="text-sm text-destructive">{parseState.error}</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Extracted Skills */}
      <AnimatePresence>
        {extractState.skills && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold">Extracted Skills</h3>
            <SkillBadges skills={extractState.skills} isLoading={extractState.extracting} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResumeUploader;
