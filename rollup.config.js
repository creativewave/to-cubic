
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import { exports, unpkg } from './package.json'

export default {
    input: exports['.'],
    output: {
        file: unpkg,
        format: 'umd',
        name: 'toCubic',
    },
    plugins: [
        nodeResolve(),
        commonjs(),
        babel({ babelHelpers: 'bundled' }),
        terser(),
    ],
}
