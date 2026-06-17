import AppLayout from '@/layout/AppLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'login',
            component: () => import('../views/pages/auth/Login.vue')
        },
        {
            path: '/auth/register',
            name: 'register',
            component: () => import('../views/pages/auth/Register.vue')
        },
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '/inicio',
                    name: 'inicio',
                    meta: { requiresAuth: true },
                    component: () => import('../views/pages/Inicio.vue')
                },
                {
                    path: '/citas',
                    name: 'citas',
                    meta: { requiresAuth: true },
                    component: () => import('../views/pages/Citas.vue')
                },
                {
                    path: '/pacientes',
                    name: 'pacientes',
                    meta: { requiresAuth: true },
                    component: () => import('../views/pages/Pacientes.vue')
                },
                {
                    path: '/medicos',
                    name: 'medicos',
                    meta: { requiresAuth: true },
                    component: () => import('../views/pages/Medicos.vue')
                },
                {
                    path: '/areas',
                    name: 'areas',
                    meta: { requiresAuth: true },
                    component: () => import('../views/pages/Areas.vue')
                },
                {
                    path: '/ingresos-egresos',
                    name: 'ingresos-egresos',
                    meta: { requiresAuth: true },
                    component: () => import('../views/pages/IngresosEgresos.vue')
                },
            ]
        },
        {
            path: '/landing',
            name: 'landing',
            component: () => import('../views/pages/Landing.vue')
        },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('../views/pages/NotFound.vue')
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('../views/pages/auth/Access.vue')
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('../views/pages/auth/Error.vue')
        }
    ]
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next('/')
  } else {
    next()
  }
})

export default router;
