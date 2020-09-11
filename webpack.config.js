module.exports ={
    entry: {
        main:'./main.js' // 入口文件
    },
    module: {
        rules:[
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader', // babel-loader 配置
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: [['@babel/plugin-transform-react-jsx',{pragma: 'createElement'}]] // jsx 插件 pragma参数指定翻译函数名
                    }
                }
            }
        ]
    },
    // build 的文件可以不压缩的两个配置
    mode: "development",
    optimization: {
        minimize: false
    }
}