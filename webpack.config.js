
module.exports = env => {
    process.env.NODE_ENV = env // @babel/preset-env will use it when parsing its config file
    return {
        mode: env,
        module: { rules: [{ exclude: /node_modules/, test: /\.jsx?$/, use: 'babel-loader' }] },
        output: {
            library: 'toCubic',
            libraryTarget: 'umd'
        },
    }
}
