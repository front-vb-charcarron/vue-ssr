import { createApp } from './app';

export default context => {
    // 等待所有内容在渲染前就已经准备好
    return new Promise((resolve, reject) => {
        const { app, router, store } = createApp();
        // 设置服务端 router 的位置
        router.push(context.url);
        // 等待 router 将可能的异步组件和钩子函数解析完
        router.onReady(() => {
            // 返回目标位置或者当前路由匹配的组件数组（通常在服务端渲染的数据预加载使用）
            const matchedComponents = router.getMatchedComponents();
            // 匹配不到的路由，返回404
            if (!matchedComponents.length) {
                return reject({ code: 404 });
            }
            // 对所有匹配的路由组件调用`asyncData()`
            Promise.all(matchedComponents.map(Component => {
                if (Component.asyncData) {
                    return Component.asyncData({ 
                        store,
                        route: router.currentRoute
                     });
                }
            })).then(() => {
                // 在所有预取钩子(preFetch hook) resolve 后，
                // 我们的 store 现在已经填充入渲染应用程序所需的状态。
                // 当我们将状态附加到上下文，
                // 并且 `template` 选项用于 renderer 时，
                // 状态将自动序列化为 `window.__INITIAL_STATE__`，并注入 HTML。
                context.state = store.state;
                resolve(app);
            }).catch(reject);
        });
    });
}