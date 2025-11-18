// Copyright 2025 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
import type { RsbuildPlugin } from '@rsbuild/core'

import { ExternalsLoadingPlugin as ExternalsLoadingWebpackPlugin } from '@lynx-js/externals-loading-webpack-plugin'
import type { ExternalsLoadingPluginOptions as ExternalsLoadingWebpackPluginOptions } from '@lynx-js/externals-loading-webpack-plugin'

/**
 * The options of {@link pluginExternalsBundle}.
 *
 * @public
 */
export type PluginExternalsBundleOptions =
  ExternalsLoadingWebpackPluginOptions['externals']

/**
 * The rsbuild plugin to exclude externals from the bundle and load them asynchronously or synchronously on Lynx.
 *
 * @public
 */
export function pluginExternalsBundle(
  externalsOptions: PluginExternalsBundleOptions = {},
): RsbuildPlugin {
  return {
    name: 'lynx:externals-bundle',
    setup(api) {
      api.modifyBundlerChain(chain => {
        const exposedLayers = api.useExposed<
          { BACKGROUND: string, MAIN_THREAD: string }
        >(Symbol.for('Lynx.plugin.LAYERS'))
        const exposedMainThreadChunks = api.useExposed<
          { mainThreadChunks: string[] }
        >(Symbol.for('Lynx.plugin.mainThreadChunks'))
        const exposedBackgroundChunks = api.useExposed<
          { backgroundChunks: string[] }
        >(Symbol.for('Lynx.plugin.backgroundChunks'))

        if (
          !exposedLayers || !exposedMainThreadChunks || !exposedBackgroundChunks
        ) {
          let pluginName = 'Rspeedy and plugins'
          if (api.isPluginExists('lynx:react')) {
            pluginName = '@byted-lynx/react-rsbuild-plugin'
          }
          throw new Error(`
[pluginExternalsBundle] No exposed LAYERS, mainThreadChunks, or backgroundChunks.

Please upgrade ${pluginName} to the latest version.
`)
        }
        chain
          .plugin(ExternalsLoadingWebpackPlugin.name)
          .use(ExternalsLoadingWebpackPlugin, [
            {
              mainThreadChunks: exposedMainThreadChunks.mainThreadChunks,
              backgroundChunks: exposedBackgroundChunks.backgroundChunks,
              mainThreadLayer: exposedLayers.MAIN_THREAD,
              backgroundLayer: exposedLayers.BACKGROUND,

              externals: externalsOptions,
            } satisfies ExternalsLoadingWebpackPluginOptions,
          ])
          .end()
      })
    },
  }
}
