import { createStore } from 'vuex'

export default createStore({
  state: {
    searchHistory: []
  },
  getters: {
  },
  mutations: {
    addSearchHistory(state, record) {
      state.searchHistory.push(record)
    }
  },
  actions: {
  },
  modules: {
  }
})
