/**
 * Metrics Calculation Module
 *
 * Tracks development metrics and velocity using Git history for timestamps.
 * Implements DORA metrics, SPACE framework, and cycle time tracking.
 *
 * ⚠️ CRITICAL: This module avoids velocity-as-performance metrics.
 * Focus is on cycle time, quality, and process improvement.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import { parseTasksContent } from './taskParser.js';

const execAsync = promisify(exec);

export interface DORAMetrics {
  deploymentFrequency: {
    specsPerWeek: number;
    plansPerWeek: number;
    tasksPerWeek: number;
    rating: 'Elite' | 'High' | 'Medium' | 'Low';
  };
  leadTimeForChanges: {
    averageDays: number;
    medianDays: number;
    p95Days: number;
    rating: 'Elite' | 'High' | 'Medium' | 'Low';
  };
  changeFailureRate: {
    specValidationFailures: number;
    totalSpecs: number;
    failureRate: number;
    rating: 'Elite' | 'High' | 'Medium' | 'Low';
  };
  timeToRestoreService: {
    applicable: false;
    reason: 'Not applicable for spec-driven development (no service outages)';
  };
}

export interface SPACEMetrics {
  satisfaction: {
    applicable: false;
    reason: 'Survey data not collected automatically';
  };
  performance: {
    specCompletionRate: number;
    validationPassRate: number;
  };
  activity: {
    specsCreated: number;
    plansCreated: number;
    tasksCreated: number;
    clarificationsResolved: number;
  };
  communication: {
    averageClarificationResolutionDays: number;
    totalClarifications: number;
  };
  efficiency: {
    averageSpecToPlanDays: number;
    averagePlanToTaskDays: number;
    averageTaskCompletionDays: number;
  };
}

export interface CycleTimeMetrics {
  spec: {
    averageDays: number;
    medianDays: number;
    p95Days: number;
  };
  plan: {
    averageDays: number;
    medianDays: number;
    p95Days: number;
  };
  task: {
    averageDays: number;
    medianDays: number;
    p95Days: number;
  };
  overall: {
    averageDays: number;
    medianDays: number;
    p95Days: number;
  };
}

export interface TrendAnalysis {
  cycleTime: {
    current7DayMA: number;
    previous7DayMA: number;
    percentChange: number;
    trend: 'improving' | 'declining' | 'stable';
  };
  throughput: {
    currentWeekTasks: number;
    previousWeekTasks: number;
    percentChange: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  quality: {
    currentWeekPassRate: number;
    previousWeekPassRate: number;
    percentChange: number;
    trend: 'improving' | 'declining' | 'stable';
  };
}

export interface BurndownChart {
  ideal: number[];
  actual: number[];
  remaining: number;
  projectedCompletionDate: string;
  confidenceInterval: {
    earliest: string;
    latest: string;
  };
}

export interface QualityMetrics {
  specValidationPassRate: number;
  averageClarificationsPerSpec: number;
  specRefinementFrequency: number;
  acceptanceCriteriaCoverage: number;
}

export interface MetricsReport {
  generatedAt: string;
  period: {
    start: string;
    end: string;
    days: number;
  };
  dora: DORAMetrics;
  space: SPACEMetrics;
  cycleTime: CycleTimeMetrics;
  trends: TrendAnalysis;
  quality: QualityMetrics;
  burndown: BurndownChart;
  velocityWarning: string;
}

/**
 * Get creation timestamp for a file using Git history
 */
export async function getFileCreationTime(workspacePath: string, filePath: string): Promise<Date | null> {
  try {
    // Get first commit time for file (creation time)
    const { stdout } = await execAsync(
      `git log --follow --diff-filter=A --format=%aI -- "${filePath}"`,
      { cwd: workspacePath }
    );

    const timestamps = stdout.trim().split('\n').filter(Boolean);
    if (timestamps.length === 0) {
      return null;
    }

    // Return oldest timestamp (last in log)
    return new Date(timestamps[timestamps.length - 1]);
  } catch {
    return null;
  }
}

/**
 * Get last modification timestamp for a file using Git history
 */
export async function getFileModificationTime(workspacePath: string, filePath: string): Promise<Date | null> {
  try {
    const { stdout } = await execAsync(
      `git log --format=%aI -1 -- "${filePath}"`,
      { cwd: workspacePath }
    );

    const timestamp = stdout.trim();
    return timestamp ? new Date(timestamp) : null;
  } catch {
    return null;
  }
}

/**
 * Get task completion timestamp from Git history
 * Finds the commit where task status changed to completed
 */
export async function getTaskCompletionTime(
  workspacePath: string,
  tasksFilePath: string,
  taskId: string
): Promise<Date | null> {
  try {
    // Get all commits for tasks file
    const { stdout } = await execAsync(
      `git log --format=%H|%aI --follow -- "${tasksFilePath}"`,
      { cwd: workspacePath }
    );

    const commits = stdout.trim().split('\n').map(line => {
      const [hash, timestamp] = line.split('|');
      return { hash, timestamp };
    });

    // Check each commit to find when task was marked completed
    for (const commit of commits) {
      try {
        const { stdout: content } = await execAsync(
          `git show ${commit.hash}:"${tasksFilePath}"`,
          { cwd: workspacePath }
        );

        const tasks = parseTasksContent(content);
        const task = tasks.find(t => t.id === taskId);

        if (task && task.status === 'completed') {
          return new Date(commit.timestamp);
        }
      } catch {
        // Commit may not have this file yet, continue
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Calculate statistics for an array of numbers
 */
function calculateStats(values: number[]): { average: number; median: number; p95: number } {
  if (values.length === 0) {
    return { average: 0, median: 0, p95: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const average = values.reduce((sum, v) => sum + v, 0) / values.length;
  const median = sorted[Math.floor(sorted.length / 2)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];

  return { average, median, p95 };
}

/**
 * Calculate days between two dates
 */
function daysBetween(start: Date, end: Date): number {
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
}

/**
 * Rate DORA deployment frequency
 */
function rateDeploymentFrequency(deploymentsPerDay: number): 'Elite' | 'High' | 'Medium' | 'Low' {
  if (deploymentsPerDay >= 1) {
    return 'Elite';
  }
  if (deploymentsPerDay >= 1 / 7) {
    return 'High'; // Once per week
  }
  if (deploymentsPerDay >= 1 / 30) {
    return 'Medium'; // Once per month
  }
  return 'Low';
}

/**
 * Rate DORA lead time
 */
function rateLeadTime(days: number): 'Elite' | 'High' | 'Medium' | 'Low' {
  if (days < 1) {
    return 'Elite';
  }
  if (days < 7) {
    return 'High';
  }
  if (days < 30) {
    return 'Medium';
  }
  return 'Low';
}

/**
 * Rate DORA change failure rate
 */
function rateChangeFailureRate(rate: number): 'Elite' | 'High' | 'Medium' | 'Low' {
  if (rate < 0.05) {
    return 'Elite'; // < 5%
  }
  if (rate < 0.10) {
    return 'High'; // < 10%
  }
  if (rate < 0.15) {
    return 'Medium'; // < 15%
  }
  return 'Low';
}

/**
 * Calculate DORA metrics
 */
export async function calculateDORAMetrics(
  workspacePath: string,
  startDate: Date,
  endDate: Date
): Promise<DORAMetrics> {
  // Find all spec, plan, and task files created in period
  const dincoderDir = path.join(workspacePath, '.dincoder');

  // Get all relevant files
  const specFiles: string[] = [];
  const planFiles: string[] = [];
  const taskFiles: string[] = [];

  try {
    // Find spec files
    const specDirs = ['specs', '.dincoder'];
    for (const dir of specDirs) {
      const dirPath = path.join(workspacePath, dir);
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isFile() && entry.name === 'spec.md') {
            specFiles.push(path.join(dirPath, entry.name));
          } else if (entry.isDirectory() && /^\d{3}-/.test(entry.name)) {
            const specPath = path.join(dirPath, entry.name, 'spec.md');
            try {
              await fs.access(specPath);
              specFiles.push(specPath);
            } catch {
              // File doesn't exist
            }
          }
        }
      } catch {
        // Directory doesn't exist
      }
    }

    // Find plan files
    const planPath = path.join(dincoderDir, 'plan.md');
    try {
      await fs.access(planPath);
      planFiles.push(planPath);
    } catch {
      // File doesn't exist
    }

    // Find task files
    const tasksPath = path.join(dincoderDir, 'tasks.md');
    try {
      await fs.access(tasksPath);
      taskFiles.push(tasksPath);
    } catch {
      // File doesn't exist
    }
  } catch {
    // Error reading directories
  }

  // Count completions in period
  let specsCompleted = 0;
  let plansCompleted = 0;
  let tasksCompleted = 0;

  const leadTimes: number[] = [];

  for (const file of specFiles) {
    const createdAt = await getFileCreationTime(workspacePath, file);
    const modifiedAt = await getFileModificationTime(workspacePath, file);

    if (createdAt && modifiedAt && modifiedAt >= startDate && modifiedAt <= endDate) {
      specsCompleted++;
      leadTimes.push(daysBetween(createdAt, modifiedAt));
    }
  }

  for (const file of planFiles) {
    const createdAt = await getFileCreationTime(workspacePath, file);
    const modifiedAt = await getFileModificationTime(workspacePath, file);

    if (createdAt && modifiedAt && modifiedAt >= startDate && modifiedAt <= endDate) {
      plansCompleted++;
    }
  }

  // Count completed tasks
  for (const file of taskFiles) {
    const content = await fs.readFile(file, 'utf-8');
    const tasks = parseTasksContent(content);

    for (const task of tasks) {
      if (task.status === 'completed') {
        const completedAt = await getTaskCompletionTime(workspacePath, file, task.id);
        if (completedAt && completedAt >= startDate && completedAt <= endDate) {
          tasksCompleted++;
        }
      }
    }
  }

  const periodDays = daysBetween(startDate, endDate);
  const periodWeeks = periodDays / 7;

  // Calculate deployment frequency (specs/plans/tasks per week)
  const specsPerWeek = specsCompleted / periodWeeks;
  const plansPerWeek = plansCompleted / periodWeeks;
  const tasksPerWeek = tasksCompleted / periodWeeks;

  // Use tasks per day as deployment frequency metric
  const deploymentsPerDay = tasksCompleted / periodDays;

  // Calculate lead time statistics
  const leadTimeStats = calculateStats(leadTimes);

  return {
    deploymentFrequency: {
      specsPerWeek,
      plansPerWeek,
      tasksPerWeek,
      rating: rateDeploymentFrequency(deploymentsPerDay),
    },
    leadTimeForChanges: {
      averageDays: leadTimeStats.average,
      medianDays: leadTimeStats.median,
      p95Days: leadTimeStats.p95,
      rating: rateLeadTime(leadTimeStats.median),
    },
    changeFailureRate: {
      specValidationFailures: 0, // TODO: Track validation failures
      totalSpecs: specsCompleted,
      failureRate: 0,
      rating: rateChangeFailureRate(0),
    },
    timeToRestoreService: {
      applicable: false,
      reason: 'Not applicable for spec-driven development (no service outages)',
    },
  };
}

/**
 * Generate comprehensive metrics report
 */
export async function generateMetricsReport(
  workspacePath: string,
  startDate?: Date,
  endDate?: Date
): Promise<MetricsReport> {
  const now = new Date();
  const start = startDate || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Default: last 30 days
  const end = endDate || now;

  // Calculate all metrics
  const dora = await calculateDORAMetrics(workspacePath, start, end);

  // Placeholder implementations for other metrics
  // TODO: Implement full SPACE, cycle time, trends, quality, and burndown
  const space: SPACEMetrics = {
    satisfaction: {
      applicable: false,
      reason: 'Survey data not collected automatically',
    },
    performance: {
      specCompletionRate: 0,
      validationPassRate: 0,
    },
    activity: {
      specsCreated: 0,
      plansCreated: 0,
      tasksCreated: 0,
      clarificationsResolved: 0,
    },
    communication: {
      averageClarificationResolutionDays: 0,
      totalClarifications: 0,
    },
    efficiency: {
      averageSpecToPlanDays: 0,
      averagePlanToTaskDays: 0,
      averageTaskCompletionDays: 0,
    },
  };

  const cycleTime: CycleTimeMetrics = {
    spec: { averageDays: 0, medianDays: 0, p95Days: 0 },
    plan: { averageDays: 0, medianDays: 0, p95Days: 0 },
    task: { averageDays: 0, medianDays: 0, p95Days: 0 },
    overall: { averageDays: 0, medianDays: 0, p95Days: 0 },
  };

  const trends: TrendAnalysis = {
    cycleTime: {
      current7DayMA: 0,
      previous7DayMA: 0,
      percentChange: 0,
      trend: 'stable',
    },
    throughput: {
      currentWeekTasks: 0,
      previousWeekTasks: 0,
      percentChange: 0,
      trend: 'stable',
    },
    quality: {
      currentWeekPassRate: 0,
      previousWeekPassRate: 0,
      percentChange: 0,
      trend: 'stable',
    },
  };

  const quality: QualityMetrics = {
    specValidationPassRate: 0,
    averageClarificationsPerSpec: 0,
    specRefinementFrequency: 0,
    acceptanceCriteriaCoverage: 0,
  };

  const burndown: BurndownChart = {
    ideal: [],
    actual: [],
    remaining: 0,
    projectedCompletionDate: '',
    confidenceInterval: {
      earliest: '',
      latest: '',
    },
  };

  return {
    generatedAt: now.toISOString(),
    period: {
      start: start.toISOString(),
      end: end.toISOString(),
      days: daysBetween(start, end),
    },
    dora,
    space,
    cycleTime,
    trends,
    quality,
    burndown,
    velocityWarning: '⚠️ IMPORTANT: Velocity should never be used as a performance metric. Focus on cycle time, lead time, and quality metrics instead. High velocity with poor quality indicates process problems, not team performance.',
  };
}
