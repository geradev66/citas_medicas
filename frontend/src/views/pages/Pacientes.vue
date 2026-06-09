<script setup>
import Card from 'primevue/card';
import {ref, onMounted, computed} from 'vue'
import { useMedicos } from '../../composables/useMedicos'
import { useAreas } from '../../composables/useAreas'
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
import {usePacientes} from "../../composables/usePacientes";


const genders = [
    { name: 'Masculino', code: 'M' },
    { name: 'Femenino', code: 'F' },
]

const {pacientes, loading, error, fetchPacientes,createPaciente,updatePaciente, deletePaciente} = usePacientes()


const visible = ref(false)
const editingPaciente = ref(null)
const form = ref({
    name: '',
    lastName: '',
    insurance: '',
    phoneNumber: '',
    gender: null,
})

onMounted(() => {
    fetchPacientes()
})

const openCreate = () => {
    editingPaciente.value = null
    form.value = { name: '', lastName: '', insurance: '', phoneNumber: '', gender: null}
    visible.value = true
}

const openEdit = (paciente) => {
    editingPaciente.value = paciente
    form.value = {
        name: paciente.name,
        lastName: paciente.lastName,
        insurance: paciente.insurance,
        phoneNumber: paciente.phoneNumber,
        gender: genders.find(g => g.code === paciente.gender),


    }
    visible.value = true
    console.log(paciente.gender)
}

const handleSave = async () => {
    if (!form.value.name?.trim() || !form.value.lastName?.trim() || !form.value.insurance || !form.value.phoneNumber || !form.value.gender) return

    const payload = {
        name: form.value.name,
        lastName: form.value.lastName,
        gender: form.value.gender?.code || form.value.gender,
        insurance: form.value.insurance,
        phoneNumber: form.value.phoneNumber

    }

    if (editingPaciente.value) {
        await updatePaciente({ _id: editingPaciente.value._id, ...payload })
        toast.success('Paciente actualizado correctamente')
    } else {
        await createPaciente(payload)
        toast.success('Paciente creado correctamente')
    }

    visible.value = false
}


const handleDelete = async (paciente) => {
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: `Estás seguro que deseas eliminar al médico ${paciente.name}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
    })
    if (result.isConfirmed) {
        await deletePaciente(paciente)
        toast.success('Paciente eliminado correctamente')
    }
}


//filtros para la tabla

const filterName = ref('')
const filterEspeciality = ref(null)

const handleExportExcel = async () => {
    try {
        const response = await api.get('/pacientes/export/excel', { responseType: 'blob' })
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'pacientes.xlsx')
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
        toast.success('Excel exportado correctamente')
    } catch {
        toast.error('Error al exportar a Excel')
    }
}

const filteredPacientes = computed(() => {
  const name = (filterName.value || '').toLowerCase().trim()
  return pacientes.value.filter(m => {
    const matchName = !name ||
      (m.name || '').toLowerCase().includes(name) ||
      (m.lastName || '').toLowerCase().includes(name)

    return matchName
  })
})


</script>

<template>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <!-- Total Pacientes-->
        <div class="bg-white rounded-xl shadow-sm border-l-4 border-l-blue-500 border border-surface-200 p-5">
            <div class="flex items-center justify-between mb-3">
            <p class="text-surface-500 text-2xl font-medium">Total Pacientes</p>
            <i class="fa-solid fa-user text-blue-500 text-4xl"></i>
            </div>
            <p class="text-3xl font-bold text-surface-900">{{ pacientes.length }}</p>
        </div>

        <div class="bg-white rounded-xl shadow-sm border-l-4 border-l-red-500 border border-surface-200 p-5">
            <div class="flex items-center justify-between mb-3">
            <p class="text-surface-500 text-2xl font-medium">Total de afiliados a un seguro</p>
            <i class="fa-solid fa-hospital text-red-500 text-4xl"></i>
            </div>
            <p class="text-3xl font-bold text-surface-900">{{ pacientes.filter(p => p.insurance).length }}</p>
        </div>

        </div>

        <!-- filtros -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <span class="p-input-icon-left relative">
                <InputText
                v-model="filterName"
                placeholder="Buscar por nombre o apellido..."
                class="w-full pl-10"
                />
            </span>
            <div class="flex gap-4 justify-center">
                <button class="bg-purple-500 p-2 rounded text-white shadow-md hover:bg-purple-700 cursor-pointer font-bold w-full" @click="filterEspeciality = null; filterName = ''" ><i class="fa-solid fa-xmark"></i> Limpiar Filtros</button>
                <button class="bg-green-500 text-white p-2 rounded-md cursor-pointer hover:bg-green-700 w-full" @click="handleExportExcel"><i class="fa-solid fa-file-excel"></i> Exportar a Excel</button>
                </div>
            
        </div>
    <Card>
        <template #content>
        <div class="flex justify-between items-center p-4 mb-3">
        <h2>Pacientes</h2>
        <button class="bg-emerald-500 p-2 rounded text-white shadow-md hover:bg-emerald-700 cursor-pointer font-bold" @click="openCreate" ><i class="fa-solid fa-user-plus"></i> Agregar Paciente</button>
      </div>

           <!-- mensaje de error -->
      <p v-if="error" class="text-red-500 mb-3">{{ error }}</p>

      <DataTable :value="filteredPacientes" :loading="loading" stripedRows paginator :rows="5" :rowsPerPageOptions="[5, 10, 20]" sortField="name" :sortOrder="1">
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

        <Column field="insurance" header="Seguro" sortable>
          <template #body="{ data }">
            <i class="fa-solid fa-hospital text-red-500"></i> {{ data.insurance }}
          </template>
        </Column>

        <Column field="phoneNumber" header="Teléfono" sortable>
          <template #body="{ data }">
            <i class="fa-solid fa-user mr-2 text-green-500"></i>{{ data.phoneNumber }}
          </template>
        </Column>

        <Column field="gender" header="Género" sortable>
          <template #body="{ data }">
            <i class="fa-solid fa-mars-and-venus text-orange-500"></i> {{ data.gender === 'M' ? 'Masculino' : 'Femenino' }}
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
        :header="editingPaciente ? 'Editar paciente' : 'Nuevo paciente'"
        :style="{ width: '65rem' }"
      >
        <div class="grid grid-cols-3  gap-4">
            <div>
                <label class="font-bold">Nombre del paciente</label>
                <InputText
                v-model="form.name"
                autocomplete="off"
                @keyup.enter="handleSave"
                placeholder="Ejemplo: Juan Perez"
                :style="{ width: '100%' }"
                />
            </div>
            <div>
                <label class="font-bold">Apellido del paciente</label>
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
                <label class="font-bold">Seguro</label>
                <InputText
                v-model="form.insurance"
                autocomplete="off"
                @keyup.enter="handleSave"
                placeholder="Ejemplo: juanperez@hotmail.com"
                :style="{ width: '100%' }"
                />
            </div>

            <div>
                <label class="font-bold">Telefono</label>
                <InputText
                v-model="form.phoneNumber"
                autocomplete="off"
                @keyup.enter="handleSave"
                placeholder="Ejemplo: 1234567890"
                :style="{ width: '100%' }"
                />
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


