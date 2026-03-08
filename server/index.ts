import express, { Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import fs from "fs-extra";
import cors from "cors";
import pdf from "pdf-parse";
import { extractRawText } from "mammoth";
import { execSync } from "child_process";
import { randomBytes } from "crypto";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import { connectDB, getDB } from "./db";
import type { CodingSession } from "./models";
import { analyzeCodingBehavior } from "./services/behaviorAnalysis";

// Load environment variables from project root
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Check for required environment variables
if (!process.env.GROQ_API_KEY) {
  console.warn("⚠️  GROQ_API_KEY not set - AI behavior analysis will use fallback mode");
}

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

const app = express();
const PORT = process.env.PORT || 5000;

// Paths relative to project root (server runs from project root via npm script)
const projectRoot = process.cwd();
const uploadDir = path.join(projectRoot, "uploads");
const tempDir = path.join(projectRoot, "temp");

// In-memory storage for analysis data (in production, use a database)
interface AnalysisData {
  logs: any[];
  candidateInfo: any;
  resumeSkills?: any;
  analysis?: any;
  timestamp: string;
}

// In-memory storage for analysis data keyed by interviewId (in production, use a database)
const analysisStore: Record<string, AnalysisData> = {};

// Middleware
app.use(cors());
app.use(express.json());

// Upload directory setup
fs.ensureDirSync(uploadDir);

// Multer configuration
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, uploadDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF and DOCX are allowed."));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Skill Database
const skillDatabase = {
  languages: [
    "JavaScript",
    "TypeScript",
    "Python",
    "Java",
    "C++",
    "C#",
    "Go",
    "Rust",
    "PHP",
    "Ruby",
    "Swift",
    "Kotlin",
    "SQL",
    "HTML",
    "CSS",
    "R",
    "MATLAB",
    "Scala",
    "Perl",
    "Bash",
    "Shell",
    "Groovy",
  ],
  frameworks: [
    "React",
    "Vue",
    "Angular",
    "Next.js",
    "Node.js",
    "Express",
    "Django",
    "Flask",
    "FastAPI",
    "Spring",
    "Laravel",
    "Ruby on Rails",
    "Svelte",
    "Ember",
    "NestJS",
    "Terraform",
    "Kubernetes",
    "GraphQL",
    "REST",
  ],
  tools: [
    "Git",
    "GitHub",
    "GitLab",
    "Docker",
    "Kubernetes",
    "Jenkins",
    "CI/CD",
    "AWS",
    "Azure",
    "GCP",
    "Firebase",
    "Netlify",
    "Heroku",
    "Vercel",
    "ESLint",
    "Webpack",
    "Vite",
    "Babel",
    "npm",
    "yarn",
    "JIRA",
    "Figma",
    "Postman",
    "Slack",
  ],
  databases: [
    "MongoDB",
    "PostgreSQL",
    "MySQL",
    "SQLite",
    "Redis",
    "Elasticsearch",
    "Oracle",
    "SQL Server",
    "Firebase",
    "Firestore",
    "DynamoDB",
    "Cassandra",
    "CouchDB",
    "MariaDB",
  ],
};

/**
 * Extract skills from resume text
 */
function extractSkills(resumeText: string): { [key: string]: string[] } {
  const textLower = resumeText.toLowerCase();
  const extracted: { [key: string]: string[] } = {
    languages: [],
    frameworks: [],
    tools: [],
    databases: [],
  };

  // Extract each category using simple string matching (safer than regex)
  Object.entries(skillDatabase).forEach(([category, skills]) => {
    skills.forEach((skill) => {
      try {
        const skillLower = skill.toLowerCase();
        // Use word boundary check with simple string matching
        const regex = new RegExp(`\\b${skillLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
        if (regex.test(textLower)) {
          extracted[category].push(skill);
        }
      } catch (err) {
        // If regex fails, try simple substring match as fallback
        if (textLower.includes(skill.toLowerCase())) {
          extracted[category].push(skill);
        }
      }
    });
  });

  // Remove duplicates
  Object.keys(extracted).forEach((category) => {
    extracted[category] = [...new Set(extracted[category])];
  });

  return extracted;
}

/**
 * Generate analysis from behavior logs
 */
function generateAnalysis(logs: any[], candidateInfo: any, resumeSkills?: any): any {
  const eventSummary: Record<string, number> = {};
  logs.forEach((log: any) => {
    eventSummary[log.event] = (eventSummary[log.event] || 0) + 1;
  });

  // Calculate metrics
  const compileErrors = eventSummary["compile_error"] || 0;
  const debugAttempts = eventSummary["debug_attempt"] || 0;
  const testRuns = eventSummary["test_run"] || 0;
  const languageChanges = eventSummary["language_change"] || 0;
  
  const elapsedTime = candidateInfo?.elapsedTime || 0;
  const codeEdits = candidateInfo?.codeEdits || 0;
  
  // Calculate time to first code (look for first code_change event)
  const firstCodeEvent = logs.find((log: any) => log.event === "code_change");
  const timeToFirstCode = firstCodeEvent 
    ? Math.floor((new Date(firstCodeEvent.timestamp).getTime() - new Date(logs[0]?.timestamp || Date.now()).getTime()) / 1000)
    : 0;
  
  // Calculate overall score (0-100)
  let score = 50; // Base score
  
  // Penalize for errors and excessive changes
  score -= Math.min(compileErrors * 3, 20);
  score -= Math.min(debugAttempts * 2, 10);
  score -= Math.min(languageChanges * 5, 15);
  
  // Reward for reasonable test runs
  if (testRuns >= 3 && testRuns <= 10) score += 10;
  else if (testRuns > 10) score -= 5;
  
  // Penalize for excessive edits
  if (codeEdits > 50) score -= Math.min((codeEdits - 50) / 5, 15);
  else if (codeEdits >= 20 && codeEdits <= 50) score += 5;
  
  // Reward for reasonable time
  if (elapsedTime >= 60 && elapsedTime <= 600) score += 15;
  else if (elapsedTime > 900) score -= 10;
  
  // Reward for quick start
  if (timeToFirstCode > 0 && timeToFirstCode < 60) score += 10;
  else if (timeToFirstCode > 180) score -= 5;
  
  // Clamp score between 0 and 100
  score = Math.max(0, Math.min(100, score));
  
  // Determine rating
  let rating = "Needs Improvement";
  if (score >= 85) rating = "Excellent Hire";
  else if (score >= 72) rating = "Strong Hire";
  else if (score >= 60) rating = "Moderate Hire";
  else if (score >= 50) rating = "Conditional Hire";
  
  // Generate strengths and weaknesses
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const skillGaps: string[] = [];
  
  if (compileErrors <= 3) strengths.push("Clean code with minimal syntax errors");
  else weaknesses.push(`High number of compile errors (${compileErrors})`);
  
  if (testRuns >= 3 && testRuns <= 8) strengths.push("Good testing methodology");
  else if (testRuns > 10) weaknesses.push("Excessive test runs indicating trial-and-error approach");
  else if (testRuns < 2) weaknesses.push("Insufficient testing before submission");
  
  if (codeEdits <= 30) strengths.push("Efficient implementation with focused edits");
  else if (codeEdits > 50) weaknesses.push("Excessive code changes suggesting unclear approach");
  
  if (timeToFirstCode > 0 && timeToFirstCode < 90) strengths.push("Quick to start coding");
  else if (timeToFirstCode > 180) weaknesses.push("Slow to begin implementation");
  
  if (debugAttempts <= 2) strengths.push("Effective debugging with minimal attempts");
  else if (debugAttempts > 5) weaknesses.push("Multiple debugging attempts indicating struggle");
  
  if (languageChanges > 0) {
    skillGaps.push(`Language uncertainty (switched ${languageChanges} time(s))`);
  }
  
  // Resume skill comparison
  const resumeClaim = resumeSkills?.frameworks?.includes("React") 
    ? "React Expert" 
    : resumeSkills?.languages?.length > 0 
    ? `${resumeSkills.languages[0]} Developer`
    : "Software Developer";
  
  let observedSkill = "Intermediate";
  if (score >= 80) observedSkill = "Advanced";
  else if (score >= 70) observedSkill = "Intermediate+";
  else if (score < 50) observedSkill = "Beginner+";
  
  // Generate skill comparison data
  const skillComparison: Record<string, any> = {};
  const languages = resumeSkills?.languages || ["JavaScript"];
  languages.slice(0, 3).forEach((lang: string) => {
    const observed = score >= 70 ? "Advanced" : score >= 60 ? "Intermediate" : "Beginner";
    skillComparison[lang] = {
      claimed: "Advanced",
      observed: observed,
      confidence: score / 100,
    };
  });
  
  // Radar data
  const radarData = [
    { skill: "Problem Solving", claimed: 85, observed: Math.min(score + 5, 95) },
    { skill: "Code Quality", claimed: 80, observed: Math.max(score - 10, 40) },
    { skill: "Speed", claimed: 75, observed: elapsedTime > 600 ? 50 : Math.min(80, score + 10) },
    { skill: "Debugging", claimed: 70, observed: debugAttempts > 5 ? 50 : 80 },
    { skill: "Edge Cases", claimed: 75, observed: testRuns >= 5 ? 70 : 50 },
    { skill: "Algorithms", claimed: 80, observed: Math.min(score, 85) },
  ];
  
  // Bar data
  const barData = [
    { metric: "Time to First Code", value: Math.max(10, Math.min(100, 100 - timeToFirstCode / 3)), color: "hsl(160, 84%, 39%)" },
    { metric: "Code Edits", value: Math.max(10, 100 - codeEdits), color: "hsl(32, 95%, 55%)" },
    { metric: "Debug Efficiency", value: Math.max(10, 100 - debugAttempts * 10), color: "hsl(340, 82%, 58%)" },
    { metric: "Test Coverage", value: Math.max(10, Math.min(100, testRuns * 12)), color: "hsl(160, 84%, 39%)" },
    { metric: "Solution Quality", value: score, color: "hsl(32, 95%, 55%)" },
  ];
  
  // Recommendations
  const recommendations = `Candidate demonstrates ${rating.toLowerCase()} characteristics with an overall score of ${score}/100. ${
    strengths.length > 0 ? "Key strengths include " + strengths[0].toLowerCase() + ". " : ""
  }${
    weaknesses.length > 0 ? "Areas for improvement: " + weaknesses[0].toLowerCase() + ". " : ""
  }${
    score >= 70 
      ? "Recommended for mid to senior roles with appropriate technical challenges."
      : "May benefit from additional training or mentorship. Consider for junior positions."
  }`;
  
  return {
    overallScore: Math.round(score),
    rating,
    resumeClaim,
    observedSkill,
    strengths,
    weaknesses,
    skillGaps,
    recommendations,
    radarData,
    barData,
    behaviorMetrics: {
      compile_errors: compileErrors,
      debug_attempts: debugAttempts,
      test_runs: testRuns,
      time_to_first_code: `${Math.floor(timeToFirstCode / 60)}m ${timeToFirstCode % 60}s`,
      language_changes: languageChanges,
    },
    skillComparison,
    candidateReport: {
      technical_score: score / 10,
      problem_solving: Math.min(10, score / 10 + (testRuns >= 3 ? 0.5 : -0.5)),
      debugging: Math.max(1, 10 - debugAttempts * 0.5),
      resume_authenticity: Math.min(1, score / 100 + 0.1),
      summary: `Candidate demonstrates ${observedSkill.toLowerCase()} proficiency with a technical score of ${(score / 10).toFixed(1)}/10. ${
        score >= 70 ? "Strong problem-solving skills and clean code organization. " : ""
      }Performance metrics indicate ${
        codeEdits < 30 ? "efficient" : "iterative"
      } development approach. ${
        Math.abs(score - 70) > 15 
          ? `Resume claims may be ${score < 70 ? "slightly optimistic" : "accurate"} based on observed performance.`
          : "Resume claims align reasonably with demonstrated skills."
      }`,
    },
  };
}

/**
 * Enhanced skill extraction using Groq AI
 */
async function extractSkillsWithGroq(resumeText: string): Promise<any> {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert technical recruiter. Extract technical skills from the resume text and categorize them into: languages, frameworks, tools, and databases. Return ONLY valid JSON in this exact format:
{
  "languages": ["skill1", "skill2"],
  "frameworks": ["skill1", "skill2"],
  "tools": ["skill1", "skill2"],
  "databases": ["skill1", "skill2"]
}`,
        },
        {
          role: "user",
          content: `Extract all technical skills from this resume:\n\n${resumeText}`,
        },
      ],
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 1024,
      response_format: { type: "json_object" },
    });

    const result = chatCompletion.choices[0]?.message?.content;
    if (!result) {
      throw new Error("No response from Groq");
    }

    return JSON.parse(result);
  } catch (error) {
    console.error("Groq skill extraction error:", error);
    // Fallback to basic extraction
    return extractSkills(resumeText);
  }
}

/**
 * Enhanced analysis generation using Groq AI
 */
async function generateAnalysisWithGroq(
  logs: any[],
  candidateInfo: any,
  basicAnalysis: any,
  resumeSkills?: any
): Promise<any> {
  try {
    const prompt = `You are an expert technical interviewer analyzing a candidate's actual coding interview performance against their claimed resume skills.

Candidate Profile & Skills (Claimed on Resume):
${JSON.stringify(resumeSkills || {}, null, 2)}

Interview Performance:
- Challenge: ${candidateInfo?.challenge || "Unknown"}
- Time elapsed: ${candidateInfo?.elapsedTime || 0} seconds
- Code edits: ${candidateInfo?.codeEdits || 0}
- Compile errors: ${basicAnalysis.behaviorMetrics.compile_errors}
- Debug attempts: ${basicAnalysis.behaviorMetrics.debug_attempts}
- Test runs: ${basicAnalysis.behaviorMetrics.test_runs}

Candidate's Final Code Submission:
\`\`\`${candidateInfo?.language || "javascript"}
${candidateInfo?.code || "No code submitted."}
\`\`\`

Perform a highly accurate, objective, and deep technical evaluation of their code. Compare the quality of their code to what they claim on their resume. Return ONLY valid JSON in this exact format:
{
  "overallScore": <integer 0-100 indicating their true skill level based on the code quality, logic, and tests>,
  "strengths": ["string", "string"],
  "weaknesses": ["string", "string"],
  "skillGaps": ["string", "string"],
  "recommendations": "Detailed paragraph explaining the candidate's actual proficiency, comparing their code to their resume claims.",
  "hiringDecision": "Strong Hire|Moderate Hire|Conditional Hire|No Hire",
  "resumeClaim": "Short description of what they claim on their resume (e.g. 'React Expert', 'Junior Full-Stack')",
  "observedSkill": "Short description of their true skill from the code (e.g. 'Advanced', 'Intermediate', 'Beginner')",
  "radarData": [
    { "skill": "Problem Solving", "claimed": <0-100 based on resume>, "observed": <0-100 based on code> },
    { "skill": "Code Quality", "claimed": <0-100>, "observed": <0-100> },
    { "skill": "Speed", "claimed": <0-100>, "observed": <0-100> },
    { "skill": "Debugging", "claimed": <0-100>, "observed": <0-100> },
    { "skill": "Edge Cases", "claimed": <0-100>, "observed": <0-100> },
    { "skill": "Algorithms", "claimed": <0-100>, "observed": <0-100> }
  ],
  "candidateReport_summary": "A 2-3 sentence summary evaluating their true skill."
}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert technical interviewer providing objective, data-driven candidate assessments.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 1536,
      response_format: { type: "json_object" },
    });

    const result = chatCompletion.choices[0]?.message?.content;
    if (!result) {
      throw new Error("No response from Groq");
    }

    const groqAnalysis = JSON.parse(result);
    const finalScore = groqAnalysis.overallScore !== undefined ? groqAnalysis.overallScore : basicAnalysis.overallScore;

    // Update skill comparison with new score
    const updatedSkillComparison = { ...basicAnalysis.skillComparison };
    Object.keys(updatedSkillComparison).forEach(lang => {
      const observed = finalScore >= 80 ? "Advanced" : finalScore >= 60 ? "Intermediate" : "Beginner";
      updatedSkillComparison[lang].observed = observed;
      updatedSkillComparison[lang].confidence = finalScore / 100;
    });

    // Update bar data with new score
    const updatedBarData = basicAnalysis.barData.map((data: any) => {
      if (data.metric === "Solution Quality") {
        return { ...data, value: finalScore };
      }
      return data;
    });

    // Merge Groq insights with basic analysis
    return {
      ...basicAnalysis,
      overallScore: finalScore,
      strengths: groqAnalysis.strengths || basicAnalysis.strengths,
      weaknesses: groqAnalysis.weaknesses || basicAnalysis.weaknesses,
      skillGaps: groqAnalysis.skillGaps || basicAnalysis.skillGaps,
      recommendations: groqAnalysis.recommendations || basicAnalysis.recommendations,
      rating: groqAnalysis.hiringDecision || basicAnalysis.rating,
      resumeClaim: groqAnalysis.resumeClaim || basicAnalysis.resumeClaim,
      observedSkill: groqAnalysis.observedSkill || basicAnalysis.observedSkill,
      radarData: groqAnalysis.radarData || basicAnalysis.radarData,
      barData: updatedBarData,
      skillComparison: updatedSkillComparison,
      candidateReport: {
        ...basicAnalysis.candidateReport,
        summary: groqAnalysis.candidateReport_summary || basicAnalysis.candidateReport.summary,
        technical_score: finalScore / 10,
        problem_solving: groqAnalysis.radarData ? groqAnalysis.radarData[0].observed / 10 : basicAnalysis.candidateReport.problem_solving,
      }
    };
  } catch (error) {
    console.error("Groq analysis enhancement error:", error);
    // Return basic analysis as fallback
    return basicAnalysis;
  }
}

// Routes

/**
 * POST /api/resume/upload
 * Accepts a resume file (PDF or DOCX)
 * Returns: { success: boolean, filePath: string, message?: string }
 */
app.post(
  "/api/resume/upload",
  upload.single("resume"),
  (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    try {
      const filePath = `/uploads/${req.file.filename}`;

      return res.json({
        success: true,
        filePath,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        uploadedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Upload error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to upload resume",
      });
    }
  }
);

/**
 * POST /api/parse-resume
 * Extracts text from uploaded resume file
 * Body: { file_path: "/uploads/resume.pdf" }
 * Returns: { text: string, pages?: number }
 */
app.post("/api/parse-resume", async (req: Request, res: Response) => {
  try {
    const { file_path } = req.body;

    if (!file_path) {
      return res.status(400).json({
        success: false,
        message: "file_path is required",
      });
    }

    // Construct full file path from relative path
    const filename = path.basename(file_path);
    const fullPath = path.join(uploadDir, filename);

    // Security: prevent directory traversal
    if (!fullPath.startsWith(uploadDir)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Check if file exists
    if (!(await fs.pathExists(fullPath))) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    let extractedText = "";
    const ext = path.extname(fullPath).toLowerCase();

    if (ext === ".pdf") {
      // Extract text from PDF
      const buffer = await fs.readFile(fullPath);
      const pdfData = await pdf(buffer);
      extractedText = pdfData.text;
    } else if (ext === ".docx") {
      // Extract text from DOCX
      const buffer = await fs.readFile(fullPath);
      const result = await extractRawText({ arrayBuffer: buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) });
      extractedText = result.value;
    } else {
      return res.status(400).json({
        success: false,
        message: "Unsupported file format",
      });
    }

    // Clean up the text
    const cleanedText = extractedText
      .replace(/\s+/g, " ") // Multiple spaces to single space
      .trim();

    res.json({
      success: true,
      text: cleanedText,
      length: cleanedText.length,
    });
  } catch (error) {
    console.error("Parse error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to parse resume",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/extract-skills
 * Extract skills from resume text using Groq AI
 * Body: { resume_text: string }
 * Returns: { success: boolean, languages: [...], frameworks: [...], tools: [...], databases: [...] }
 */
app.post("/api/extract-skills", async (req: Request, res: Response) => {
  try {
    const { resume_text } = req.body;

    if (!resume_text || typeof resume_text !== "string" || resume_text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "resume_text is required and must be a non-empty string",
      });
    }

    // Use Groq-powered extraction for better accuracy
    const skills = await extractSkillsWithGroq(resume_text);

    res.json({
      success: true,
      languages: skills.languages || [],
      frameworks: skills.frameworks || [],
      tools: skills.tools || [],
      databases: skills.databases || [],
    });
  } catch (error) {
    console.error("Skill extraction error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to extract skills",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/run-code
 * Execute Python or JavaScript code
 * Body: { language: "python" | "javascript", code: string }
 * Returns: { success: boolean, tests_passed: number, tests_failed: number, execution_time: string, output?: string, error?: string }
 */
app.post("/api/run-code", async (req: Request, res: Response) => {
  try {
    const { language, code } = req.body;

    if (!language || !code) {
      return res.status(400).json({
        success: false,
        message: "language and code are required",
      });
    }

    if (!["python", "javascript"].includes(language)) {
      return res.status(400).json({
        success: false,
        message: "language must be 'python' or 'javascript'",
      });
    }

    // Create temporary file for code execution
    await fs.ensureDir(tempDir);
    const fileName = `code_${randomBytes(8).toString("hex")}.${language === "python" ? "py" : "js"}`;
    const filePath = path.join(tempDir, fileName);

    const startTime = Date.now();
    let output = "";
    let error = "";
    let testsPassed = 0;
    let testsFailed = 0;

    try {
      // Write code to file
      await fs.writeFile(filePath, code);

      if (language === "python") {
        // Execute Python code
        try {
          const result = execSync(`python "${filePath}" 2>&1`, {
            timeout: 5000,
            encoding: "utf-8",
            maxBuffer: 10 * 1024 * 1024,
          });
          output = result;

          // Simple test result parsing (mock implementation)
          const lines = result.split("\n");
          const passedLine = lines.find((l) => l.includes("passed") || l.includes("PASSED"));
          const failedLine = lines.find((l) => l.includes("failed") || l.includes("FAILED"));

          if (passedLine) {
            const match = passedLine.match(/(\d+)/);
            testsPassed = match ? parseInt(match[1]) : 1;
          } else {
            testsPassed = 1;
          }

          if (failedLine) {
            const match = failedLine.match(/(\d+)/);
            testsFailed = match ? parseInt(match[1]) : 0;
          }
        } catch (pythonError: any) {
          error = pythonError.message || "Python execution error";
          testsFailed = 1;
        }
      } else {
        // Execute JavaScript code with Node.js
        try {
          const result = execSync(`node "${filePath}" 2>&1`, {
            timeout: 5000,
            encoding: "utf-8",
            maxBuffer: 10 * 1024 * 1024,
          });
          output = result;

          // Simple test result parsing (mock implementation)
          const lines = result.split("\n");
          const passedLine = lines.find((l) => l.includes("passed") || l.includes("✓"));
          const failedLine = lines.find((l) => l.includes("failed") || l.includes("✗"));

          if (passedLine) {
            const match = passedLine.match(/(\d+)/);
            testsPassed = match ? parseInt(match[1]) : 1;
          } else {
            testsPassed = 1;
          }

          if (failedLine) {
            const match = failedLine.match(/(\d+)/);
            testsFailed = match ? parseInt(match[1]) : 0;
          }
        } catch (nodeError: any) {
          error = nodeError.message || "Node.js execution error";
          testsFailed = 1;
        }
      }
    } finally {
      // Clean up temporary file
      await fs.remove(filePath).catch(() => {});
    }

    const executionTime = ((Date.now() - startTime) / 1000).toFixed(2) + "s";

    // Return results
    res.json({
      success: error === "" || testsFailed === 0,
      tests_passed: testsPassed,
      tests_failed: testsFailed,
      execution_time: executionTime,
      output: output || undefined,
      error: error || undefined,
    });
  } catch (error) {
    console.error("Code execution error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to execute code",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /uploads/:filename
 * Serve uploaded files
 */
app.get("/uploads/:filename", (req: Request, res: Response) => {
  const filename = req.params.filename;
  const filepath = path.join(uploadDir, filename);

  // Security: prevent directory traversal
  if (!filepath.startsWith(uploadDir)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  res.download(filepath, (err?: Error | null) => {
    if (err) {
      res.status(404).json({ error: "File not found" });
    }
  });
});

/**
 * POST /api/behavior/logs
 * Evaluation pipeline: store session → AI behavior analysis → store results
 * Body: { candidateId, challengeId, submittedCode, behaviorMetrics, logs?, candidateInfo?, resumeSkills? }
 */
app.post("/api/behavior/logs", async (req: Request, res: Response) => {
  try {
    const {
      candidateId,
      challengeId,
      submittedCode,
      language,
      behaviorMetrics,
      logs = [],
      candidateInfo = {},
      resumeSkills,
    } = req.body;

    const interviewId = candidateId || candidateInfo?.interviewId;
    if (!interviewId) {
      return res.status(400).json({
        success: false,
        message: "candidateId or candidateInfo.interviewId is required",
      });
    }

    const metrics = behaviorMetrics || {
      runAttempts: 0,
      compileErrors: 0,
      timeToFirstRun: 0,
      totalCodingTime: candidateInfo?.elapsedTime || 0,
      linesOfCode: 0,
      codeChanges: candidateInfo?.codeEdits || 0,
    };

    console.log("\n📊 BEHAVIOR SUBMISSION");
    console.log("═".repeat(50));
    console.log(`Candidate: ${interviewId}, Challenge: ${challengeId}`);
    console.log(`Behavior: runAttempts=${metrics.runAttempts}, compileErrors=${metrics.compileErrors}`);

    // 1. AI behavior analysis (bias control: only technical data)
    console.log("🤖 Running AI behavior analysis...");
    const aiEvaluation = await analyzeCodingBehavior(submittedCode || candidateInfo?.code || "", metrics);

    const session: Omit<CodingSession, "_id"> = {
      candidateId: interviewId,
      challengeId: challengeId || "unknown",
      submittedCode: submittedCode || candidateInfo?.code || "",
      language: language || candidateInfo?.language || "javascript",
      behaviorMetrics: metrics,
      aiEvaluation: {
        scores: aiEvaluation.scores,
        analysisSummary: aiEvaluation.analysisSummary,
        strengths: aiEvaluation.strengths,
        weaknesses: aiEvaluation.weaknesses,
      },
      createdAt: new Date(),
    };

    try {
      const db = await getDB();
      await db.collection<CodingSession>("coding_sessions").insertOne(session as CodingSession);
    } catch (dbErr) {
      console.warn("MongoDB insert failed, using in-memory only:", dbErr);
    }

    // 2. Generate legacy analysis (for resume comparison if resumeSkills provided)
    let enhancedAnalysis: any;
    if (Array.isArray(logs) && logs.length > 0 && resumeSkills) {
      const basicAnalysis = generateAnalysis(logs, candidateInfo, resumeSkills);
      enhancedAnalysis = await generateAnalysisWithGroq(logs, candidateInfo, basicAnalysis, resumeSkills);
      enhancedAnalysis.overallScore = aiEvaluation.scores.overall;
      enhancedAnalysis.rating =
        aiEvaluation.scores.overall >= 85
          ? "Excellent Hire"
          : aiEvaluation.scores.overall >= 72
          ? "Strong Hire"
          : aiEvaluation.scores.overall >= 60
          ? "Moderate Hire"
          : aiEvaluation.scores.overall >= 50
          ? "Conditional Hire"
          : "Needs Improvement";
    } else {
      enhancedAnalysis = {
        overallScore: aiEvaluation.scores.overall,
        rating:
          aiEvaluation.scores.overall >= 85
            ? "Excellent Hire"
            : aiEvaluation.scores.overall >= 72
            ? "Strong Hire"
            : aiEvaluation.scores.overall >= 60
            ? "Moderate Hire"
            : aiEvaluation.scores.overall >= 50
            ? "Conditional Hire"
            : "Needs Improvement",
        strengths: aiEvaluation.strengths,
        weaknesses: aiEvaluation.weaknesses,
        skillGaps: [],
        recommendations: aiEvaluation.analysisSummary,
        radarData: [
          { skill: "Problem Solving", claimed: 80, observed: aiEvaluation.scores.problemSolving },
          { skill: "Debugging", claimed: 75, observed: aiEvaluation.scores.debuggingAbility },
          { skill: "Code Quality", claimed: 80, observed: aiEvaluation.scores.codeQuality },
          { skill: "Thinking Clarity", claimed: 75, observed: aiEvaluation.scores.thinkingClarity },
        ],
        barData: [
          { metric: "Problem Solving", value: aiEvaluation.scores.problemSolving, color: "hsl(160, 84%, 39%)" },
          { metric: "Debugging", value: aiEvaluation.scores.debuggingAbility, color: "hsl(32, 95%, 55%)" },
          { metric: "Code Quality", value: aiEvaluation.scores.codeQuality, color: "hsl(340, 82%, 58%)" },
          { metric: "Thinking Clarity", value: aiEvaluation.scores.thinkingClarity, color: "hsl(200, 90%, 50%)" },
        ],
        behaviorMetrics: {
          ...metrics,
          compile_errors: metrics.compileErrors,
          debug_attempts: metrics.runAttempts,
          test_runs: metrics.runAttempts,
          time_to_first_code: `${Math.floor(metrics.timeToFirstRun / 60)}m ${metrics.timeToFirstRun % 60}s`,
        },
        candidateReport: {
          technical_score: aiEvaluation.scores.overall / 10,
          problem_solving: aiEvaluation.scores.problemSolving / 10,
          debugging: aiEvaluation.scores.debuggingAbility / 10,
          resume_authenticity: 0.8,
          summary: aiEvaluation.analysisSummary,
        },
        resumeClaim: "Candidate",
        observedSkill: aiEvaluation.scores.overall >= 80 ? "Advanced" : aiEvaluation.scores.overall >= 60 ? "Intermediate" : "Beginner",
      };
    }

    enhancedAnalysis.aiBehaviorScores = aiEvaluation.scores;
    enhancedAnalysis.aiAnalysisSummary = aiEvaluation.analysisSummary;

    analysisStore[interviewId] = {
      logs,
      candidateInfo: { ...candidateInfo, challengeId },
      resumeSkills,
      analysis: enhancedAnalysis,
      timestamp: new Date().toISOString(),
    };

    console.log(`✅ Session stored, AI score: ${aiEvaluation.scores.overall}/100`);

    res.json({
      success: true,
      message: "Session stored and AI evaluation complete",
      analysisGenerated: true,
    });
  } catch (error) {
    console.error("Behavior logging error:", error);
    console.error("Error details:", error instanceof Error ? { message: error.message, stack: error.stack } : error);
    res.status(500).json({
      success: false,
      message: "Failed to process behavior logs",
      error: error instanceof Error ? error.message : "Unknown error",
      details: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.stack : String(error)) : undefined,
    });
  }
});

/**
 * POST /api/behavior/multi-question-logs
 * Submit all answers in a multi-question interview and run combined AI analysis.
 */
app.post("/api/behavior/multi-question-logs", async (req: Request, res: Response) => {
  try {
    const {
      candidateId,
      totalQuestions,
      answersSubmitted,
      answers = [],
      totalTimeSpent = 0,
      submittedAt,
      candidateInfo = {},
    } = req.body;

    const interviewId = candidateId || candidateInfo?.interviewId;
    if (!interviewId) {
      return res.status(400).json({
        success: false,
        message: "candidateId or candidateInfo.interviewId is required",
      });
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "answers array is required and must contain at least one answer",
      });
    }

    const aggregatedMetrics = answers.reduce(
      (acc, answer) => {
        const metrics = answer?.behaviorMetrics || {};
        return {
          runAttempts: acc.runAttempts + (Number(metrics.runAttempts) || 0),
          compileErrors: acc.compileErrors + (Number(metrics.compileErrors) || 0),
          timeToFirstRun: acc.timeToFirstRun + (Number(metrics.timeToFirstRun) || 0),
          totalCodingTime: acc.totalCodingTime + (Number(answer?.timeSpent) || Number(metrics.totalCodingTime) || 0),
          linesOfCode: acc.linesOfCode + (Number(metrics.linesOfCode) || 0),
          codeChanges: acc.codeChanges + (Number(metrics.codeChanges) || 0),
        };
      },
      {
        runAttempts: 0,
        compileErrors: 0,
        timeToFirstRun: 0,
        totalCodingTime: 0,
        linesOfCode: 0,
        codeChanges: 0,
      }
    );

    const submittedCode = answers
      .map((answer) => {
        const questionTitle = answer?.questionTitle || `Question ${answer?.questionId ?? "Unknown"}`;
        const code = answer?.code || "";
        return `// ${questionTitle}\n${code}`;
      })
      .join("\n\n");

    const aiEvaluation = await analyzeCodingBehavior(submittedCode, aggregatedMetrics);

    const session: Omit<CodingSession, "_id"> = {
      candidateId: interviewId,
      challengeId: "multi-question-test",
      submittedCode,
      language: String(answers[0]?.language || "javascript"),
      behaviorMetrics: aggregatedMetrics,
      aiEvaluation: {
        scores: aiEvaluation.scores,
        analysisSummary: aiEvaluation.analysisSummary,
        strengths: aiEvaluation.strengths,
        weaknesses: aiEvaluation.weaknesses,
      },
      createdAt: new Date(),
    };

    try {
      const db = await getDB();
      await db.collection<CodingSession>("coding_sessions").insertOne(session as CodingSession);
    } catch (dbErr) {
      console.warn("MongoDB insert failed, using in-memory only:", dbErr);
    }

    const enhancedAnalysis = {
      overallScore: aiEvaluation.scores.overall,
      rating:
        aiEvaluation.scores.overall >= 85
          ? "Excellent Hire"
          : aiEvaluation.scores.overall >= 72
          ? "Strong Hire"
          : aiEvaluation.scores.overall >= 60
          ? "Moderate Hire"
          : aiEvaluation.scores.overall >= 50
          ? "Conditional Hire"
          : "Needs Improvement",
      strengths: aiEvaluation.strengths,
      weaknesses: aiEvaluation.weaknesses,
      skillGaps: [],
      recommendations: aiEvaluation.analysisSummary,
      radarData: [
        { skill: "Problem Solving", claimed: 80, observed: aiEvaluation.scores.problemSolving },
        { skill: "Debugging", claimed: 75, observed: aiEvaluation.scores.debuggingAbility },
        { skill: "Code Quality", claimed: 80, observed: aiEvaluation.scores.codeQuality },
        { skill: "Thinking Clarity", claimed: 75, observed: aiEvaluation.scores.thinkingClarity },
      ],
      barData: [
        { metric: "Problem Solving", value: aiEvaluation.scores.problemSolving, color: "hsl(160, 84%, 39%)" },
        { metric: "Debugging", value: aiEvaluation.scores.debuggingAbility, color: "hsl(32, 95%, 55%)" },
        { metric: "Code Quality", value: aiEvaluation.scores.codeQuality, color: "hsl(340, 82%, 58%)" },
        { metric: "Thinking Clarity", value: aiEvaluation.scores.thinkingClarity, color: "hsl(200, 90%, 50%)" },
      ],
      behaviorMetrics: {
        ...aggregatedMetrics,
        compile_errors: aggregatedMetrics.compileErrors,
        debug_attempts: aggregatedMetrics.runAttempts,
        test_runs: aggregatedMetrics.runAttempts,
        time_to_first_code: `${Math.floor(aggregatedMetrics.timeToFirstRun / 60)}m ${aggregatedMetrics.timeToFirstRun % 60}s`,
      },
      candidateReport: {
        technical_score: aiEvaluation.scores.overall / 10,
        problem_solving: aiEvaluation.scores.problemSolving / 10,
        debugging: aiEvaluation.scores.debuggingAbility / 10,
        resume_authenticity: 0.8,
        summary: aiEvaluation.analysisSummary,
      },
      resumeClaim: "Candidate",
      observedSkill:
        aiEvaluation.scores.overall >= 80
          ? "Advanced"
          : aiEvaluation.scores.overall >= 60
          ? "Intermediate"
          : "Beginner",
      aiBehaviorScores: aiEvaluation.scores,
      aiAnalysisSummary: aiEvaluation.analysisSummary,
    };

    analysisStore[interviewId] = {
      logs: [],
      candidateInfo: {
        ...candidateInfo,
        challengeId: "multi-question-test",
        totalQuestions: Number(totalQuestions) || answers.length,
        answersSubmitted: Number(answersSubmitted) || answers.length,
        totalTimeSpent: Number(totalTimeSpent) || 0,
        submittedAt: submittedAt || new Date().toISOString(),
      },
      analysis: enhancedAnalysis,
      timestamp: new Date().toISOString(),
    };

    res.json({
      success: true,
      message: "Multi-question session stored and AI evaluation complete",
      analysisGenerated: true,
    });
  } catch (error) {
    console.error("Multi-question behavior logging error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process multi-question behavior logs",
      error: error instanceof Error ? error.message : "Unknown error",
      details:
        process.env.NODE_ENV === "development"
          ? error instanceof Error
            ? error.stack
            : String(error)
          : undefined,
    });
  }
});

/**
 * GET /api/analysis
 * Retrieve analysis data (from memory or MongoDB)
 */
app.get("/api/analysis", async (req: Request, res: Response) => {
  try {
    const interviewId = req.query.interviewId as string;

    if (!interviewId) {
      return res.status(400).json({
        success: false,
        message: "interviewId query parameter is required.",
      });
    }

    let sessionData = analysisStore[interviewId];

    if (!sessionData?.analysis) {
      try {
        const db = await getDB();
        const sessions = db.collection<CodingSession>("coding_sessions");
        const session = await sessions.findOne(
          { candidateId: interviewId },
          { sort: { createdAt: -1 } }
        );
      if (session?.aiEvaluation) {
        const analysis = {
          overallScore: session.aiEvaluation.scores.overall,
          rating:
            session.aiEvaluation.scores.overall >= 85
              ? "Excellent Hire"
              : session.aiEvaluation.scores.overall >= 72
              ? "Strong Hire"
              : session.aiEvaluation.scores.overall >= 60
              ? "Moderate Hire"
              : session.aiEvaluation.scores.overall >= 50
              ? "Conditional Hire"
              : "Needs Improvement",
          strengths: session.aiEvaluation.strengths,
          weaknesses: session.aiEvaluation.weaknesses,
          aiBehaviorScores: session.aiEvaluation.scores,
          aiAnalysisSummary: session.aiEvaluation.analysisSummary,
          behaviorMetrics: {
            compile_errors: session.behaviorMetrics.compileErrors,
            debug_attempts: session.behaviorMetrics.runAttempts,
            test_runs: session.behaviorMetrics.runAttempts,
            time_to_first_code: `${Math.floor(session.behaviorMetrics.timeToFirstRun / 60)}m ${session.behaviorMetrics.timeToFirstRun % 60}s`,
            runAttempts: session.behaviorMetrics.runAttempts,
            compileErrors: session.behaviorMetrics.compileErrors,
            timeToFirstRun: session.behaviorMetrics.timeToFirstRun,
            totalCodingTime: session.behaviorMetrics.totalCodingTime,
            linesOfCode: session.behaviorMetrics.linesOfCode,
            codeChanges: session.behaviorMetrics.codeChanges,
          },
          radarData: [
            { skill: "Problem Solving", claimed: 80, observed: session.aiEvaluation.scores.problemSolving },
            { skill: "Debugging", claimed: 75, observed: session.aiEvaluation.scores.debuggingAbility },
            { skill: "Code Quality", claimed: 80, observed: session.aiEvaluation.scores.codeQuality },
            { skill: "Thinking Clarity", claimed: 75, observed: session.aiEvaluation.scores.thinkingClarity },
          ],
          barData: [
            { metric: "Problem Solving", value: session.aiEvaluation.scores.problemSolving, color: "hsl(160, 84%, 39%)" },
            { metric: "Debugging", value: session.aiEvaluation.scores.debuggingAbility, color: "hsl(32, 95%, 55%)" },
            { metric: "Code Quality", value: session.aiEvaluation.scores.codeQuality, color: "hsl(340, 82%, 58%)" },
            { metric: "Thinking Clarity", value: session.aiEvaluation.scores.thinkingClarity, color: "hsl(200, 90%, 50%)" },
          ],
          candidateReport: {
            technical_score: session.aiEvaluation.scores.overall / 10,
            problem_solving: session.aiEvaluation.scores.problemSolving / 10,
            debugging: session.aiEvaluation.scores.debuggingAbility / 10,
            summary: session.aiEvaluation.analysisSummary,
          },
        };
        sessionData = {
          logs: [],
          candidateInfo: { challenge: session.challengeId, code: session.submittedCode },
          analysis,
          timestamp: session.createdAt.toISOString(),
        };
        }
      } catch (_) {
        // MongoDB not available
      }
    }

    if (!sessionData?.analysis) {
      return res.status(404).json({
        success: false,
        message: "No analysis data available for this session. Please complete a coding interview first.",
      });
    }

    res.json({
      success: true,
      analysis: sessionData.analysis,
      timestamp: sessionData.timestamp,
      candidateInfo: sessionData.candidateInfo,
    });
  } catch (error) {
    console.error("Analysis retrieval error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve analysis",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/evaluations
 * List all coding session evaluations for recruiter dashboard
 */
app.get("/api/evaluations", async (req: Request, res: Response) => {
  try {
    let list: CodingSession[] = [];
    try {
      const db = await getDB();
      list = await db
        .collection<CodingSession>("coding_sessions")
        .find({})
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray();
    } catch (_) {
      // MongoDB not available - return in-memory sessions
      list = Object.entries(analysisStore).map(([candidateId, data]) => ({
        candidateId,
        challengeId: data.candidateInfo?.challengeId || "unknown",
        submittedCode: "",
        language: "javascript",
        behaviorMetrics: data.analysis?.behaviorMetrics || {
          runAttempts: 0,
          compileErrors: 0,
          timeToFirstRun: 0,
          totalCodingTime: 0,
          linesOfCode: 0,
          codeChanges: 0,
        },
        aiEvaluation: data.analysis?.aiBehaviorScores
          ? {
              scores: data.analysis.aiBehaviorScores,
              analysisSummary: data.analysis.aiAnalysisSummary || "",
              strengths: data.analysis.strengths || [],
              weaknesses: data.analysis.weaknesses || [],
            }
          : undefined,
        createdAt: new Date(data.timestamp),
      })) as CodingSession[];
    }

    const evaluations = list.map((s) => ({
      id: s._id?.toString(),
      candidateId: s.candidateId,
      challengeId: s.challengeId,
      submittedCode: s.submittedCode?.slice(0, 500),
      behaviorMetrics: s.behaviorMetrics,
      aiEvaluation: s.aiEvaluation,
      createdAt: s.createdAt,
    }));

    res.json({ success: true, evaluations });
  } catch (error) {
    console.error("Evaluations retrieval error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve evaluations",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Health check endpoint
 */
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(
  (
    err: any,
    req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    console.error("Error:", err);

    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File size exceeds 5MB limit",
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    if (err.message) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
);

// ===== RECRUITER & CANDIDATE TEST MANAGEMENT =====

// In-memory storage for candidate tests (in production, use database)
const candidateTests: Map<string, any> = new Map();

/**
 * POST /api/recruiter/create-test
 * Create a new candidate test
 */
app.post("/api/recruiter/create-test", async (req: Request, res: Response) => {
  try {
    const { testId, name, email, password, challenge, difficulty, status, createdAt } = req.body;

    if (!testId || !name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const testData = {
      id: testId,
      testId,
      name,
      email,
      password,
      challenge,
      difficulty,
      status: status || "Pending",
      createdAt: createdAt || new Date().toISOString(),
    };

    candidateTests.set(testId, testData);

    // Try to save to MongoDB
    try {
      const db = await getDB();
      await db.collection("candidate_tests").insertOne(testData);
    } catch (dbErr) {
      console.warn("MongoDB insert failed, using in-memory only:", dbErr);
    }

    res.json({
      success: true,
      test: testData,
      message: "Test created successfully",
    });
  } catch (error) {
    console.error("Create test error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create test",
    });
  }
});

/**
 * GET /api/recruiter/tests
 * Get all candidate tests
 */
app.get("/api/recruiter/tests", async (req: Request, res: Response) => {
  try {
    let tests: any[] = [];

    // Try to fetch from MongoDB first
    try {
      const db = await getDB();
      tests = await db.collection("candidate_tests").find({}).sort({ createdAt: -1 }).toArray();
    } catch (dbErr) {
      console.warn("MongoDB fetch failed, using in-memory:", dbErr);
      tests = Array.from(candidateTests.values());
    }

    res.json({
      success: true,
      tests,
    });
  } catch (error) {
    console.error("Get tests error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tests",
    });
  }
});

/**
 * POST /api/candidate/login
 * Verify candidate credentials and return test data
 */
app.post("/api/candidate/login", async (req: Request, res: Response) => {
  try {
    const { email, password, testId } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Try to find test in MongoDB first
    let test: any = null;
    try {
      const db = await getDB();
      if (testId) {
        test = await db.collection("candidate_tests").findOne({ testId, email, password });
      } else {
        test = await db.collection("candidate_tests").findOne({ email, password });
      }
    } catch (dbErr) {
      console.warn("MongoDB fetch failed, trying in-memory:", dbErr);
    }

    // Fallback to in-memory storage
    if (!test) {
      for (const [key, value] of candidateTests.entries()) {
        if (value.email === email && value.password === password) {
          if (!testId || value.testId === testId) {
            test = value;
            break;
          }
        }
      }
    }

    if (!test) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Update test status to In Progress
    test.status = "In Progress";
    candidateTests.set(test.testId, test);
    
    try {
      const db = await getDB();
      await db.collection("candidate_tests").updateOne(
        { testId: test.testId },
        { $set: { status: "In Progress" } }
      );
    } catch (dbErr) {
      console.warn("MongoDB update failed");
    }

    res.json({
      success: true,
      candidate: {
        testId: test.testId,
        name: test.name,
        email: test.email,
        challenge: test.challenge,
        difficulty: test.difficulty,
      },
    });
  } catch (error) {
    console.error("Candidate login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
});

async function startServer() {
  try {
    await connectDB();
  } catch (err) {
    console.warn("MongoDB connection failed. Session storage disabled. Set MONGODB_URI in .env");
  }
  app.listen(PORT, () => {
    console.log(`Resume API server running on http://localhost:${PORT}`);
    console.log(`Uploads directory: ${uploadDir}`);
  });
}

startServer();
