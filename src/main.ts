import Vue from 'vue';
import App from './App.vue';

import 'normalize.css';
import './../styles/styles.scss';
import * as numbro from 'numbro';

Vue.config.productionTip = false;

setFilters();

import SqlString from '@/components/operations/SqlString.vue';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons';
import { faChevronCircleDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(faGithub, faCloudUploadAlt, faChevronCircleDown);
Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.component('sql-string', SqlString);

new Vue({
  render: (h) => h(App),
}).$mount('#app');

function setFilters() {
  Vue.filter('filterBytes', function(value: number) {
    return numbro(value).format(
      {
        output: 'byte',
        base: 'general',
        mantissa: 1,
      });
  });

  Vue.filter('filterKiloBytes', function(value: number) {
    return numbro(value * 1024).format(
      {
        output: 'byte',
        base: 'general',
        mantissa: 1,
      });
  });

  Vue.filter('filterSigfig', function(value: number) {
    return numbro(value).format('0[.]0000');
  });

  Vue.filter('filterPercent', function(value: number) {
    return numbro(value).format({ output: 'percent', mantissa: 0 });
  });

  Vue.filter('filterInteger', function(value: number) {
    return numbro(value).format('0,0');
  });

  Vue.filter('stripBrackets', function(value: string) {
    return value.split('[').join('').split(']').join('');
  });

  Vue.filter('ordinal', function(value: number) {
    return numbro(value).format({ output: 'ordinal' });
  });
}

String.prototype.replaceAll = function(this: string, search: string, replace: string) {
  const s = this;
  return s.split(search).join(replace);
};
