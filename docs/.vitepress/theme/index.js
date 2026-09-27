import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import HomeWorkbench from './components/HomeWorkbench.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('HomeWorkbench', HomeWorkbench)
  }
}
