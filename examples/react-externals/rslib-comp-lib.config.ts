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
    externals({ request, contextInfo }, callback) {
      if (!request) return callback();
      const libraryName0 = 'ReactLynx';
      const mapPkg2LibraryName1 = {
        '@lynx-js/react': 'React',
        '@lynx-js/react/internal': 'ReactInternal',
        '@lynx-js/react/experimental/lazy/import': 'ReactLazyImport',
        '@lynx-js/react/legacy-react-runtime': 'ReactLegacyRuntime',
        '@lynx-js/react/runtime-components': 'ReactComponents',
        '@lynx-js/react/worklet-runtime/bindings': 'ReactWorkletRuntime',
        '@lynx-js/react/debug': 'ReactDebug',
        'preact': 'Preact',
      };

      if (!(request in mapPkg2LibraryName1)) return callback();
      const libraryName1 =
        mapPkg2LibraryName1[request as keyof typeof mapPkg2LibraryName1];
      if (contextInfo?.issuerLayer === LAYERS.MAIN_THREAD) {
        callback(undefined, [
          'globalThis',
          'lynx_ex',
          libraryName0,
          libraryName1,
        ], 'var');
      } else {
        callback(undefined, [
          'lynxCoreInject',
          'tt',
          'lynx_ex',
          libraryName0,
          libraryName1,
        ], 'var');
      }
    },
    minify: false,
  },
});
