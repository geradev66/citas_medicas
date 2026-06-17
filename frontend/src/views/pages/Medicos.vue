<script setup>
import Card from 'primevue/card';
import {ref, onMounted, computed, watch} from 'vue'
import { useMedicos } from '../../composables/useMedicos'
import { useAreas } from '../../composables/useAreas'
import Datatable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import {toast} from 'vue3-toastify'
import Swal from 'sweetalert2/dist/sweetalert2.esm.all.js'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import Checkbox from 'primevue/checkbox'
import { api } from '../../service/api'


const genders = [
    { name: 'Masculino', code: 'M' },
    { name: 'Femenino', code: 'F' },
]

const { medicos, loading, error, fetchMedicos, createMedico, updateMedicos, deleteMedico } = useMedicos()
const { areas, fetchAreas } = useAreas()

const visible = ref(false)
const editingMedico = ref(null)
const form = ref({
    name: '',
    lastName: '',
    gender: null,
    email: '',
    birthDate: null,
    especiality: null,
    status: true
})

onMounted(() => {
    fetchMedicos()
    fetchAreas()
})

const openCreate = () => {
    editingMedico.value = null
    form.value = { name: '', lastName: '', gender: null, email: '', birthDate: null, especiality: null, status: true }
    visible.value = true
}

const openEdit = (medico) => {
    editingMedico.value = medico
    const espId = medico.especiality?._id ?? medico.especiality?.id ?? medico.especiality
    prevEspId.value = espId
    form.value = {
        name: medico.name,
        lastName: medico.lastName,
        gender: genders.find(g => g.code === medico.gender),
        email: medico.email,
        birthDate: medico.birthDate ? (() => { const [y, m, d] = medico.birthDate.split('-'); return new Date(+y, +m - 1, +d) })() : null,
        especiality: areas.value.find(a => (a._id ?? a.id) === espId) ?? null,
        status: medico.status ?? true,
    }
    visible.value = true
}

const handleSave = async () => {
    if (!form.value.name?.trim() || !form.value.lastName?.trim() || !form.value.email?.trim()) return

    // formatear la fecha de nacimiento
    const payload = {
        name: form.value.name,
        lastName: form.value.lastName,
        gender: form.value.gender?.code || form.value.gender,
        email: form.value.email,
        birthDate: form.value.birthDate instanceof Date
            ? `${form.value.birthDate.getFullYear()}-${String(form.value.birthDate.getMonth() + 1).padStart(2, '0')}-${String(form.value.birthDate.getDate()).padStart(2, '0')}`
            : form.value.birthDate,
        especiality: form.value.especiality?._id || form.value.especiality,
        status: form.value.status,
    }

    if (editingMedico.value) {
        await updateMedicos({ _id: editingMedico.value._id, ...payload })
        toast.success('Médico actualizado correctamente')
    } else {
        await createMedico(payload)
        toast.success('Médico creado correctamente')
    }

    visible.value = false
}

const handleDelete = async (medico) => {
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: `Estás seguro que deseas eliminar al médico ${medico.name}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
    })
    if (result.isConfirmed) {
        await deleteMedico(medico)
        toast.success('Médico eliminado correctamente')
    }
}


//filtros para la tabla

const filterName = ref('')
const filterEspeciality = ref(null)

const handleExportExcel = async () => {
    try {
        const response = await api.get('/medicos/export/excel', { responseType: 'blob' })
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'medicos.xlsx')
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
        toast.success('Excel exportado correctamente')
    } catch {
        toast.error('Error al exportar a Excel')
    }
}

// actualiza especialidad cuando las areas terminan de cargar (en edicion)
const prevEspId = ref(null)
watch(areas, () => {
    if (editingMedico.value && prevEspId.value != null) {
        form.value.especiality = areas.value.find(a => (a._id ?? a.id) === prevEspId.value) ?? null
    }
})

// filtros para la tabla

const filteredMedicos = computed(() => {
  const name = (filterName.value || '').toLowerCase().trim()
  return medicos.value.filter(m => {
    const matchName = !name ||
      (m.name || '').toLowerCase().includes(name) ||
      (m.lastName || '').toLowerCase().includes(name)
    const matchEsp = !filterEspeciality.value ||
      (m.especiality?._id) === (filterEspeciality.value?._id)
    return matchName && matchEsp
  })
})


</script>

<template>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <!-- Total Médicos -->
        <div class="bg-white rounded-xl shadow-sm border-l-4 border-l-blue-500 border border-surface-200 p-5">
            <div class="flex items-center justify-between mb-3">
            <p class="text-surface-500 text-2xl font-medium">Total Médicos</p>
            <i class="fa-solid fa-user-doctor text-blue-500 text-4xl"></i>
            </div>
            <p class="text-3xl font-bold text-surface-900">{{ medicos.length }}</p>
        </div>

        <!-- Médicos Activos -->
        <div class="bg-white rounded-xl shadow-sm border-l-4 border-l-green-500 border border-surface-200 p-5">
            <div class="flex items-center justify-between mb-3">
            <p class="text-surface-500 text-2xl font-medium ">Médicos Activos</p>
            <i class="fa-solid fa-check text-green-500 text-4xl"></i>
            </div>
            <p class="text-3xl font-bold text-surface-900">{{ medicos.filter(m => m.status).length }}</p>
        </div>

        <!-- Médicos Inactivos -->
        <div class="bg-white rounded-xl shadow-sm border-l-4 border-l-red-500 border border-surface-200 p-5">
            <div class="flex items-center justify-between mb-3">
            <p class="text-surface-500 text-2xl font-medium ">Médicos Inactivos</p>
            <i class="fa-solid fa-ban text-red-500 text-4xl"></i>
            </div>
            <p class="text-3xl font-bold text-surface-900">{{ medicos.filter(m => !m.status).length }}</p>
        </div>


        </div>

        <!-- filtros -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <span class="p-input-icon-left relative">
                <InputText
                v-model="filterName"
                placeholder="Buscar por nombre o apellido..."
                class="w-full pl-10"
                />
            </span>
            <Select
                v-model="filterEspeciality"
                :options="areas"
                optionLabel="name"
                placeholder="Filtrar por especialidad"
                class="w-full"
            />
            <div class="flex gap-4 justify-center">
                <button class="bg-purple-500 p-2 rounded text-white shadow-md hover:bg-purple-700 cursor-pointer font-bold w-full" @click="filterEspeciality = null; filterName = ''" ><i class="fa-solid fa-xmark"></i> Limpiar Filtros</button>
                <button class="bg-green-500 text-white p-2 rounded-md cursor-pointer hover:bg-green-700 w-full" @click="handleExportExcel"><i class="fa-solid fa-file-excel"></i> Exportar a Excel</button>
                </div>
            
        </div>
    <Card>
        <template #content>
        <div class="flex justify-between items-center p-4 mb-3">
        <h2>Médicos</h2>
        <button class="bg-emerald-500 p-2 rounded text-white shadow-md hover:bg-emerald-700 cursor-pointer font-bold" @click="openCreate" ><i class="fa-solid fa-user-doctor"></i> Agregar Médico</button>
      </div>

           <!-- mensaje de error -->
      <p v-if="error" class="text-red-500 mb-3">{{ error }}</p>

      <DataTable :value="filteredMedicos" :loading="loading" stripedRows paginator :rows="5" :rowsPerPageOptions="[5, 10, 20]" sortField="name" :sortOrder="1">
        <Column field="name" header="Nombre" sortable>
          <template #body="{ data }">
            <i class="fa-solid fa-user mr-2 text-blue-500"></i>{{ data.name }}
          </template>
        </Column>
        <Column field="lastName" header="Apellido" sortable>
          <template #body="{ data }">
            <i class="fa-solid fa-user mr-2 text-green-500"></i>{{ data.lastName }}
          </template>
        </Column>

        <Column field="gender" header="Género" sortable>
          <template #body="{ data }">
            <i class="fa-solid fa-mars-and-venus text-orange-500"></i> {{ data.gender === 'M' ? 'Masculino' : 'Femenino' }}
          </template>
        </Column>

        <Column field="birthDate" header="Fecha de Nacimiento" sortable>
          <template #body="{ data }">
            <i class="fa-solid fa-cake-candles mr-2 text-purple-500"></i>{{ data.birthDate.slice(0, 10) }}
          </template>
        </Column>

        <Column field="especiality" header="Especialidad" sortable>
          <template #body="{ data }">
            <i class="fa-solid fa-briefcase-medical mr-2 text-red-500"></i>{{ data.especiality?.name || 'Sin especialidad' }}
        </template>
        </Column>

        <Column field="status" header="Status" sortable>
          <template #body="{ data }">
            <span :class="data.status ? 'bg-green-500' : 'bg-red-500'" class="text-white px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-1">
              <i :class="data.status ? 'pi pi-check' : 'pi pi-times'"></i>
              {{ data.status ? 'Activo' : 'Inactivo' }}
            </span>
        </template>
        </Column>

        <Column header="Acciones" style="width: 150px">
          <template #body="{ data }">
            <Button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-sm" @click="openEdit(data)" />
            <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-sm p-button-danger" @click="handleDelete(data)" />
          </template>
        </Column>
      </DataTable>


      <!--modal crear/editar-->
      <Dialog
        v-model:visible="visible"
        modal
        :header="editingMedico ? 'Editar médico' : 'Nuevo médico'"
        :style="{ width: '65rem' }"
      >
        <div class="grid grid-cols-3  gap-4">
            <div>
                <label class="font-bold">Nombre del médico</label>
                <InputText
                v-model="form.name"
                autocomplete="off"
                @keyup.enter="handleSave"
                placeholder="Ejemplo: Juan Perez"
                :style="{ width: '100%' }"
                />
            </div>
            <div>
                <label class="font-bold">Apellido del médico</label>
                <InputText
                v-model="form.lastName"
                autocomplete="off"
                @keyup.enter="handleSave"
                placeholder="Ejemplo Perez Hernández"
                :style="{ width: '100%' }"
                />
            </div>
            <div class="flex flex-col">
                <label class="font-bold">Género</label>
                <Select v-model="form.gender" :options="genders" optionLabel="name" placeholder="Selecciona un género" class="w-full md:w-56" />
            </div>

            <div>
                <label class="font-bold">Correo electrónico</label>
                <InputText
                v-model="form.email"
                autocomplete="off"
                @keyup.enter="handleSave"
                placeholder="Ejemplo: juanperez@hotmail.com"
                :style="{ width: '100%' }"
                />
            </div>

            <div>
                <label class="font-bold">Fecha de nacimiento</label>
                <DatePicker v-model="form.birthDate" 
                placeholder="Elige la fecha"
                dateFormat="dd/mm/yy"
                :style="{ width: '100%' }"
                />
            </div>

            <div class="flex flex-col">
                <label class="font-bold">Especialidad</label>
                <Select v-model="form.especiality" :options="areas" optionLabel="name" placeholder="Selecciona una especialidad" class="w-full md:w-56" />
            </div>
            <div class="flex gap-4">
                <label class="font-bold">Médico activo </label>
                <Checkbox v-model="form.status" binary  />
            </div>
        </div>
        <div class="flex justify-end gap-2">
          <Button label="Cancelar" severity="secondary" @click="visible = false" />
          <Button label="Guardar" @click="handleSave" />
        </div>
    </Dialog>
    </template>
    </Card>
</template>


