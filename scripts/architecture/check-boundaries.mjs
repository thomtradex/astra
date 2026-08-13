#!/usr/bin/env node

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative, sep } from 'node:path';
import process from 'node:process';

const PROJECT_ROOT = process.cwd();
const SOURCE_ROOTS = ['apps', 'packages'];
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.mts', '.cts']);

const LAYER_NAMES = new Set([
  'domain',
  'application',
  'infrastructure',
  'delivery',
  'presentation',
]);

const IMPORT_PATTERN =
  /(?:import|export)\s+(?:type\s+)?(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)|require\(\s*['"]([^'"]+)['"]\s*\)/g;

const FORBIDDEN_EXTERNALS = {
  domain: [
    '@nestjs/',
    '@prisma/',
    '@astra/database',
    'next',
    'react',
    'express',
    'passport',
    'class-validator',
    'class-transformer',
    'bcryptjs',
    'openai',
    'anthropic',
    '@anthropic-ai/',
    '@google/generative-ai',
    'langchain',
  ],
  application: [
    '@nestjs/',
    '@prisma/',
    '@astra/database',
    'next',
    'react',
    'express',
    'passport',
    'openai',
    'anthropic',
    '@anthropic-ai/',
    '@google/generative-ai',
    'langchain',
  ],
  delivery: ['@prisma/', '@astra/database'],
  presentation: ['@prisma/', '@astra/database'],
};

const FORBIDDEN_LAYER_IMPORTS = {
  domain: new Set(['application', 'infrastructure', 'delivery', 'presentation']),
  application: new Set(['infrastructure', 'delivery', 'presentation']),
  infrastructure: new Set(['delivery', 'presentation']),
  delivery: new Set(['infrastructure']),
  presentation: new Set(['infrastructure']),
};

function walk(directory) {
  const entries = [];

  for (const entry of readdirSync(directory)) {
    if (['node_modules', 'dist', '.next', '.turbo', 'coverage'].includes(entry)) {
      continue;
    }

    const absolutePath = join(directory, entry);
    const stats = statSync(absolutePath);

    if (stats.isDirectory()) {
      entries.push(...walk(absolutePath));
      continue;
    }

    if (stats.isFile() && SOURCE_EXTENSIONS.has(extname(entry))) {
      entries.push(absolutePath);
    }
  }

  return entries;
}

function readSourceFiles() {
  return SOURCE_ROOTS.flatMap((sourceRoot) => {
    const absoluteRoot = join(PROJECT_ROOT, sourceRoot);

    try {
      return statSync(absoluteRoot).isDirectory() ? walk(absoluteRoot) : [];
    } catch {
      return [];
    }
  });
}

function findLayer(filePath) {
  const segments = relative(PROJECT_ROOT, filePath).split(sep);
  return segments.find((segment) => LAYER_NAMES.has(segment));
}

function findImportedLayer(importPath) {
  return importPath.split(/[\\/]/).find((segment) => LAYER_NAMES.has(segment));
}

function isForbiddenExternal(layer, importPath) {
  const forbidden = FORBIDDEN_EXTERNALS[layer] ?? [];
  return forbidden.some(
    (dependency) => importPath === dependency || importPath.startsWith(dependency),
  );
}

function collectImports(source) {
  const imports = [];
  let match;

  while ((match = IMPORT_PATTERN.exec(source)) !== null) {
    imports.push(match[1] ?? match[2] ?? match[3]);
  }

  return imports.filter(Boolean);
}

function checkFile(filePath) {
  const layer = findLayer(filePath);

  if (!layer) {
    return [];
  }

  const source = readFileSync(filePath, 'utf8');
  const imports = collectImports(source);
  const violations = [];

  for (const importPath of imports) {
    const importedLayer = findImportedLayer(importPath);

    if (isForbiddenExternal(layer, importPath)) {
      violations.push({
        filePath,
        importPath,
        reason: `${layer} layer imports forbidden external dependency`,
      });
    }

    if (importedLayer && (FORBIDDEN_LAYER_IMPORTS[layer] ?? new Set()).has(importedLayer)) {
      violations.push({
        filePath,
        importPath,
        reason: `${layer} layer points outward to ${importedLayer}`,
      });
    }
  }

  return violations;
}

const violations = readSourceFiles().flatMap(checkFile);

if (violations.length > 0) {
  console.error('Architecture boundary check failed.');
  console.error('The Engineering Book requires dependency direction toward the domain.');
  console.error('');

  for (const violation of violations) {
    console.error(
      `- ${relative(PROJECT_ROOT, violation.filePath)} imports "${violation.importPath}": ${violation.reason}`,
    );
  }

  process.exit(1);
}

console.info('Architecture boundary check passed.');
