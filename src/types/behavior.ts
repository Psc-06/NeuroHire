/**
 * Behavior metrics tracked during coding session.
 * Technical data only - no personal information.
 */
export interface BehaviorMetrics {
  runAttempts: number;
  compileErrors: number;
  timeToFirstRun: number; // seconds from session start to first run
  totalCodingTime: number; // seconds
  linesOfCode: number;
  codeChanges: number;
}
