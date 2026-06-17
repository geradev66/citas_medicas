<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '../../service/api'
import { useAreas } from '../../composables/useAreas'
import { usePacientes } from '../../composables/usePacientes'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import { toast } from 'vue3-toastify'
import Swal from 'sweetalert2/dist/sweetalert2.esm.all.js'

const { areas, fetchAreas } = useAreas()
const { pacientes: listaPacientes, fetchPacientes, error: pacientesError } = usePacientes()

const registros = ref([])
const loading = ref(false)
const visible = ref(false)
const editing = ref(null)
const filterDateRange = ref(null)
const filterEstado = ref(null)

const tiposTransaccion = [
    { name: 'Ingreso', code: 'ingreso' },
    { name: 'Egreso', code: 'egreso' },
]
const estados = [
    { name: 'Pendiente', code: 'pendiente' },
    { name: 'Confirmado', code: 'confirmado' },
    { name: 'Conciliado', code: 'conciliado' },
]
const metodosPago = [
    { name: 'Tarjeta de crédito', code: 'tarjeta_credito' },
    { name: 'Débito', code: 'debito' },
    { name: 'Transferencia', code: 'transferencia' },
    { name: 'Seguro médico', code: 'seguro_medico' },
]

const normalizeEstado = (estado) => {
    if (estado === true) return 'confirmado'
    if (estado === false) return 'pendiente'
    return estado || 'pendiente'
}

const estadoBadgeClass = (estado) => {
    const code = normalizeEstado(estado)
    if (code === 'conciliado') return 'bg-green-100 text-green-800'
    if (code === 'confirmado') return 'bg-blue-100 text-blue-800'
    return 'bg-amber-100 text-amber-800'
}

const estadoLabel = (estado) =>
    estados.find(e => e.code === normalizeEstado(estado))?.name ?? estado

const metodoPagoLabel = (code) =>
    metodosPago.find(m => m.code === code)?.name ?? code ?? '—'

const form = ref({
    tipoTransaccion: null,
    fecha: null,
    monto: null,
    areas: null,
    descripcion: '',
    paciente: null,
    proveedor: '',
    notasAdicionales: '',
    estado: null,
    metodoPago: null,
})

const pacientesOptions = computed(() => {
    const options = listaPacientes.value.map(p => ({
        ...p,
        fullName: `${p.name || ''} ${p.lastName || ''}`.trim(),
    }))
    const selected = form.value.paciente
    if (selected && !options.some(p => (p._id ?? p.id) == (selected._id ?? selected.id))) {
        options.unshift({
            ...selected,
            fullName: selected.fullName || `${selected.name || ''} ${selected.lastName || ''}`.trim(),
        })
    }
    return options
})

const resolvePaciente = (row) => {
    const id = row.pacientes?._id ?? row.pacientes?.id ?? row.pacientes
    if (id != null) {
        const found = listaPacientes.value.find(p => (p._id ?? p.id) == id)
        if (found) return found
    }
    return row.pacienteInfo ?? null
}

const ensurePacientes = async () => {
    await fetchPacientes()
    if (pacientesError.value) {
        toast.error('Error al cargar pacientes')
    }
}

const fetchRegistros = async () => {
    loading.value = true
    try {
        const { data } = await api.get('/ingresos-egresos')
        registros.value = data
    } catch {
        toast.error('Error al cargar registros')
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchRegistros()
    fetchAreas()
    fetchPacientes()
})

const filteredRegistros = computed(() => {
    let result = registros.value
    if (filterDateRange.value?.[0] && filterDateRange.value?.[1]) {
        const start = filterDateRange.value[0]
        const end = filterDateRange.value[1]
        result = result.filter(r => {
            if (!r.fecha) return false
            const d = new Date(r.fecha.slice(0, 10) + 'T00:00:00')
            return d >= start && d <= end
        })
    }
    if (filterEstado.value != null) {
        result = result.filter(r => normalizeEstado(r.estado) === filterEstado.value.code)
    }
    return result
})

const totalIngresos = computed(() =>
    filteredRegistros.value
        .filter(r => r.tipoTransaccion === 'ingreso')
        .reduce((s, r) => s + Number(r.monto), 0)
)
const totalEgresos = computed(() =>
    filteredRegistros.value
        .filter(r => r.tipoTransaccion === 'egreso')
        .reduce((s, r) => s + Number(r.monto), 0)
)
const balanceNeto = computed(() => totalIngresos.value - totalEgresos.value)

const openCreate = async () => {
    await ensurePacientes()
    editing.value = null
    form.value = {
        tipoTransaccion: null,
        fecha: null,
        monto: null,
        areas: null,
        descripcion: '',
        paciente: null,
        proveedor: '',
        notasAdicionales: '',
        estado: null,
        metodoPago: null,
    }
    visible.value = true
}

const openEdit = async (row) => {
    await ensurePacientes()
    editing.value = row
    form.value = {
        tipoTransaccion: tiposTransaccion.find(t => t.code === row.tipoTransaccion) ?? null,
        fecha: row.fecha ? (() => { const [y, m, d] = row.fecha.split('-'); return new Date(+y, +m - 1, +d) })() : null,
        monto: row.monto,
        areas: areas.value.find(a => (a._id ?? a.id) === (row.areas?._id ?? row.areas?.id ?? row.areas)) ?? null,
        descripcion: row.descripcion || '',
        paciente: resolvePaciente(row),
        proveedor: row.proveedor || '',
        notasAdicionales: row.notasAdicionales || '',
        estado: estados.find(e => e.code === normalizeEstado(row.estado)) ?? null,
        metodoPago: metodosPago.find(m => m.code === row.metodoPago) ?? null,
    }
    visible.value = true
}

const handleSave = async () => {
    if (!form.value.tipoTransaccion || !form.value.fecha || form.value.monto == null) {
        toast.warning('Completa los campos obligatorios')
        return
    }

    const payload = {
        tipoTransaccion: form.value.tipoTransaccion.code,
        fecha: form.value.fecha instanceof Date
            ? `${form.value.fecha.getFullYear()}-${String(form.value.fecha.getMonth() + 1).padStart(2, '0')}-${String(form.value.fecha.getDate()).padStart(2, '0')}`
            : form.value.fecha,
        monto: form.value.monto,
        areas: form.value.areas?._id ?? form.value.areas?.id ?? form.value.areas ?? null,
        descripcion: form.value.descripcion || null,
        pacientes: form.value.paciente?._id ?? form.value.paciente?.id ?? form.value.paciente ?? null,
        proveedor: form.value.proveedor || null,
        notasAdicionales: form.value.notasAdicionales,
        estado: form.value.estado?.code ?? form.value.estado ?? 'pendiente',
        metodoPago: form.value.metodoPago?.code ?? form.value.metodoPago ?? null,
    }

    try {
        if (editing.value) {
            const { data } = await api.put(`/ingresos-egresos/${editing.value._id ?? editing.value.id}`, payload)
            const idx = registros.value.findIndex(r => (r._id ?? r.id) === (editing.value._id ?? editing.value.id))
            if (idx !== -1) registros.value[idx] = data
            toast.success('Registro actualizado')
        } else {
            const { data } = await api.post('/ingresos-egresos', payload)
            registros.value.push(data)
            toast.success('Registro creado')
        }
        visible.value = false
    } catch {
        toast.error('Error al guardar el registro')
    }
}

const handleExportExcel = async () => {
    try {
        const response = await api.get('/ingresos-egresos/export/excel', { responseType: 'blob' })
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'ingresos_egresos.xlsx')
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
        toast.success('Excel exportado correctamente')
    } catch {
        toast.error('Error al exportar a Excel')
    }
}

const handleDelete = async (row) => {
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: `Eliminar registro de ${row.tipoTransaccion} por $${row.monto}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
    })
    if (!result.isConfirmed) return
    try {
        await api.delete(`/ingresos-egresos/${row._id ?? row.id}`)
        registros.value = registros.value.filter(r => (r._id ?? r.id) !== (row._id ?? row.id))
        toast.success('Registro eliminado')
    } catch {
        toast.error('Error al eliminar')
    }
}
</script>

<template>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-xl shadow-sm border-l-4 border-l-green-500 border border-surface-200 p-5">
            <div class="flex items-center justify-between mb-3">
                <p class="text-surface-500 text-2xl font-medium">Total Ingresos</p>
                <i class="fa-solid fa-arrow-up text-green-500 text-4xl"></i>
            </div>
            <p class="text-3xl font-bold text-surface-900">${{ totalIngresos.toLocaleString() }}</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border-l-4 border-l-red-500 border border-surface-200 p-5">
            <div class="flex items-center justify-between mb-3">
                <p class="text-surface-500 text-2xl font-medium">Total Egresos</p>
                <i class="fa-solid fa-arrow-down text-red-500 text-4xl"></i>
            </div>
            <p class="text-3xl font-bold text-surface-900">${{ totalEgresos.toLocaleString() }}</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border-l-4 border-l-blue-500 border border-surface-200 p-5">
            <div class="flex items-center justify-between mb-3">
                <p class="text-surface-500 text-2xl font-medium">Balance Neto</p>
                <i class="fa-solid fa-scale-balanced text-blue-500 text-4xl"></i>
            </div>
            <p class="text-3xl font-bold" :class="balanceNeto >= 0 ? 'text-green-600' : 'text-red-600'">${{ balanceNeto.toLocaleString() }}</p>
        </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <DatePicker
            v-model="filterDateRange"
            selectionMode="range"
            :manualInput="false"
            placeholder="Filtrar por fecha"
            dateFormat="dd/mm/yy"
            fluid
        />
        <Select
            v-model="filterEstado"
            :options="estados"
            optionLabel="name"
            placeholder="Filtrar por estado"
            showClear
            fluid
        />
        <div class="flex gap-4 justify-center">
            <button class="bg-purple-500 p-2 rounded text-white shadow-md hover:bg-purple-700 cursor-pointer font-bold w-full" @click="filterDateRange = null; filterEstado = null"><i class="fa-solid fa-xmark"></i> Limpiar Filtros</button>
            <button class="bg-green-500 text-white p-2 rounded-md cursor-pointer hover:bg-green-700 w-full" @click="handleExportExcel"><i class="fa-solid fa-file-excel"></i> Exportar a Excel</button>
        </div>
    </div>
    <Card>
        <template #content>
            <div class="flex justify-between items-center p-4 mb-3">
                <h2>Ingresos y Egresos</h2>
                <button class="bg-emerald-500 p-2 rounded text-white shadow-md hover:bg-emerald-700 cursor-pointer font-bold" @click="openCreate">
                    <i class="fa-solid fa-plus"></i> Nuevo Registro
                </button>
            </div>

            <DataTable :value="filteredRegistros" :loading="loading" stripedRows paginator :rows="10" :rowsPerPageOptions="[5, 10, 20]">
                <Column field="tipoTransaccion" header="Tipo" sortable>
                    <template #body="{ data }">
                        <span :class="data.tipoTransaccion === 'ingreso' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="px-2 py-1 rounded text-sm font-medium">
                            {{ data.tipoTransaccion === 'ingreso' ? 'Ingreso' : 'Egreso' }}
                        </span>
                    </template>
                </Column>
                <Column field="fecha" header="Fecha" sortable>
                    <template #body="{ data }">{{ data.fecha?.slice(0, 10) }}</template>
                </Column>
                <Column field="areas" header="Área" sortable>
                    <template #body="{ data }">{{ data.areaInfo?.name || data.areas?.name || '—' }}</template>
                </Column>
                <Column field="monto" header="Monto" sortable>
                    <template #body="{ data }">${{ Number(data.monto).toLocaleString() }}</template>
                </Column>
                <Column field="descripcion" header="Descripción" />
                <Column field="pacientes" header="Paciente" sortable>
                    <template #body="{ data }">
                        {{ data.pacienteInfo ? `${data.pacienteInfo.name} ${data.pacienteInfo.lastName || ''}`.trim() : '—' }}
                    </template>
                </Column>
                <Column field="proveedor" header="Proveedor" />
                <Column field="estado" header="Estado">
                    <template #body="{ data }">
                        <span :class="estadoBadgeClass(data.estado)" class="px-2 py-1 rounded text-sm font-medium">
                            {{ estadoLabel(data.estado) }}
                        </span>
                    </template>
                </Column>
                <Column field="metodoPago" header="Método de pago">
                    <template #body="{ data }">{{ metodoPagoLabel(data.metodoPago) }}</template>
                </Column>
                <Column header="Acciones" style="width: 120px">
                    <template #body="{ data }">
                        <Button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-sm" @click="openEdit(data)" />
                        <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-sm p-button-danger" @click="handleDelete(data)" />
                    </template>
                </Column>
            </DataTable>

            <Dialog v-model:visible="visible" modal :header="editing ? 'Editar registro' : 'Nuevo registro'" :style="{ width: '50rem' }">
                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col">
                        <label class="font-bold">Tipo de transacción *</label>
                        <Select v-model="form.tipoTransaccion" :options="tiposTransaccion" optionLabel="name" placeholder="Selecciona tipo" class="w-full" />
                    </div>
                    <div class="flex flex-col">
                        <label class="font-bold">Fecha *</label>
                        <DatePicker v-model="form.fecha" class="w-full" dateFormat="dd/mm/yy" />
                    </div>
                    <div class="flex flex-col">
                        <label class="font-bold">Monto *</label>
                        <InputNumber v-model="form.monto" placeholder="0.00" :minFractionDigits="2" class="w-full" />
                    </div>
                    <div class="flex flex-col">
                        <label class="font-bold">Área</label>
                        <Select v-model="form.areas" :options="areas" optionLabel="name" placeholder="Selecciona área" class="w-full" />
                    </div>
                    <div class="flex flex-col">
                        <label class="font-bold">Paciente</label>
                        <Select
                            v-model="form.paciente"
                            :options="pacientesOptions"
                            optionLabel="fullName"
                            dataKey="_id"
                            placeholder="Selecciona paciente"
                            showClear
                            filter
                            filterPlaceholder="Buscar paciente..."
                            class="w-full"
                        />
                    </div>
                    <div class="flex flex-col">
                        <label class="font-bold">Proveedor</label>
                        <InputText v-model="form.proveedor" placeholder="Nombre del proveedor" />
                    </div>
                    <div class="flex flex-col col-span-2">
                        <label class="font-bold">Descripción</label>
                        <Textarea v-model="form.descripcion" placeholder="Descripción de la transacción" class="w-full" />
                    </div>
                    <div class="flex flex-col col-span-2">
                        <label class="font-bold">Notas adicionales</label>
                        <Textarea v-model="form.notasAdicionales" placeholder="Notas adicionales" class="w-full" />
                    </div>
                    <div class="flex flex-col">
                        <label class="font-bold">Estado</label>
                        <Select v-model="form.estado" :options="estados" optionLabel="name" placeholder="Selecciona estado" class="w-full" />
                    </div>
                    <div class="flex flex-col">
                        <label class="font-bold">Método de pago</label>
                        <Select v-model="form.metodoPago" :options="metodosPago" optionLabel="name" placeholder="Selecciona método de pago" showClear class="w-full" />
                    </div>
                </div>
                <div class="flex justify-end gap-2 mt-4">
                    <Button label="Cancelar" severity="secondary" @click="visible = false" />
                    <Button label="Guardar" @click="handleSave" />
                </div>
            </Dialog>
        </template>
    </Card>
</template>
