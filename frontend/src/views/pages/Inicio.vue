<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useLayout } from '@/layout/composables/layout'
import { api } from '../../service/api'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { toast } from 'vue3-toastify'

const { layoutConfig, isDarkTheme } = useLayout()

const loading = ref(true)
const ingresosMensuales = ref(0)
const egresosMensuales = ref(0)
const totalCitas = ref(0)
const totalPacientes = ref(0)
const pacientesRecientes = ref([])
const resumenMensual = ref([])
const citasData = ref([])

const barChartData = ref(null)
const barChartOptions = ref(null)
const donutChartData = ref(null)
const donutChartOptions = ref(null)

const mesesCortos = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const citasStatusLabels = {
    pendiente: 'Pendientes',
    confirmada: 'Confirmadas',
    cancelada: 'Canceladas',
    completada: 'Completadas',
}

const formatMes = (periodo) => {
    const d = new Date(periodo)
    if (Number.isNaN(d.getTime())) return String(periodo)
    return `${mesesCortos[d.getMonth()]} ${d.getFullYear()}`
}

const formatFecha = (fecha) => {
    if (!fecha) return '—'
    const d = new Date(fecha)
    if (Number.isNaN(d.getTime())) return fecha.slice?.(0, 10) ?? fecha
    return d.toLocaleDateString('es-ES')
}

const rangoMesActual = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const lastDay = new Date(year, month + 1, 0).getDate()
    return {
        inicio: `${year}-${String(month + 1).padStart(2, '0')}-01`,
        fin: `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`,
    }
}

const rangoUltimosMeses = (cantidad = 6) => {
    const fin = new Date()
    const inicio = new Date(fin.getFullYear(), fin.getMonth() - (cantidad - 1), 1)
    return {
        inicio: `${inicio.getFullYear()}-${String(inicio.getMonth() + 1).padStart(2, '0')}-01`,
        fin: `${fin.getFullYear()}-${String(fin.getMonth() + 1).padStart(2, '0')}-${String(fin.getDate()).padStart(2, '0')}`,
    }
}

const buildBarChart = (resumenMensual) => {
    const documentStyle = getComputedStyle(document.documentElement)
    const textColor = documentStyle.getPropertyValue('--text-color')
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary')
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border')

    const sorted = [...resumenMensual].sort((a, b) => new Date(a.periodo) - new Date(b.periodo))
    const labels = sorted.map(r => formatMes(r.periodo))

    barChartData.value = {
        labels,
        datasets: [
            {
                label: 'Ingresos',
                backgroundColor: '#22c55e',
                borderColor: '#16a34a',
                data: sorted.map(r => r.ingresos ?? 0),
                borderRadius: 6,
            },
            {
                label: 'Egresos',
                backgroundColor: '#ef4444',
                borderColor: '#dc2626',
                data: sorted.map(r => r.egresos ?? 0),
                borderRadius: 6,
            },
        ],
    }

    barChartOptions.value = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: textColor },
            },
        },
        scales: {
            x: {
                ticks: { color: textColorSecondary },
                grid: { display: false, drawBorder: false },
            },
            y: {
                ticks: { color: textColorSecondary },
                grid: { color: surfaceBorder, drawBorder: false },
            },
        },
    }
}

const buildDonutChart = (citas) => {
    const documentStyle = getComputedStyle(document.documentElement)
    const textColor = documentStyle.getPropertyValue('--text-color')
    const statuses = ['pendiente', 'confirmada', 'cancelada', 'completada']
    const counts = statuses.map(s => citas.filter(c => (c.status || 'pendiente') === s).length)

    donutChartData.value = {
        labels: statuses.map(s => citasStatusLabels[s]),
        datasets: [
            {
                data: counts,
                backgroundColor: ['#6b7280', '#22c55e', '#ef4444', '#3b82f6'],
                hoverBackgroundColor: ['#4b5563', '#16a34a', '#dc2626', '#2563eb'],
            },
        ],
    }

    donutChartOptions.value = {
        maintainAspectRatio: false,
        cutout: '55%',
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    usePointStyle: true,
                    color: textColor,
                    padding: 16,
                },
            },
        },
    }
}

const fetchDashboard = async () => {
    loading.value = true
    try {
        const mesActual = rangoMesActual()
        const ultimosMeses = rangoUltimosMeses(6)

        const [balanceRes, resumenRes, citasRes, pacientesRes] = await Promise.all([
            api.get('/ingresos-egresos/balance', {
                params: { fechaInicio: mesActual.inicio, fechaFin: mesActual.fin },
            }),
            api.get('/ingresos-egresos/resumen/periodo', {
                params: { periodo: 'mensual', fechaInicio: ultimosMeses.inicio, fechaFin: ultimosMeses.fin },
            }),
            api.get('/citas'),
            api.get('/pacientes'),
        ])

        ingresosMensuales.value = balanceRes.data.ingresos ?? 0
        egresosMensuales.value = balanceRes.data.egresos ?? 0

        const citas = citasRes.data ?? []
        const pacientes = pacientesRes.data ?? []

        totalCitas.value = citas.length
        totalPacientes.value = pacientes.length

        pacientesRecientes.value = [...pacientes]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 8)

        resumenMensual.value = resumenRes.data ?? []
        citasData.value = citas

        buildBarChart(resumenMensual.value)
        buildDonutChart(citasData.value)
    } catch {
        toast.error('Error al cargar el dashboard')
    } finally {
        loading.value = false
    }
}

watch([() => layoutConfig.primary, () => layoutConfig.surface, isDarkTheme], () => {
    if (resumenMensual.value.length) buildBarChart(resumenMensual.value)
    if (donutChartData.value) buildDonutChart(citasData.value)
})

onMounted(fetchDashboard)

const mesActualLabel = computed(() => {
    const now = new Date()
    return now.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
})
</script>

<template>
    <div class="font-semibold text-2xl mb-4">Inicio</div>

    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-xl shadow-sm border-l-4 border-l-green-500 border border-surface-200 p-5">
            <div class="flex items-center justify-between mb-3">
                <p class="text-surface-500 text-lg font-medium">Ingresos mensuales</p>
                <i class="fa-solid fa-arrow-trend-up text-green-500 text-3xl"></i>
            </div>
            <p class="text-3xl font-bold text-surface-900">${{ ingresosMensuales.toLocaleString() }}</p>
            <p class="text-sm text-surface-500 mt-1 capitalize">{{ mesActualLabel }}</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border-l-4 border-l-red-500 border border-surface-200 p-5">
            <div class="flex items-center justify-between mb-3">
                <p class="text-surface-500 text-lg font-medium">Egresos mensuales</p>
                <i class="fa-solid fa-arrow-trend-down text-red-500 text-3xl"></i>
            </div>
            <p class="text-3xl font-bold text-surface-900">${{ egresosMensuales.toLocaleString() }}</p>
            <p class="text-sm text-surface-500 mt-1 capitalize">{{ mesActualLabel }}</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border-l-4 border-l-blue-500 border border-surface-200 p-5">
            <div class="flex items-center justify-between mb-3">
                <p class="text-surface-500 text-lg font-medium">Citas</p>
                <i class="fa-solid fa-calendar-check text-blue-500 text-3xl"></i>
            </div>
            <p class="text-3xl font-bold text-surface-900">{{ totalCitas.toLocaleString() }}</p>
            <p class="text-sm text-surface-500 mt-1">Total registradas</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border-l-4 border-l-purple-500 border border-surface-200 p-5">
            <div class="flex items-center justify-between mb-3">
                <p class="text-surface-500 text-lg font-medium">Pacientes</p>
                <i class="fa-solid fa-user-injured text-purple-500 text-3xl"></i>
            </div>
            <p class="text-3xl font-bold text-surface-900">{{ totalPacientes.toLocaleString() }}</p>
            <p class="text-sm text-surface-500 mt-1">Total registrados</p>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card>
            <template #content>
                <div class="p-4">
                    <h3 class="font-semibold text-xl mb-4">Ingresos y egresos por mes</h3>
                    <div class="h-96 min-h-[24rem]">
                        <Chart
                            v-if="barChartData"
                            type="bar"
                            :data="barChartData"
                            :options="barChartOptions"
                            class="h-full w-full"
                        />
                        <div v-else-if="loading" class="h-full flex items-center justify-center text-surface-500">
                            Cargando gráfica...
                        </div>
                    </div>
                </div>
            </template>
        </Card>
        <Card>
            <template #content>
                <div class="p-4">
                    <h3 class="font-semibold text-xl mb-4">Citas por estado</h3>
                    <div class="h-96 min-h-[24rem]">
                        <Chart
                            v-if="donutChartData"
                            type="doughnut"
                            :data="donutChartData"
                            :options="donutChartOptions"
                            class="h-full w-full"
                        />
                        <div v-else-if="loading" class="h-full flex items-center justify-center text-surface-500">
                            Cargando gráfica...
                        </div>
                    </div>
                </div>
            </template>
        </Card>
    </div>

    <Card>
        <template #content>
            <div class="p-4">
                <h3 class="font-semibold text-xl mb-4">Pacientes recientemente agregados</h3>
                <DataTable
                    :value="pacientesRecientes"
                    :loading="loading"
                    stripedRows
                    paginator
                    :rows="5"
                    :rowsPerPageOptions="[5, 8]"
                >
                    <Column field="name" header="Nombre" sortable />
                    <Column field="lastName" header="Apellido" sortable />
                    <Column field="phoneNumber" header="Teléfono" />
                    <Column field="insurance" header="Seguro" />
                    <Column field="gender" header="Género">
                        <template #body="{ data }">
                            {{ data.gender === 'M' ? 'Masculino' : data.gender === 'F' ? 'Femenino' : data.gender }}
                        </template>
                    </Column>
                    <Column field="createdAt" header="Fecha de registro" sortable>
                        <template #body="{ data }">{{ formatFecha(data.createdAt) }}</template>
                    </Column>
                </DataTable>
            </div>
        </template>
    </Card>
</template>
