/**
 * Spec Kit project detector
 * 
 * Detects and validates Spec Kit project structures
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export type ProjectType = 'speckit' | 'dincoder' | 'hybrid' | 'none';

export interface SpecKitDetection {
  type: ProjectType;
  hasSpecKit: boolean;
  hasDincoder: boolean;
  specKitDirs: string[];
  dincoderDirs: string[];
  pythonAvailable: boolean;
  uvAvailable: boolean;
}

/**
 * Check if Python and uv are available for Spec Kit CLI
 */
export async function checkSpecKitPrerequisites(): Promise<{ python: boolean; uv: boolean }> {
  const results = { python: false, uv: false };
  
  try {
    await execAsync('python3 --version');
    results.python = true;
  } catch {
    try {
      await execAsync('python --version');
      results.python = true;
    } catch {
      // Python not available
    }
  }
  
  try {
    await execAsync('uv --version');
    results.uv = true;
  } catch {
    // uv not available
  }
  
  return results;
}

/**
 * Check if a directory exists
 */
async function directoryExists(dirPath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Detect Spec Kit project structure
 */
export async function detectSpecKitStructure(workspacePath: string): Promise<string[]> {
  const specKitDirs = ['memory', 'scripts', 'templates', 'specs'];
  const foundDirs: string[] = [];
  
  for (const dir of specKitDirs) {
    const dirPath = path.join(workspacePath, dir);
    if (await directoryExists(dirPath)) {
      foundDirs.push(dir);
    }
  }
  
  return foundDirs;
}

/**
 * Detect DinCoder project structure
 */
export async function detectDincoderStructure(workspacePath: string): Promise<string[]> {
  const dincoderDir = path.join(workspacePath, '.dincoder');
  
  if (await directoryExists(dincoderDir)) {
    try {
      const contents = await fs.readdir(dincoderDir);
      return contents.filter(item => item !== '.DS_Store');
    } catch {
      return [];
    }
  }
  
  return [];
}

/**
 * Detect project type and available tools
 */
export async function detectProjectType(workspacePath: string): Promise<SpecKitDetection> {
  const [specKitDirs, dincoderDirs, prerequisites] = await Promise.all([
    detectSpecKitStructure(workspacePath),
    detectDincoderStructure(workspacePath),
    checkSpecKitPrerequisites()
  ]);
  
  const hasSpecKit = specKitDirs.length >= 2; // At least 2 Spec Kit dirs
  const hasDincoder = dincoderDirs.length > 0;
  
  let type: ProjectType = 'none';
  
  if (hasSpecKit && hasDincoder) {
    type = 'hybrid';
  } else if (hasSpecKit) {
    type = 'speckit';
  } else if (hasDincoder) {
    type = 'dincoder';
  }
  
  return {
    type,
    hasSpecKit,
    hasDincoder,
    specKitDirs,
    dincoderDirs,
    pythonAvailable: prerequisites.python,
    uvAvailable: prerequisites.uv
  };
}

/**
 * Find the appropriate specs directory for the project
 */
export async function findSpecsDirectory(workspacePath: string): Promise<string> {
  const detection = await detectProjectType(workspacePath);
  
  // Prefer Spec Kit structure if available
  if (detection.hasSpecKit) {
    const specsDir = path.join(workspacePath, 'specs');
    if (await directoryExists(specsDir)) {
      return specsDir;
    }
  }
  
  // Fall back to DinCoder structure
  if (detection.hasDincoder) {
    const dincoderSpecsDir = path.join(workspacePath, '.dincoder', 'specs');
    await fs.mkdir(dincoderSpecsDir, { recursive: true });
    return dincoderSpecsDir;
  }
  
  // Create new Spec Kit structure by default
  const specsDir = path.join(workspacePath, 'specs');
  await fs.mkdir(specsDir, { recursive: true });
  return specsDir;
}

/**
 * Get next feature number for specs directory
 */
export async function getNextFeatureNumber(specsDir: string): Promise<string> {
  try {
    const entries = await fs.readdir(specsDir);
    
    // Find directories matching pattern ###-feature-name
    const featureNumbers = entries
      .filter(entry => /^\d{3}-/.test(entry))
      .map(entry => parseInt(entry.substring(0, 3), 10))
      .filter(num => !isNaN(num));
    
    if (featureNumbers.length === 0) {
      return '001';
    }
    
    const maxNumber = Math.max(...featureNumbers);
    return String(maxNumber + 1).padStart(3, '0');
  } catch {
    return '001';
  }
}

/**
 * Create feature directory with Spec Kit structure
 */
export async function createFeatureDirectory(
  specsDir: string,
  featureName: string
): Promise<string> {
  const featureNumber = await getNextFeatureNumber(specsDir);
  const sanitizedName = featureName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  const featureDirName = `${featureNumber}-${sanitizedName}`;
  const featurePath = path.join(specsDir, featureDirName);
  
  // Create feature directory and subdirectories
  await fs.mkdir(featurePath, { recursive: true });
  await fs.mkdir(path.join(featurePath, 'contracts'), { recursive: true });
  
  return featurePath;
}

/**
 * Migrate from DinCoder to Spec Kit structure
 */
export async function migrateDincoderToSpecKit(workspacePath: string): Promise<void> {
  const dincoderDir = path.join(workspacePath, '.dincoder');
  
  if (!await directoryExists(dincoderDir)) {
    throw new Error('No .dincoder directory found to migrate');
  }
  
  // Create Spec Kit directories
  const specKitDirs = ['memory', 'scripts', 'templates', 'specs'];
  for (const dir of specKitDirs) {
    await fs.mkdir(path.join(workspacePath, dir), { recursive: true });
  }
  
  // Copy any existing specs from .dincoder to specs/
  const dincoderSpecsDir = path.join(dincoderDir, 'specs');
  if (await directoryExists(dincoderSpecsDir)) {
    const specsDir = path.join(workspacePath, 'specs');
    
    try {
      const entries = await fs.readdir(dincoderSpecsDir);
      for (const entry of entries) {
        const sourcePath = path.join(dincoderSpecsDir, entry);
        const targetPath = path.join(specsDir, entry);
        
        // Copy recursively
        await fs.cp(sourcePath, targetPath, { recursive: true });
      }
    } catch (error) {
      console.error('Error migrating specs:', error);
    }
  }
  
  // Create constitution.md in memory/
  const constitutionContent = `# Project Constitution

## Principles
- Simplicity first
- Test-driven development
- Clear documentation
- Minimal dependencies

## Rules
- Every feature starts with a spec
- Tests before implementation
- No code without purpose
- Document decisions in research.md
`;
  
  await fs.writeFile(
    path.join(workspacePath, 'memory', 'constitution.md'),
    constitutionContent
  );
}