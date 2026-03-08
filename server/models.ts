import { ObjectId } from "mongodb";

export interface BehaviorMetrics {
  runAttempts: number;
  compileErrors: number;
  timeToFirstRun: number;
  totalCodingTime: number;
  linesOfCode: number;
  codeChanges: number;
}

export interface AIEvaluationScores {
  problemSolving: number;
  debuggingAbility: number;
  codeQuality: number;
  thinkingClarity: number;
  overall: number;
}

export interface CodingSession {
  _id?: ObjectId;
  candidateId: string;
  challengeId: string;
  submittedCode: string;
  language: string;
  behaviorMetrics: BehaviorMetrics;
  aiEvaluation?: {
    scores: AIEvaluationScores;
    analysisSummary: string;
    strengths: string[];
    weaknesses: string[];
  };
  createdAt: Date;
}
