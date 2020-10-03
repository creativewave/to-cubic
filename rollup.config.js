
import babel from 'rollup-plugin-babel'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import pkg from './package.json'
import { terser } from 'rollup-plugin-terser'

const externalRegexp = new RegExp(`^(${Object.keys(pkg.dependencies).join('|')})`)
const external = id => externalRegexp.test(id)

const getBabelConfig = targets => ({
    exclude: /node_modules/,
    presets: [['@babel/preset-env', {
        corejs: 3,
        // debug: true,
        targets,
        useBuiltIns: 'usage',
    }]]
})

export default [
    {
        external,
        input: 'src/index.js',
        output: {
            file: pkg.main,
            format: 'cjs',
        },
        plugins: [babel(getBabelConfig({ node: true }))],
    },
    {
        external,
        input: 'src/index.js',
        output: {
            file: pkg.module,
            format: 'es',
        },
        plugins: [babel(getBabelConfig({ esmodules: true }))],
    },
    {
        input: 'src/index.js',
        output: {
            file: pkg.unpkg,
            format: 'umd',
            name: 'toCubic',
        },
        plugins: [
            nodeResolve(),
            babel(getBabelConfig('defaults')),
            commonjs(),
            terser(),
        ],
    },
]
