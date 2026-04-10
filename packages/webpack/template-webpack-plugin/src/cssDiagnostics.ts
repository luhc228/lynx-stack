// Copyright 2026 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { existsSync } from 'node:fs';
import { resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';

import { TraceMap, originalPositionFor } from '@jridgewell/trace-mapping';
import type { SourceMapInput } from '@jridgewell/trace-mapping';

import type * as CSS from '@lynx-js/css-serializer';

export interface CSSDiagnostic {
  kind: 'selector' | 'declaration';
  cssId: number;
  selector: string;
  property?: string | undefined;
  message: string;
  loc: {
    line: number;
    column: number;
  };
}

export interface ResolvedCSSDiagnostic extends CSSDiagnostic {
  sourceFile: string;
  sourceLine: number;
  sourceColumn: number;
}

export interface TasmCSSDiagnostic {
  type?: string | undefined;
  name?: string | undefined;
  line: number;
  column: number;
}

export interface ResolvedTasmCSSDiagnostic extends TasmCSSDiagnostic {
  message: string;
  sourceFile?: string | undefined;
  sourceLine?: number | undefined;
  sourceColumn?: number | undefined;
}

interface StyleDeclarationLoc {
  name: string;
  keyLoc?: {
    line: number;
    column: number;
  };
  valLoc?: {
    line: number;
    column: number;
  };
}

interface StyleRuleLoc {
  type: 'StyleRule';
  style?: StyleDeclarationLoc[];
  selectorText?: {
    value?: string;
    loc?: {
      line: number;
      column: number;
    };
  };
}

type CSSMap = Record<number | string, unknown>;

export function extractCSSDiagnostics(error: unknown): CSSDiagnostic[] {
  const rawDiagnostics = findCSSDiagnosticsCandidate(error);
  if (!Array.isArray(rawDiagnostics)) {
    return [];
  }

  return rawDiagnostics
    .map((element) => normalizeCSSDiagnostic(element))
    .filter((diagnostic): diagnostic is CSSDiagnostic => diagnostic !== null);
}

export async function resolveCSSDiagnostics({
  cssDiagnostics,
  cssMap,
  mainCSSSourceMap,
}: {
  cssDiagnostics: CSSDiagnostic[];
  cssMap: CSSMap | undefined;
  mainCSSSourceMap: CSS.CSSSourceMap;
}): Promise<ResolvedCSSDiagnostic[]> {
  const traceMap = new TraceMap(mainCSSSourceMap as SourceMapInput);

  return cssDiagnostics.flatMap(diagnostic => {
    const loc = findBundleLocation(diagnostic, cssMap) ?? diagnostic.loc;
    const mapped = originalPositionFor(traceMap, {
      line: loc.line,
      column: Math.max(loc.column - 1, 0),
    });

    if (
      mapped.source === null
      || mapped.line === null
      || mapped.column === null
    ) {
      return [];
    }

    return [{
      ...diagnostic,
      sourceFile: normalizeSourcePath(mapped.source),
      sourceLine: mapped.line,
      sourceColumn: mapped.column + 1,
    }];
  });
}

export function extractTasmCSSDiagnostics(value: unknown): TasmCSSDiagnostic[] {
  if (typeof value !== 'string' || value.trim() === '') {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown as TasmCSSDiagnostic[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((element) => normalizeTasmCSSDiagnostic(element))
      .filter((diagnostic): diagnostic is TasmCSSDiagnostic => (
        diagnostic !== null
      ));
  } catch {
    return [];
  }
}

export function resolveTasmCSSDiagnostics({
  cssDiagnostics,
  mainCSSSourceMap,
  context,
  fileExists = existsSync,
}: {
  cssDiagnostics: TasmCSSDiagnostic[];
  mainCSSSourceMap: CSS.CSSSourceMap | undefined;
  context: string;
  fileExists?: (path: string) => boolean;
}): ResolvedTasmCSSDiagnostic[] {
  if (!mainCSSSourceMap) {
    return cssDiagnostics.map(diagnostic => ({
      ...diagnostic,
      message: formatTasmCSSDiagnosticMessage(diagnostic),
    }));
  }

  const traceMap = new TraceMap(mainCSSSourceMap as SourceMapInput);

  return cssDiagnostics.map(diagnostic => {
    const mapped = originalPositionFor(traceMap, {
      line: diagnostic.line,
      column: Math.max(diagnostic.column - 1, 0),
    });

    const message = formatTasmCSSDiagnosticMessage(diagnostic);
    if (
      mapped.source === null
      || mapped.line === null
      || mapped.column === null
    ) {
      return {
        ...diagnostic,
        message,
      };
    }

    const sourceFile = normalizeTasmSourcePath(
      mapped.source,
      mainCSSSourceMap,
      context,
    );
    if (!sourceFile || !fileExists(sourceFile)) {
      return {
        ...diagnostic,
        message,
      };
    }

    return {
      ...diagnostic,
      message,
      sourceFile,
      sourceLine: mapped.line,
      sourceColumn: mapped.column + 1,
    };
  });
}

function findCSSDiagnosticsCandidate(value: unknown): unknown {
  const candidates = [
    value,
    getRecordValue(value, 'cause'),
    parseEmbeddedJSON(getRecordValue(value, 'error_msg')),
    parseEmbeddedJSON(getRecordValue(value, 'message')),
  ];

  for (const candidate of candidates) {
    const diagnostics = getDiagnosticsArray(candidate);
    if (diagnostics) {
      return diagnostics;
    }
  }

  return undefined;
}

function getDiagnosticsArray(value: unknown): unknown[] | undefined {
  if (Array.isArray(value)) {
    return value as unknown[];
  }

  return [
    'cssDiagnostics',
    'css_diagnostics',
    'diagnostics',
    'cssErrors',
  ].flatMap(key => {
    const candidate = getRecordValue(value, key);
    return Array.isArray(candidate) ? [candidate] : [];
  })[0];
}

function parseEmbeddedJSON(value: unknown): unknown {
  if (typeof value !== 'string') {
    return undefined;
  }

  const candidates = [
    value,
    value.replace(/^encode error:\s*/i, ''),
    value.slice(Math.max(value.indexOf('{'), 0)),
    value.slice(Math.max(value.indexOf('['), 0)),
  ].filter(candidate => candidate.trim().length > 0);

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch (error) {
      void error;
    }
  }

  return undefined;
}

function normalizeCSSDiagnostic(value: unknown): CSSDiagnostic | null {
  if (!isRecord(value)) {
    return null;
  }

  const kind = value['kind'];
  const cssId = value['cssId'];
  const selector = value['selector'];
  const message = value['message'];
  const loc = value['loc'];

  if (
    (kind !== 'selector' && kind !== 'declaration')
    || typeof cssId !== 'number'
    || typeof selector !== 'string'
    || typeof message !== 'string'
    || !isRecord(loc)
    || typeof loc['line'] !== 'number'
    || typeof loc['column'] !== 'number'
  ) {
    return null;
  }

  const property = typeof value['property'] === 'string'
    ? value['property']
    : undefined;

  return {
    kind,
    cssId,
    selector,
    property,
    message,
    loc: {
      line: loc['line'],
      column: loc['column'],
    },
  };
}

function normalizeTasmCSSDiagnostic(value: unknown): TasmCSSDiagnostic | null {
  if (!isRecord(value)) {
    return null;
  }

  return {
    type: value['type'] as string | undefined,
    name: value['name'] as string | undefined,
    line: value['line'] as number,
    column: value['column'] as number,
  };
}

function findBundleLocation(
  diagnostic: CSSDiagnostic,
  cssMap: CSSMap | undefined,
): CSSDiagnostic['loc'] | undefined {
  const rules = cssMap?.[diagnostic.cssId];
  if (!Array.isArray(rules)) {
    return undefined;
  }

  const matchedRule = rules.find((rule): rule is StyleRuleLoc => {
    if (!isRecord(rule) || rule['type'] !== 'StyleRule') {
      return false;
    }

    const selectorText = getRecordValue(rule, 'selectorText');
    return isRecord(selectorText)
      && selectorText['value'] === diagnostic.selector;
  });

  if (!matchedRule) {
    return undefined;
  }

  if (diagnostic.kind === 'selector') {
    return matchedRule.selectorText?.loc;
  }

  const declaration = matchedRule.style?.find(item =>
    item.name === diagnostic.property
  );
  return declaration?.valLoc ?? declaration?.keyLoc;
}

function normalizeSourcePath(source: string): string {
  if (source.startsWith('file://')) {
    return fileURLToPath(source);
  }

  return source;
}

function normalizeTasmSourcePath(
  source: string,
  sourceMap: CSS.CSSSourceMap,
  context: string,
): string | undefined {
  if (source.startsWith('file://')) {
    return fileURLToPath(source);
  }

  if (source.startsWith('webpack:')) {
    const normalized = source
      .replace(/^webpack:(?:\/\/\/)?/, '')
      .replace(/^\.\//, '')
      .replace(/^\/+/, '');
    return resolvePath(context, normalized);
  }

  if (source.startsWith('/')) {
    return source;
  }

  if (sourceMap.sourceRoot) {
    return resolvePath(sourceMap.sourceRoot, source);
  }

  return resolvePath(context, source);
}

function formatTasmCSSDiagnosticMessage(
  diagnostic: TasmCSSDiagnostic,
): string {
  const type = diagnostic.type ?? 'css syntax';
  if (diagnostic.name) {
    return `Unsupported ${type} "${diagnostic.name}" was removed during template encode.`;
  }

  return `Unsupported ${type} was removed during template encode.`;
}

function getRecordValue(value: unknown, key: string): unknown {
  return isRecord(value) ? value[key] : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object';
}
