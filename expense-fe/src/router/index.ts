import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/flashcard',
      name: 'flashcard',
      component: () => import('../views/FlashcardView.vue'),
    },
    {
      path: '/vocabulary',
      name: 'vocabulary',
      component: () => import('../views/VocabularyListView.vue'),
    },
  ],
})

router.beforeEach((to, from, next) => {
  const publicPages = ['/login', '/register'];
  const authRequired = !publicPages.includes(to.path);
  const user = localStorage.getItem('user');
  if (authRequired && !user) {
    return next('/login');
  }
  next();
});

export default router