const fs = require('fs');
const path = require('path');
const MFS = require('memory-fs');
const chokidar = require('chokidar');
const webpack = require('webpack');
const clientConfig = require('./webpack.client.conf');
const serverConfig = require('./webpack.server.conf');

const readFile = (fs, file) => {
    try {
        return fs.readFileSync(path.join(clientConfig.output.path, file), 'utf-8');
    } catch(err) {}
};

module.exports = function setupDevServer(app, templatePath, cb) {
    let bundle;
    let template;
    let clientManifest;
    let ready;

    const readyPromise = new Promise(r => { ready = r; });

    const update = () => {
        if (bundle && clientManifest) {
            ready();
            cb(bundle, {
                template,
                clientManifest
            });
        }
    }

    // 从内存里读取模板 html 并监听模板
    template = fs.readFileSync(templatePath, 'utf-8');
    chokidar.watch(templatePath).on('change', () => {
        template = fs.readFileSync(templatePath, 'utf-8');
        console.log('template.html updated.');
        update();
    });

    // 为客户端 webpack 配置添加热更新
    clientConfig.entry.app = ['webpack-hot-middleware/client', clientConfig.entry.app];
    clientConfig.output.filename = '[name].js';
    clientConfig.plugins.concat([
        new webpack.HotModuleReplacementPlugin(),
        // 在编译出现错误时，使用 NoEmitOnErrorsPlugin 来跳过输出阶段。这样可以确保输出资源不会包含错误
        new webpack.NoEmitOnErrorsPlugin()
    
    ]);

    const clientCompiler = webpack(clientConfig);
    const devMiddleware = require('webpack-dev-middleware')(clientCompiler, {
        publicPath: clientConfig.output.publicPath,
        noInfo: true,
    });

    app.use(async (ctx, next) => {
        try {
            let filePath = `${ process.cwd() }/dist/${ ctx.url }`;
            // 从内存里读取文件响应请求
            let file = devMiddleware.fileSystem.readFileSync(filePath, 'utf-8');
            if (file) {
                return (ctx.body = file);
            } else {
                await next();
            }
        } catch(e) {
            await next();
        }
    });

    // 用 koa2 的方式使用 express 中间件 webpack-dev-middleware 
    app.use((ctx, next) => {
        return devMiddleware(ctx.req, ctx.res, next);
    });
    
    clientCompiler.plugin('done', stats => {
        stats = stats.toJson();
        stats.errors.forEach(err => console.error(err));
        stats.warnings.forEach(err => console.warn(err));
        if (stats.errors.length) return;
        clientManifest = JSON.parse(readFile(
            devMiddleware.fileSystem,
            'vue-ssr-client-manifest.json'
        ));
       
        update();
    });

    // 用 koa2 的方式使用 express 中间件 webpack-hot-middleware
    app.use((ctx, next) => {
        let expressHotMiddle = require('webpack-hot-middleware')(clientCompiler, { heartbeat: 5000 });
        return expressHotMiddle(ctx.req, ctx.res, next);
    });

    // 监听并更新 server renderer
    const serverCompiler = webpack(serverConfig);
    const mfs = new MFS();
    serverCompiler.outputFileSystem = mfs;
    serverCompiler.watch({}, (err, stats) => {
        if (err) throw err;
        stats = stats.toJson();
        if (stats.errors.length) return;

        // 读取通过 vue-ssr-webpack-plugin 生成的 bundle
        bundle = JSON.parse(readFile(mfs, 'vue-ssr-server-bundle.json'));
        update();
    });

    return readyPromise;
}