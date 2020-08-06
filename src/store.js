import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

import { fetchItem } from './api';

export function createStore() {
    return new Vuex.Store({
        state: {
            items: {},
            articles: []
        },
        actions: {
            fetchItem({ commit }, id) {
                return fetchItem(id).then(res => {
                    if (res.data.code) {
                        commit('setItem', { id, item: res.data });
                    }
                });
            }
        },
        mutations: {
            setItem(state, { id, item}) {
                Vue.set(state.items, id, item);
            }
        },
        getters: {
            items :state => state.items,
            articles: state => state.articles
        }
    });
}