
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import { dependencies, exports, unpkg } from './package.json'

export default process.env.NODE_ENV === 'cjs'
    ? {
        input: exports['.'].import,
        external: new RegExp(`^(${Object.keys(dependencies).join('|')})`),
        output: {
            file: exports['.'].require,
            format: 'cjs',
        },
        plugins: [
            babel({ babelHelpers: 'runtime' }),
            commonjs(),
        ],
    }
    : {
        input: exports['.'].import,
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
