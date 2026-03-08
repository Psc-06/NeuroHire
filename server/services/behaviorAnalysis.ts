import Groq from "groq-sdk";
import type { BehaviorMetrics } from "../models";

function getGroq() {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is required for AI behavior analysis");
  return new Groq({ apiKey: key });
}

export interface AIBehaviorEvaluation {
  scores: {
    problemSolving: number;
    debuggingAbility: number;
    codeQuality: number;
    thinkingClarity: number;
    overall: number;
  };
  analysisSummary: string;
  strengths: string[];
  weaknesses: string[];
}

/**
 * AI behavior analysis service.
 * BIAS CONTROL: Only receives technical data - no personal information.
 */
export async function analyzeCodingBehavior(
  submittedCode: string,
  behaviorMetrics: BehaviorMetrics
): Promise<AIBehaviorEvaluation> {
  const prompt = `You are an expert technical interviewer evaluating a candidate's coding behavior. Analyze ONLY the technical data provided.

## Technical Data (no personal information)

### Behavior Metrics:
- runAttempts: ${behaviorMetrics.runAttempts}
- compileErrors: ${behaviorMetrics.compileErrors}
- timeToFirstRun: ${behaviorMetrics.timeToFirstRun} seconds (from session start to first run)
- totalCodingTime: ${behaviorMetrics.totalCodingTime} seconds
- linesOfCode: ${behaviorMetrics.linesOfCode}
- codeChanges: ${behaviorMetrics.codeChanges}

### Submitted Code:
\`\`\`
${submittedCode.slice(0, 4000)}
\`\`\`

## Your Task
Evaluate how the candidate approached the problem based on their behavior and code. Focus on:
1. **Problem solving ability** - Did they understand the problem? Logical approach?
2. **Debugging patterns** - How they handled errors (compile errors, run attempts)
3. **Coding efficiency** - Time to first run, code changes, lines of code
4. **Thinking clarity** - Code structure, incremental progress

Return ONLY valid JSON in this exact format (scores 0-100):
{
  "problemSolving": <0-100>,
  "debuggingAbility": <0-100>,
  "codeQuality": <0-100>,
  "thinkingClarity": <0-100>,
  "analysisSummary": "2-4 sentences describing how the candidate approached the problem, their technical behavior, and overall approach. Focus on process, not correctness.",
  "strengths": ["string", "string", "string"],
  "weaknesses": ["string", "string"]
}`;

  try {
    const groq = getGroq();
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You evaluate coding behavior objectively. Return only valid JSON. No personal information in your response.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      temperature: 0.4,
      max_tokens: 1024,
      response_format: { type: "json_object" },
    });

    const result = chatCompletion.choices[0]?.message?.content;
    if (!result) throw new Error("No response from AI");

    const parsed = JSON.parse(result);

    const problemSolving = Math.min(100, Math.max(0, Number(parsed.problemSolving) || 50));
    const debuggingAbility = Math.min(100, Math.max(0, Number(parsed.debuggingAbility) || 50));
    const codeQuality = Math.min(100, Math.max(0, Number(parsed.codeQuality) || 50));
    const thinkingClarity = Math.min(100, Math.max(0, Number(parsed.thinkingClarity) || 50));
    const overall = Math.round((problemSolving + debuggingAbility + codeQuality + thinkingClarity) / 4);

    return {
      scores: {
        problemSolving,
        debuggingAbility,
        codeQuality,
        thinkingClarity,
        overall,
      },
      analysisSummary: String(parsed.analysisSummary || "Analysis pending."),
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
    };
  } catch (error) {
    console.error("AI behavior analysis error:", error);
    return {
      scores: {
        problemSolving: 50,
        debuggingAbility: 50,
        codeQuality: 50,
        thinkingClarity: 50,
        overall: 50,
      },
      analysisSummary: "AI evaluation unavailable. Basic metrics only.",
      strengths: [],
      weaknesses: [],
    };
  }
}
