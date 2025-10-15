/**
 * Task Search Tool
 *
 * Full-text search across tasks with fuzzy matching support.
 * Uses Levenshtein distance for typo tolerance.
 */

import * as path from 'path';
import { z } from 'zod';
import { parseTasksFile, type Task } from '../speckit/taskParser.js';

// Zod schema for tasks_search tool
export const TasksSearchSchema = z.object({
  workspacePath: z.string().optional().describe('Path to workspace directory containing .dincoder folder'),
  tasksPath: z.string().optional().describe('Direct path to tasks.md file (overrides workspacePath)'),
  query: z.string().describe('Search query (plain text or regex pattern)'),
  searchFields: z.array(z.enum(['description', 'phase', 'type', 'tags', 'all'])).default(['description']).describe('Fields to search in'),
  caseSensitive: z.boolean().default(false).describe('Case-sensitive search'),
  fuzzy: z.boolean().default(false).describe('Enable fuzzy matching for typo tolerance'),
  fuzzyThreshold: z.number().min(0).max(100).default(70).describe('Fuzzy match similarity threshold (0-100%)'),
  useRegex: z.boolean().default(false).describe('Treat query as regex pattern'),
  limit: z.number().optional().describe('Limit number of results (default: 10, max: 100)'),
});

export type TasksSearchParams = z.infer<typeof TasksSearchSchema>;

interface SearchResult {
  task: Task;
  matches: {
    field: string;
    matchedText: string;
    context: string;
  }[];
  relevanceScore: number;
}

/**
 * Search tasks by keyword
 */
export async function tasksSearch(params: TasksSearchParams): Promise<string> {
  // Resolve tasks.md path
  const tasksPath = params.tasksPath || path.join(
    params.workspacePath || process.cwd(),
    '.dincoder',
    'tasks.md'
  );

  // Parse tasks
  const tasks = parseTasksFile(tasksPath);

  // Perform search
  const results = searchTasks(tasks, params);

  // Apply limit
  const limit = params.limit ? Math.min(params.limit, 100) : 10;
  const limitedResults = results.slice(0, limit);

  // Format results
  return formatSearchResults(limitedResults, params, tasks.length);
}

/**
 * Search tasks and return ranked results
 */
function searchTasks(tasks: Task[], params: TasksSearchParams): SearchResult[] {
  const results: SearchResult[] = [];

  for (const task of tasks) {
    const searchResult = searchTask(task, params);
    if (searchResult) {
      results.push(searchResult);
    }
  }

  // Sort by relevance score (highest first)
  return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Search a single task
 */
function searchTask(task: Task, params: TasksSearchParams): SearchResult | null {
  const matches: SearchResult['matches'] = [];
  let maxRelevance = 0;

  // Determine which fields to search
  const fieldsToSearch = params.searchFields.includes('all')
    ? ['description', 'phase', 'type', 'tags']
    : params.searchFields;

  for (const field of fieldsToSearch) {
    let fieldValue = '';

    switch (field) {
      case 'description':
        fieldValue = task.description;
        break;
      case 'phase':
        fieldValue = task.metadata.phase || '';
        break;
      case 'type':
        fieldValue = task.metadata.type || '';
        break;
      case 'tags':
        fieldValue = (task.metadata.tags || []).join(' ');
        break;
    }

    if (!fieldValue) {
      continue;
    }

    // Perform search
    const match = performSearch(fieldValue, params.query, params);

    if (match) {
      matches.push({
        field,
        matchedText: match.matchedText,
        context: match.context,
      });

      maxRelevance = Math.max(maxRelevance, match.relevance);
    }
  }

  if (matches.length === 0) {
    return null;
  }

  return {
    task,
    matches,
    relevanceScore: maxRelevance,
  };
}

/**
 * Perform search on a field value
 */
function performSearch(
  value: string,
  query: string,
  params: TasksSearchParams
): { matchedText: string; context: string; relevance: number } | null {
  const searchValue = params.caseSensitive ? value : value.toLowerCase();
  const searchQuery = params.caseSensitive ? query : query.toLowerCase();

  if (params.useRegex) {
    // Regex search
    try {
      const flags = params.caseSensitive ? 'g' : 'gi';
      const regex = new RegExp(searchQuery, flags);
      const match = searchValue.match(regex);

      if (match) {
        return {
          matchedText: match[0],
          context: getContext(value, match.index || 0, match[0].length),
          relevance: calculateRelevance(value, match[0], 'regex'),
        };
      }
    } catch {
      // Invalid regex, fall through to exact search
    }
  }

  // Exact search
  const exactIndex = searchValue.indexOf(searchQuery);
  if (exactIndex !== -1) {
    return {
      matchedText: value.substring(exactIndex, exactIndex + query.length),
      context: getContext(value, exactIndex, query.length),
      relevance: calculateRelevance(value, query, exactIndex === 0 ? 'startsWith' : 'contains'),
    };
  }

  // Fuzzy search
  if (params.fuzzy) {
    const fuzzyMatch = fuzzySearch(searchValue, searchQuery, params.fuzzyThreshold);
    if (fuzzyMatch) {
      return {
        matchedText: fuzzyMatch.match,
        context: getContext(value, fuzzyMatch.index, fuzzyMatch.match.length),
        relevance: fuzzyMatch.similarity,
      };
    }
  }

  return null;
}

/**
 * Calculate relevance score (0-100)
 */
function calculateRelevance(value: string, match: string, matchType: 'exact' | 'startsWith' | 'contains' | 'regex'): number {
  switch (matchType) {
    case 'exact':
      return 100;
    case 'startsWith':
      return 90;
    case 'contains':
      return 70;
    case 'regex':
      return 80;
    default:
      return 50;
  }
}

/**
 * Get context around match (20 chars before/after)
 */
function getContext(text: string, index: number, length: number): string {
  const start = Math.max(0, index - 20);
  const end = Math.min(text.length, index + length + 20);

  let context = text.substring(start, end);

  if (start > 0) {
    context = '...' + context;
  }
  if (end < text.length) {
    context = context + '...';
  }

  // Highlight the match
  const matchStart = index - start + (start > 0 ? 3 : 0);
  const matchEnd = matchStart + length;
  context = context.substring(0, matchStart) + '**' + context.substring(matchStart, matchEnd) + '**' + context.substring(matchEnd);

  return context;
}

/**
 * Fuzzy search using Levenshtein distance
 */
function fuzzySearch(text: string, query: string, threshold: number): { match: string; index: number; similarity: number } | null {
  const words = text.split(/\s+/);
  let bestMatch: { match: string; index: number; similarity: number } | null = null;

  let currentIndex = 0;
  for (const word of words) {
    const similarity = calculateSimilarity(word, query);

    if (similarity >= threshold) {
      if (!bestMatch || similarity > bestMatch.similarity) {
        bestMatch = {
          match: word,
          index: currentIndex,
          similarity,
        };
      }
    }

    currentIndex += word.length + 1; // +1 for space
  }

  return bestMatch;
}

/**
 * Calculate similarity percentage using Levenshtein distance
 */
function calculateSimilarity(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);

  if (maxLength === 0) {
    return 100;
  }

  return Math.round(((maxLength - distance) / maxLength) * 100);
}

/**
 * Levenshtein distance algorithm
 * Returns the minimum number of edits needed to transform str1 into str2
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;

  // Create a 2D array for dynamic programming
  const matrix: number[][] = [];

  // Initialize first row and column
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;

      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Format search results
 */
function formatSearchResults(results: SearchResult[], params: TasksSearchParams, totalTasks: number): string {
  let output = '# Task Search Results\n\n';

  output += `**Query:** "${params.query}"\n`;
  output += `**Search fields:** ${params.searchFields.join(', ')}\n`;
  output += `**Options:** `;
  const options: string[] = [];
  if (params.fuzzy) {
    options.push(`fuzzy (${params.fuzzyThreshold}% threshold)`);
  }
  if (params.useRegex) {
    options.push('regex');
  }
  if (params.caseSensitive) {
    options.push('case-sensitive');
  }
  output += options.length > 0 ? options.join(', ') : 'exact match';
  output += '\n\n';

  output += `**Results:** ${results.length} task${results.length !== 1 ? 's' : ''} found (out of ${totalTasks} total)\n\n`;

  if (results.length === 0) {
    output += '*No tasks match your search query.*\n\n';
    if (!params.fuzzy) {
      output += '*Tip: Try enabling fuzzy matching for typo tolerance.*\n';
    }
    return output;
  }

  output += '---\n\n';

  for (const result of results) {
    const task = result.task;
    const statusIcon = task.status === 'completed' ? '✓' : task.status === 'in_progress' ? '~' : '○';

    output += `## ${statusIcon} ${task.id}: ${task.description}\n\n`;
    output += `**Relevance:** ${result.relevanceScore}%\n\n`;

    // Add metadata
    const metadata: string[] = [];
    if (task.metadata.phase) {
      metadata.push(`phase: ${task.metadata.phase}`);
    }
    if (task.metadata.type) {
      metadata.push(`type: ${task.metadata.type}`);
    }
    if (task.metadata.priority) {
      metadata.push(`priority: ${task.metadata.priority}`);
    }

    if (metadata.length > 0) {
      output += `*${metadata.join(' | ')}*\n\n`;
    }

    // Show matches
    output += `**Matches:**\n`;
    for (const match of result.matches) {
      output += `- **${match.field}:** ${match.context}\n`;
    }

    output += '\n';
  }

  return output;
}
