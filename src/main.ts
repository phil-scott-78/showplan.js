import Vue from 'vue';
import App from './App.vue';

import './../styles/styles.scss';

Vue.config.productionTip = false;

import ElementUI from 'element-ui';
Vue.use(ElementUI);

new Vue({
  render: (h) => h(App),
}).$mount('#app');
