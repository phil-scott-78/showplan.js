import Vue from 'vue';

import 'normalize.css';
import '../styles/styles.scss';
import VueDragscroll from 'vue-dragscroll';

import './string-extensions';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import {
    faCloudUploadAlt, faChevronCircleDown, faExclamationCircle, faSun, faMoon, faSearchMinus, faSearchPlus,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import setFilters from './setFilters';
import App from './App.vue';

Vue.config.productionTip = false;

setFilters();

library.add(faGithub, faCloudUploadAlt, faChevronCircleDown, faExclamationCircle, faSun, faMoon, faSearchMinus, faSearchPlus);
Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.component('sql-string', () => import('@/components/operations/SqlString.vue'));
Vue.use(VueDragscroll);

new Vue({
    render: h => h(App),
}).$mount('#app');
