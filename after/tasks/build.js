require('shelljs/global') // 调用sell命令新建或删除文件夹
const webpack = require('webpack')
const fs = require('fs') // 读取文件
const _ = require('lodash') // 提供工具函数
const { resolve } = require('path')

const r = url => resolve(process.cwd(), url) // 找到运行build脚本的工作路径

const webpackConf = require('./webpack.conf') // 获取webpack配置文件
const config = require(r('./mina-config')) // mina-config中约定了页面所在位置和基本变量，即小程序根目录下app.json文件内容
const assetsPath = r('./mina') // 需要部署的文件目录，编译后的文件存放位置

rm('rf', assetsPath) // 删除旧文件夹
mkdir(assetsPath) // 新建文件夹

var renderConf = webpackConf // 声明renderConf

// 定义入口文件
var entry = () => _.reduce(config.json.pages, (en, i) => {
    // 遍历所有的页面，逐个拿到.mina文件的路径
    en[i] = resolve(process.cwd(), './', `${i}.mina`)
    return en
}, {})

renderConf.entry = entry()
renderConf.entry.app = config.app

// 定义输出
renderConf.output = {
    path: r('./mina'),
    filename: '[name].js' // 同名js
}

// 声明编译器
var compiler = webpack(renderConf)

// 处理小程序配置文件
fs.writeFileSync(r('./mina/app.json'), JSON.stringify(config.json), 'utf8')

// 监听编译器
compiler.watch({
    aggregateTimeout: 300,
    poll: true
}, (err, stats) => {
    process.stdout.write(stats.toString({
        colors: true,
        modules: false,
        children: true,
        chunks: true,
        chunkModules: true
    }) + '\n\n')
})