import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import { resolveWorkspacePath } from './workspace.js';
import { generateMetricsReport, type MetricsReport } from '../speckit/metrics.js';

/**
 * Metrics & Velocity Tracking Tools
 *
 * Tracks development metrics aligned with DORA and SPACE frameworks.
 * Uses Git history for reliable timestamp tracking.
 *
 * ⚠️ CRITICAL: Avoids velocity-as-performance metric trap.
 */

// Schema for metrics_report tool
export const MetricsReportSchema = z.object({
  workspacePath: z.string().optional().describe('Workspace directory path'),
  startDate: z.string().optional().describe('Start date (ISO 8601 format, defaults to 30 days ago)'),
  endDate: z.string().optional().describe('End date (ISO 8601 format, defaults to now)'),
  format: z.enum(['json', 'markdown']).default('json').describe('Output format'),
});

// Schema for metrics_export tool
export const MetricsExportSchema = z.object({
  workspacePath: z.string().optional().describe('Workspace directory path'),
  outputPath: z.string().describe('Output file path for export (e.g., metrics.csv or metrics.json)'),
  format: z.enum(['csv', 'json']).describe('Export format'),
  startDate: z.string().optional().describe('Start date (ISO 8601 format, defaults to 30 days ago)'),
  endDate: z.string().optional().describe('End date (ISO 8601 format, defaults to now)'),
});

export interface MetricsReportResult {
  success: boolean;
  report: MetricsReport;
  formattedReport?: string;
  message: string;
}

export interface MetricsExportResult {
  success: boolean;
  outputPath: string;
  format: string;
  rowCount: number;
  message: string;
}

/**
 * Generate metrics report
 */
export async function metricsReport(
  params: z.infer<typeof MetricsReportSchema>
): Promise<MetricsReportResult> {
  const { workspacePath, startDate, endDate, format } = params;

  const resolvedPath = resolveWorkspacePath(workspacePath);

  try {
    // Parse dates if provided
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    // Generate metrics report
    const report = await generateMetricsReport(resolvedPath, start, end);

    // Format report based on requested format
    let formattedReport: string | undefined;
    if (format === 'markdown') {
      formattedReport = formatReportAsMarkdown(report);
    }

    return {
      success: true,
      report,
      formattedReport,
      message: `Generated metrics report for ${report.period.days} days`,
    };
  } catch (error) {
    throw new Error(`Failed to generate metrics report: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Export metrics to CSV or JSON
 */
export async function metricsExport(
  params: z.infer<typeof MetricsExportSchema>
): Promise<MetricsExportResult> {
  const { workspacePath, outputPath, format, startDate, endDate } = params;

  const resolvedPath = resolveWorkspacePath(workspacePath);

  try {
    // Parse dates if provided
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    // Generate metrics report
    const report = await generateMetricsReport(resolvedPath, start, end);

    // Resolve output path
    const absoluteOutputPath = path.isAbsolute(outputPath)
      ? outputPath
      : path.resolve(resolvedPath, outputPath);

    // Ensure parent directory exists
    await fs.mkdir(path.dirname(absoluteOutputPath), { recursive: true });

    let rowCount = 0;

    // Export based on format
    if (format === 'csv') {
      const csv = formatReportAsCSV(report);
      await fs.writeFile(absoluteOutputPath, csv, 'utf-8');
      rowCount = csv.split('\n').length - 1; // Subtract header row
    } else {
      const json = JSON.stringify(report, null, 2);
      await fs.writeFile(absoluteOutputPath, json, 'utf-8');
      rowCount = 1; // One JSON object
    }

    return {
      success: true,
      outputPath: absoluteOutputPath,
      format,
      rowCount,
      message: `Exported metrics to ${format.toUpperCase()} at ${absoluteOutputPath}`,
    };
  } catch (error) {
    throw new Error(`Failed to export metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Format metrics report as Markdown
 */
function formatReportAsMarkdown(report: MetricsReport): string {
  const { period, dora, space, cycleTime, trends, quality, burndown, velocityWarning } = report;

  let md = `# Metrics Report\n\n`;
  md += `**Generated:** ${new Date(report.generatedAt).toLocaleString()}\n`;
  md += `**Period:** ${new Date(period.start).toLocaleDateString()} - ${new Date(period.end).toLocaleDateString()} (${period.days} days)\n\n`;

  // DORA Metrics
  md += `## DORA Metrics\n\n`;

  md += `### Deployment Frequency: ${dora.deploymentFrequency.rating}\n`;
  md += `- Specs/week: ${dora.deploymentFrequency.specsPerWeek.toFixed(2)}\n`;
  md += `- Plans/week: ${dora.deploymentFrequency.plansPerWeek.toFixed(2)}\n`;
  md += `- Tasks/week: ${dora.deploymentFrequency.tasksPerWeek.toFixed(2)}\n\n`;

  md += `### Lead Time for Changes: ${dora.leadTimeForChanges.rating}\n`;
  md += `- Average: ${dora.leadTimeForChanges.averageDays.toFixed(2)} days\n`;
  md += `- Median: ${dora.leadTimeForChanges.medianDays.toFixed(2)} days\n`;
  md += `- P95: ${dora.leadTimeForChanges.p95Days.toFixed(2)} days\n\n`;

  md += `### Change Failure Rate: ${dora.changeFailureRate.rating}\n`;
  md += `- Failures: ${dora.changeFailureRate.specValidationFailures}\n`;
  md += `- Total: ${dora.changeFailureRate.totalSpecs}\n`;
  md += `- Rate: ${(dora.changeFailureRate.failureRate * 100).toFixed(2)}%\n\n`;

  md += `### Time to Restore Service\n`;
  md += `- ${dora.timeToRestoreService.reason}\n\n`;

  // SPACE Metrics
  md += `## SPACE Metrics\n\n`;

  md += `### Performance\n`;
  md += `- Spec completion rate: ${(space.performance.specCompletionRate * 100).toFixed(2)}%\n`;
  md += `- Validation pass rate: ${(space.performance.validationPassRate * 100).toFixed(2)}%\n\n`;

  md += `### Activity\n`;
  md += `- Specs created: ${space.activity.specsCreated}\n`;
  md += `- Plans created: ${space.activity.plansCreated}\n`;
  md += `- Tasks created: ${space.activity.tasksCreated}\n`;
  md += `- Clarifications resolved: ${space.activity.clarificationsResolved}\n\n`;

  md += `### Communication\n`;
  md += `- Average clarification resolution: ${space.communication.averageClarificationResolutionDays.toFixed(2)} days\n`;
  md += `- Total clarifications: ${space.communication.totalClarifications}\n\n`;

  md += `### Efficiency\n`;
  md += `- Spec to plan: ${space.efficiency.averageSpecToPlanDays.toFixed(2)} days\n`;
  md += `- Plan to task: ${space.efficiency.averagePlanToTaskDays.toFixed(2)} days\n`;
  md += `- Task completion: ${space.efficiency.averageTaskCompletionDays.toFixed(2)} days\n\n`;

  // Cycle Time
  md += `## Cycle Time Metrics\n\n`;

  md += `### Spec Cycle Time\n`;
  md += `- Average: ${cycleTime.spec.averageDays.toFixed(2)} days\n`;
  md += `- Median: ${cycleTime.spec.medianDays.toFixed(2)} days\n`;
  md += `- P95: ${cycleTime.spec.p95Days.toFixed(2)} days\n\n`;

  md += `### Plan Cycle Time\n`;
  md += `- Average: ${cycleTime.plan.averageDays.toFixed(2)} days\n`;
  md += `- Median: ${cycleTime.plan.medianDays.toFixed(2)} days\n`;
  md += `- P95: ${cycleTime.plan.p95Days.toFixed(2)} days\n\n`;

  md += `### Task Cycle Time\n`;
  md += `- Average: ${cycleTime.task.averageDays.toFixed(2)} days\n`;
  md += `- Median: ${cycleTime.task.medianDays.toFixed(2)} days\n`;
  md += `- P95: ${cycleTime.task.p95Days.toFixed(2)} days\n\n`;

  md += `### Overall Cycle Time\n`;
  md += `- Average: ${cycleTime.overall.averageDays.toFixed(2)} days\n`;
  md += `- Median: ${cycleTime.overall.medianDays.toFixed(2)} days\n`;
  md += `- P95: ${cycleTime.overall.p95Days.toFixed(2)} days\n\n`;

  // Trends
  md += `## Trend Analysis\n\n`;

  md += `### Cycle Time Trend: ${getTrendIndicator(trends.cycleTime.trend)}\n`;
  md += `- Current 7-day MA: ${trends.cycleTime.current7DayMA.toFixed(2)} days\n`;
  md += `- Previous 7-day MA: ${trends.cycleTime.previous7DayMA.toFixed(2)} days\n`;
  md += `- Change: ${trends.cycleTime.percentChange >= 0 ? '+' : ''}${trends.cycleTime.percentChange.toFixed(2)}%\n\n`;

  md += `### Throughput Trend: ${getTrendIndicator(trends.throughput.trend)}\n`;
  md += `- Current week: ${trends.throughput.currentWeekTasks} tasks\n`;
  md += `- Previous week: ${trends.throughput.previousWeekTasks} tasks\n`;
  md += `- Change: ${trends.throughput.percentChange >= 0 ? '+' : ''}${trends.throughput.percentChange.toFixed(2)}%\n\n`;

  md += `### Quality Trend: ${getTrendIndicator(trends.quality.trend)}\n`;
  md += `- Current week pass rate: ${(trends.quality.currentWeekPassRate * 100).toFixed(2)}%\n`;
  md += `- Previous week pass rate: ${(trends.quality.previousWeekPassRate * 100).toFixed(2)}%\n`;
  md += `- Change: ${trends.quality.percentChange >= 0 ? '+' : ''}${trends.quality.percentChange.toFixed(2)}%\n\n`;

  // Quality Metrics
  md += `## Quality Metrics\n\n`;
  md += `- Spec validation pass rate: ${(quality.specValidationPassRate * 100).toFixed(2)}%\n`;
  md += `- Average clarifications per spec: ${quality.averageClarificationsPerSpec.toFixed(2)}\n`;
  md += `- Spec refinement frequency: ${quality.specRefinementFrequency.toFixed(2)}\n`;
  md += `- Acceptance criteria coverage: ${(quality.acceptanceCriteriaCoverage * 100).toFixed(2)}%\n\n`;

  // Burndown
  if (burndown.remaining > 0) {
    md += `## Burndown Chart\n\n`;
    md += `- Remaining tasks: ${burndown.remaining}\n`;
    md += `- Projected completion: ${burndown.projectedCompletionDate}\n`;
    md += `- Confidence interval: ${burndown.confidenceInterval.earliest} - ${burndown.confidenceInterval.latest}\n\n`;

    // ASCII burndown chart
    md += renderASCIIBurndown(burndown);
  }

  // Velocity Warning
  md += `## ⚠️ Important Note on Velocity\n\n`;
  md += `${velocityWarning}\n\n`;
  md += `### Why Velocity Isn't a Performance Metric\n\n`;
  md += `1. **Gameable**: Teams can inflate estimates to appear more productive\n`;
  md += `2. **Misses Quality**: High velocity with poor quality indicates process problems\n`;
  md += `3. **Not Comparable**: Velocity varies by team, domain, and estimation approach\n`;
  md += `4. **Focus Wrong**: Rewards output over outcomes\n\n`;
  md += `### What to Focus On Instead\n\n`;
  md += `- **Cycle Time**: How quickly work flows through the system\n`;
  md += `- **Lead Time**: Time from request to delivery\n`;
  md += `- **Quality Metrics**: Pass rates, defect rates, refinement frequency\n`;
  md += `- **Flow Efficiency**: Value-adding time vs wait time\n\n`;
  md += `**Reference**: DORA State of DevOps Research, SPACE Framework (GitHub, Microsoft, University of Victoria)\n`;

  return md;
}

/**
 * Format metrics report as CSV
 */
function formatReportAsCSV(report: MetricsReport): string {
  const { period, dora, space, cycleTime, quality } = report;

  const rows: string[] = [];

  // Header
  rows.push('Metric,Category,Value,Unit,Rating');

  // Period
  rows.push(`Period Start,Period,${period.start},ISO Date,`);
  rows.push(`Period End,Period,${period.end},ISO Date,`);
  rows.push(`Period Days,Period,${period.days},Days,`);

  // DORA
  rows.push(`Deployment Frequency - Specs,DORA,${dora.deploymentFrequency.specsPerWeek.toFixed(2)},per week,${dora.deploymentFrequency.rating}`);
  rows.push(`Deployment Frequency - Plans,DORA,${dora.deploymentFrequency.plansPerWeek.toFixed(2)},per week,${dora.deploymentFrequency.rating}`);
  rows.push(`Deployment Frequency - Tasks,DORA,${dora.deploymentFrequency.tasksPerWeek.toFixed(2)},per week,${dora.deploymentFrequency.rating}`);
  rows.push(`Lead Time - Average,DORA,${dora.leadTimeForChanges.averageDays.toFixed(2)},Days,${dora.leadTimeForChanges.rating}`);
  rows.push(`Lead Time - Median,DORA,${dora.leadTimeForChanges.medianDays.toFixed(2)},Days,${dora.leadTimeForChanges.rating}`);
  rows.push(`Lead Time - P95,DORA,${dora.leadTimeForChanges.p95Days.toFixed(2)},Days,${dora.leadTimeForChanges.rating}`);
  rows.push(`Change Failure Rate,DORA,${(dora.changeFailureRate.failureRate * 100).toFixed(2)},Percent,${dora.changeFailureRate.rating}`);

  // SPACE
  rows.push(`Spec Completion Rate,SPACE,${(space.performance.specCompletionRate * 100).toFixed(2)},Percent,`);
  rows.push(`Validation Pass Rate,SPACE,${(space.performance.validationPassRate * 100).toFixed(2)},Percent,`);
  rows.push(`Specs Created,SPACE,${space.activity.specsCreated},Count,`);
  rows.push(`Plans Created,SPACE,${space.activity.plansCreated},Count,`);
  rows.push(`Tasks Created,SPACE,${space.activity.tasksCreated},Count,`);
  rows.push(`Clarifications Resolved,SPACE,${space.activity.clarificationsResolved},Count,`);

  // Cycle Time
  rows.push(`Spec Cycle Time - Average,Cycle Time,${cycleTime.spec.averageDays.toFixed(2)},Days,`);
  rows.push(`Spec Cycle Time - Median,Cycle Time,${cycleTime.spec.medianDays.toFixed(2)},Days,`);
  rows.push(`Plan Cycle Time - Average,Cycle Time,${cycleTime.plan.averageDays.toFixed(2)},Days,`);
  rows.push(`Task Cycle Time - Average,Cycle Time,${cycleTime.task.averageDays.toFixed(2)},Days,`);
  rows.push(`Overall Cycle Time - Average,Cycle Time,${cycleTime.overall.averageDays.toFixed(2)},Days,`);

  // Quality
  rows.push(`Spec Validation Pass Rate,Quality,${(quality.specValidationPassRate * 100).toFixed(2)},Percent,`);
  rows.push(`Average Clarifications Per Spec,Quality,${quality.averageClarificationsPerSpec.toFixed(2)},Count,`);
  rows.push(`Spec Refinement Frequency,Quality,${quality.specRefinementFrequency.toFixed(2)},Count,`);
  rows.push(`Acceptance Criteria Coverage,Quality,${(quality.acceptanceCriteriaCoverage * 100).toFixed(2)},Percent,`);

  return rows.join('\n');
}

/**
 * Get trend indicator emoji
 */
function getTrendIndicator(trend: string): string {
  if (trend === 'improving' || trend === 'increasing') {
    return '📈 Improving';
  }
  if (trend === 'declining' || trend === 'decreasing') {
    return '📉 Declining';
  }
  return '➡️ Stable';
}

/**
 * Render ASCII burndown chart
 */
function renderASCIIBurndown(burndown: BurndownChart): string {
  const { ideal, actual, remaining } = burndown;

  if (ideal.length === 0 || actual.length === 0) {
    return 'No burndown data available\n';
  }

  const maxValue = Math.max(...ideal, ...actual);
  const height = 10;
  const width = Math.max(ideal.length, actual.length);

  let chart = '```\nBurndown Chart\n\n';

  // Render chart from top to bottom
  for (let y = height; y >= 0; y--) {
    const threshold = (y / height) * maxValue;
    let line = `${threshold.toFixed(0).padStart(4)} |`;

    for (let x = 0; x < width; x++) {
      const idealValue = ideal[x] !== undefined ? ideal[x] : null;
      const actualValue = actual[x] !== undefined ? actual[x] : null;

      let char = ' ';
      if (idealValue !== null && idealValue >= threshold) {
        char = '.';
      }
      if (actualValue !== null && actualValue >= threshold) {
        char = '#';
      }

      line += char;
    }

    chart += line + '\n';
  }

  // X-axis
  chart += '     +' + '-'.repeat(width) + '\n';
  chart += `       0${' '.repeat(width - 10)}${width}\n`;
  chart += '\n. = Ideal  # = Actual\n';
  chart += `Remaining: ${remaining} tasks\n`;
  chart += '```\n\n';

  return chart;
}
