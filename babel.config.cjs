
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
        presetEnv.targets = { esmodules: true }
        return { exclude: /core-js/, plugins, presets }
    }

    presetEnv.targets = { node: true }

    return { exclude: /node_modules/, plugins, presets }
}
