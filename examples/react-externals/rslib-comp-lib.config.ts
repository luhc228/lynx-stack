import { createRequire } from 'node:module';
import path from 'node:path';

import {
  LAYERS,
  defineExternalBundleRslibConfig,
} from '@lynx-js/lynx-bundle-rslib-config';
import { ReactWebpackPlugin } from '@lynx-js/react-webpack-plugin';

const require = createRequire(import.meta.url);
const reactLynxDir = path.dirname(
  require.resolve('@lynx-js/react/package.json'),
);
const preactDir = path.dirname(
  require.resolve('preact/package.json', { paths: [reactLynxDir] }),
);

export default defineExternalBundleRslibConfig({
  id: 'comp-lib',
  tools: {
    rspack: {
      module: {
        rules: [
          {
            issuerLayer: LAYERS.BACKGROUND,
            loader: ReactWebpackPlugin.loaders.BACKGROUND,
          },
          {
            issuerLayer: LAYERS.MAIN_THREAD,
            loader: ReactWebpackPlugin.loaders.MAIN_THREAD,
          },
        ],
      },
    },
  },
  source: {
    entry: {
      'CompLib': './external-bundle/CompLib.tsx',
    },
    define: {
      '__DEV__': 'false',
      'process.env.NODE_ENV': '"production"',
      '__FIRST_SCREEN_SYNC_TIMING__': '"immediately"',
      '__ENABLE_SSR__': 'false',
      '__PROFILE__': 'false',
      '__EXTRACT_STR__': 'false',
    },
  },
  resolve: {
    alias: {
      'react': preactDir,
      'preact': preactDir,
    },
  },
  output: {
    cleanDistPath: false,
    externals: {
      '@lynx-js/react': 'var __webpack_require__.lynx_ex.ReactLynx.React',
      '@lynx-js/react/internal':
        'var __webpack_require__.lynx_ex.ReactLynx.ReactInternal',
      '@lynx-js/react/experimental/lazy/import':
        'var __webpack_require__.lynx_ex.ReactLynx.ReactLazyImport',
      '@lynx-js/react/legacy-react-runtime':
        'var __webpack_require__.lynx_ex.ReactLynx.ReactLegacyRuntime',
      '@lynx-js/react/runtime-components':
        'var __webpack_require__.lynx_ex.ReactLynx.ReactComponents',
      '@lynx-js/react/worklet-runtime/bindings':
        'var __webpack_require__.lynx_ex.ReactLynx.ReactWorkletRuntime',
      '@lynx-js/react/debug':
        'var __webpack_require__.lynx_ex.ReactLynx.ReactDebug',
      'preact': 'var __webpack_require__.lynx_ex.ReactLynx.Preact',
    },
    minify: false,
  },
});
