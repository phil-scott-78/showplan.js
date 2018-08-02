import Vue from 'vue';
import App from './App.vue';

import 'normalize.css';
import './../styles/styles.scss';
import * as numeral from 'numeral';

Vue.config.productionTip = false;

setFilters();

new Vue({
  render: (h) => h(App),
}).$mount('#app');

function setFilters() {
  Vue.filter('filterBytes', function(value: number) {
    return numeral(value).format('0 ib').replace('KiB', 'KB');
  });

  Vue.filter('filterKiloBytes', function(value: number) {
    return numeral(value * 1024).format('0.0 ib').replace('KiB', 'KB');
  });

  Vue.filter('filterSigfig', function(value: number) {
    return numeral(value).format('0[.]0000');
  });

  Vue.filter('filterPercent', function(value: number) {
    return numeral(value).format('0%');
  });

  Vue.filter('filterInteger', function(value: number) {
    return numeral(value).format('0,0');
  });

  Vue.filter('stripBrackets', function(value: string) {
    return value.split('[').join('').split(']').join('');
  });
}

String.prototype.replaceAll = function(this: string, search: string, replace: string) {
  const s = this;
  return s.split(search).join(replace);
};
