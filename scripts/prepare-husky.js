#!/usr/bin/env node

/**
 * Prepare script for husky
 * Safely initializes husky only when git is available
 * Prevents errors during CI/CD or when git is not installed
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';

function isGitRepository() {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function isCI() {
  return process.env.CI === 'true' || process.env.CI === '1';
}

function hasGit() {
  try {
    execSync('git --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Skip husky installation in CI or when git is not available
if (isCI()) {
  console.log('CI environment detected, skipping husky installation');
  process.exit(0);
}

if (!hasGit()) {
  console.log('Git not found, skipping husky installation');
  process.exit(0);
}

if (!isGitRepository()) {
  console.log('Not a git repository, skipping husky installation');
  process.exit(0);
}

// Initialize husky (new command for v9+)
try {
  console.log('Initializing husky...');
  execSync('husky init', { stdio: 'inherit' });
  console.log('Husky initialized successfully');
} catch (error) {
  // Try the old command as fallback
  try {
    console.log('Trying legacy husky install...');
    execSync('husky install', { stdio: 'inherit' });
    console.log('Husky installed successfully');
  } catch (fallbackError) {
    console.log('Husky setup skipped (already configured or not needed)');
    // Don't fail the installation if husky setup fails
    process.exit(0);
  }
}
