// Copyright 2026 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
import { describe, expect, test } from 'vitest';

import type { CSSSourceMap } from '@lynx-js/css-serializer';

import {
  extractCSSDiagnostics,
  extractTasmCSSDiagnostics,
  resolveCSSDiagnostics,
  resolveTasmCSSDiagnostics,
} from '../src/cssDiagnostics.js';
import type { CSSDiagnostic } from '../src/cssDiagnostics.js';

describe('cssDiagnostics', () => {
  test('extract css diagnostics from encode error payload', () => {
    const diagnostics = extractCSSDiagnostics({
      error_msg: JSON.stringify({
        cssDiagnostics: [
          {
            kind: 'declaration',
            cssId: 0,
            selector: '.foo',
            property: 'color',
            message: 'unsupported color',
            loc: {
              line: 2,
              column: 10,
            },
          },
        ],
      }),
    });

    expect(diagnostics).toEqual([
      {
        kind: 'declaration',
        cssId: 0,
        selector: '.foo',
        property: 'color',
        message: 'unsupported color',
        loc: {
          line: 2,
          column: 10,
        },
      },
    ]);
  });

  test('resolve selector and declaration locations with css source map', async () => {
    const cssMap = {
      0: [
        {
          type: 'StyleRule',
          style: [
            {
              name: 'color',
              value: 'red',
              keyLoc: {
                line: 2,
                column: 3,
              },
              valLoc: {
                line: 2,
                column: 10,
              },
            },
          ],
          selectorText: {
            value: '.foo',
            loc: {
              line: 1,
              column: 1,
            },
          },
          variables: {},
        },
      ],
    };

    const diagnostics: CSSDiagnostic[] = [
      {
        kind: 'selector',
        cssId: 0,
        selector: '.foo',
        message: 'selector error',
        loc: {
          line: 1,
          column: 1,
        },
      },
      {
        kind: 'declaration',
        cssId: 0,
        selector: '.foo',
        property: 'color',
        message: 'declaration error',
        loc: {
          line: 2,
          column: 10,
        },
      },
    ];

    const sourceMap: CSSSourceMap = {
      version: 3,
      file: '.rspeedy/main/main.css',
      sources: ['file:///src/app.css'],
      sourcesContent: [
        '.foo {\n  color: red;\n}\n',
      ],
      names: [],
      mappings: 'AAAA;EACE,UAAU;AACZ',
    };

    const resolved = await resolveCSSDiagnostics({
      cssDiagnostics: diagnostics,
      cssMap,
      mainCSSSourceMap: sourceMap,
    });

    expect(resolved).toMatchInlineSnapshot(`
      [
        {
          "cssId": 0,
          "kind": "selector",
          "loc": {
            "column": 1,
            "line": 1,
          },
          "message": "selector error",
          "selector": ".foo",
          "sourceColumn": 1,
          "sourceFile": "/src/app.css",
          "sourceLine": 1,
        },
        {
          "cssId": 0,
          "kind": "declaration",
          "loc": {
            "column": 10,
            "line": 2,
          },
          "message": "declaration error",
          "property": "color",
          "selector": ".foo",
          "sourceColumn": 3,
          "sourceFile": "/src/app.css",
          "sourceLine": 2,
        },
      ]
    `);
  });

  test('extract tasm css diagnostics from JSON string', () => {
    expect(
      extractTasmCSSDiagnostics(
        '[{"type":"property","name":"unknown-prop","line":4,"column":15}]',
      ),
    ).toEqual([
      {
        type: 'property',
        name: 'unknown-prop',
        line: 4,
        column: 15,
      },
    ]);

    expect(extractTasmCSSDiagnostics('[]')).toEqual([]);
  });

  test('resolve tasm css diagnostics with css source map', () => {
    const sourceMap: CSSSourceMap = {
      version: 3,
      file: '.rspeedy/main/main.css',
      sources: ['webpack:/src/app.css'],
      sourcesContent: [
        '.foo {\n  unknown-prop: red;\n}\n',
      ],
      names: [],
      mappings: 'AAAA;EACE,kBAAkB;AACpB',
    };

    const resolved = resolveTasmCSSDiagnostics({
      cssDiagnostics: [
        {
          type: 'property',
          name: 'unknown-prop',
          line: 2,
          column: 10,
        },
      ],
      mainCSSSourceMap: sourceMap,
      context: '/workspace/app',
      fileExists: () => true,
    });

    expect(resolved).toEqual([
      {
        type: 'property',
        name: 'unknown-prop',
        line: 2,
        column: 10,
        message:
          'Unsupported property "unknown-prop" was removed during template encode.',
        sourceFile: '/workspace/app/src/app.css',
        sourceLine: 2,
        sourceColumn: 3,
      },
    ]);
  });

  test('skip mapped source when file does not exist', () => {
    const sourceMap: CSSSourceMap = {
      version: 3,
      file: '.rspeedy/main/main.css',
      sources: ['file:///src/app.css'],
      sourcesContent: [
        '.foo {\n  unknown-prop: red;\n}\n',
      ],
      names: [],
      mappings: 'AAAA;EACE,kBAAkB;AACpB',
    };

    const resolved = resolveTasmCSSDiagnostics({
      cssDiagnostics: [
        {
          type: 'property',
          name: 'unknown-prop',
          line: 2,
          column: 10,
        },
      ],
      mainCSSSourceMap: sourceMap,
      context: '/workspace/app',
      fileExists: () => false,
    });

    expect(resolved).toEqual([
      {
        type: 'property',
        name: 'unknown-prop',
        line: 2,
        column: 10,
        message:
          'Unsupported property "unknown-prop" was removed during template encode.',
      },
    ]);
  });
});
