import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { defineConfig } from 'rollup';

export default defineConfig({
  input: 'src/main.ts',
  onwarn(warning, warn) {
    if (warning.code === 'THIS_IS_UNDEFINED')
      return;
    warn(warning);
  },
  output: {
    file: 'dist/index.js',
    format: 'esm',
    sourcemap: true,
  },
  plugins: [
    typescript({ tsconfig: './tsconfig.build.json' }),
    nodeResolve({ preferBuiltins: true }),
    commonjs(),
    json(),
  ],
});
