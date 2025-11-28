---
"@lynx-js/react-rsbuild-plugin": patch
"@lynx-js/rspeedy": patch
---

Support lynx environment variant `lynx:`.

Enhanced environments detection to support Lynx variants by matching both the `lynx:` prefix and the exact 'lynx' string. This enables users to utilize different Lynx configurations for multiple build outputs.

```js
import { defineConfig } from '@lynx-js/rspeedy';

export default defineConfig({
  environments: {
    lynx: {
      output: {
        distPath: { root: 'dist/default' },
      },
    },
    'lynx:foo': {
      output: {
        distPath: { root: 'dist/foo' },
        minify: false,
      },
    },
  },
});
```
