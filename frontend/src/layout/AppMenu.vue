<script setup>
import { ref } from 'vue';
import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        label: 'Home',
        items: [
            {
                label: 'Inicio',
                icon: 'pi pi-fw pi-home',
                to: '/inicio'
            },
            {
                label: 'Citas',
                icon: 'pi pi-fw pi-calendar-plus',
                to: '/citas'
            },
            {
                label: 'Pacientes',
                icon: 'pi pi-fw pi-user',
                to: '/pacientes'
            },
            {
                label: 'Medicos',
                icon: 'pi pi-fw pi-users',
                to: '/medicos'
            },
            {
                label: 'Areas',
                icon: 'pi pi-fw pi-building',
                to: '/areas'
            },
            {
                label: 'Ingresos Egresos',
                icon: 'pi pi-fw pi-money-bill',
                to: '/ingresos-egresos'
            }
        ]
    }
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
