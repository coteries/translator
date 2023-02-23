import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import ts from '@rollup/plugin-typescript'
import copy from 'rollup-plugin-copy'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'

const pkg = require('./package.json')

export default {
  input: 'src/index.ts',
  external: ['fs'],
  output: [
    {
      file: `bin/index.js`,
      format: 'cjs',
      banner: '#!/usr/bin/env node'
    }
  ],
  plugins: [
    json(),
    nodeResolve({
      exportConditions: ['node']
    }),
    commonjs(),
    ts(),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.VERSION': JSON.stringify(pkg.version),
      'process.env.SERVICE_ACCOUNT_FILE': JSON.stringify(pkg.serviceAccount)
    }),
    copy({
      targets: [
        {
          src: `./${pkg.serviceAccount}`,
          dest: 'bin'
        }
      ]
    })
  ]
}
