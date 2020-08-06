const Koa = require('koa2');
const Router = require('koa-router');
const static = require('koa-static');
const { join } = require('path');
const server = new Koa();
const router = new Router();
const { createBundleRenderer } = require('vue-server-renderer');
const fs = require('fs');
const favicon = require('koa-favicon');

let renderer;
let readyPromise;
const createRenderer = (serverBundle, { template, clientManifest }) => {
    return createBundleRenderer(serverBundle, {
        runInNewContext: false,
        template,
        clientManifest
    });
}

const isProd = process.argv[2] === 'production';;
const templatePath = `${ process.cwd() }/public/template.html`;

server.use(favicon(`${ process.cwd() }/public/favicon.ico`));
isProd ? server.use(static(join(process.cwd(), 'dist'))) : '';

router.get('/test/:id', async ctx => {
    ctx.set('Content-Type', 'application/json;utf-8');
    const { id } = ctx.params;
    console.log("TCL: id", id)

    function getData() {
        return new Promise(resolve => {
            resolve({
                code: 200,
                title: 'test'
            });
        });
    }
    ctx.body = await getData();
});

if (isProd) {
    const template = fs.readFileSync(templatePath, 'utf-8');
    const serverBundle = require(`${ process.cwd() }/dist/vue-ssr-server-bundle.json`);
    const clientManifest = require(`${ process.cwd() }/dist/vue-ssr-client-manifest.json`);
    renderer = createRenderer(serverBundle, { template, clientManifest });
} else {
    readyPromise = require(`${ process.cwd() }/build/setup-dev-server`)(
        server,
        templatePath,
        (bundle, options) => {
            renderer = createRenderer(bundle, options);
        }
    );
}

router.get('*', async ctx => {
    const context = {
        url: ctx.url, // 这个不能删除，可能是根据 url 渲染客户端路由
        title: 'Vue SSR',
        meta: `<meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">`
    };

    function renderToString(renderer) {
        return new Promise((resolve, reject) => {
            renderer.renderToString(context, (err, html) => {
                err ? reject(err) : resolve(html);
            });
        }).catch(err => {
            throw err;
        });
    }
    
    if (isProd) {
        ctx.body = await renderToString(renderer)
    } else {
        ctx.body = await readyPromise.then(async() => {
            return await renderToString(renderer);
        });
    }
});

server.use(router.routes());
server.on("error", (err, ctx) => {
    console.log(err)
});
server.listen(8089, () => {
    console.log('服务运行在http://127.0.0.1:8089');
});