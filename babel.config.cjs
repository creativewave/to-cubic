
const { dependencies } = require('./package.json')

const plugins = []
const presetEnv = {
    bugfixes: true,
    corejs: dependencies['core-js'],
    useBuiltIns: 'usage',
}
const presets = [['@babel/preset-env', presetEnv]]

module.exports = api => {

    const env = api.env()

    if (env === 'cjs') {
        plugins.push(['@babel/plugin-transform-runtime', { version: dependencies['@babel/runtime'] }])
    } else if (env === 'umd') {
        return { exclude: /core-js/, plugins, presets, targets: 'supports es6-module' }
    }

    return { exclude: /node_modules/, plugins, presets, targets: 'current node' }
}
