import Vue from 'vue';
import App from './App.vue';
import { createRouter } from './router';
import { createStore } from './store';
import { sync } from 'vuex-router-sync';

/**
 * 导出一个工厂函数，每次请求都新建一个 router、store、vue 实例，
 * 防止交叉请求时状态污染
 * @export
 * @returns
 */
export function createApp() {
    const router = createRouter();
    const store = createStore();

    sync(store, router);

    const app = new Vue({
        router,
        store,
        render: h => h(App)
    });

    return { app, router, store };
}