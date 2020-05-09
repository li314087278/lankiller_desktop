import Vue from 'vue'


import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import '@mdi/font/css/materialdesignicons.css';
import App from './App'

Vue.use(ElementUI);

window.oui=require("./oui.json")

const {crashReporter} = require('electron')

crashReporter.start({
  productName: 'lancut',
  companyName: 'lancut',
  submitURL: '',
  uploadToServer: false,
});

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  template: '<App/>'
}).$mount('#app')
