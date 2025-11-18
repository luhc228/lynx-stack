/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/
import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    name: 'rspeedy/plugin-externals-bundle',
    pool: 'forks',
  },
})
