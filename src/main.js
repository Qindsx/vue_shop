import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/element.js'

// 导入字体图标
import './assets/fonts/iconfont.css'
import './assets/css/global.css'

// 导入axios
import axios from 'axios'
Vue.prototype.$http = axios;
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/';

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
