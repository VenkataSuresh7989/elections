import { createRouter, createWebHistory } from 'vue-router'
import MaintancePage from '../views/MaintancePage.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: MaintancePage
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
