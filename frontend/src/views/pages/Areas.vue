<script setup>
import { ref, onMounted } from 'vue'
import { useAreas } from '../../composables/useAreas'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import {toast} from 'vue3-toastify'
import Swal from 'sweetalert2/dist/sweetalert2.esm.all.js'


// ─── Traemos todo del composable ───
const { areas, loading, error, fetchAreas, createArea, updateAreas, deleteArea } = useAreas()

// ─── Estado del modal ───
const visible = ref(false)
const editingArea = ref(null)        // null = crear, objeto = editando
const formName = ref('')             // v-model del input

// ─── Cargar datos al montar ───
onMounted(() => fetchAreas())

// ─── Abrir modal para NUEVO ───
const openCreate = () => {
  editingArea.value = null
  formName.value = ''
  visible.value = true
}

// ─── Abrir modal para EDITAR ───
const openEdit = (area) => {
  editingArea.value = area
  formName.value = area.name
  visible.value = true
}

// ─── Guardar (crear o actualizar) ───
const handleSave = async () => {
  if (!formName.value.trim()) return

  if (editingArea.value) {
    // ACTUALIZAR
    await updateAreas({ _id: editingArea.value._id, name: formName.value })
    toast.success('Area actualizada correctamente')
  } else {
    // CREAR
    await createArea({ name: formName.value })
    toast.success('Area creada correctamente')

  }

  visible.value = false
}

// ─── Eliminar ───
const handleDelete = async (area) => {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: 'No podrás revertir esta acción',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  })
  if (result.isConfirmed) {
    await deleteArea(area)
    toast.success('Área eliminada correctamente')
  }
}
</script>

<template>
  <Card>
    <template #content>
      <div class="flex justify-between items-center p-4 mb-3">
        <h2>Áreas Médicas</h2>
        <button class="bg-orange-500 p-2 rounded text-white shadow-md hover:bg-orange-600 cursor-pointer font-bold" @click="openCreate" ><i class="fa-solid fa-folder-plus"></i> Agregar área</button>
      </div>

      <!-- mensaje de error -->
      <p v-if="error" class="text-red-500 mb-3">{{ error }}</p>

      <DataTable
        :value="areas"
        :loading="loading"
        stripedRows
        paginator
        :rows="5"
        :rowsPerPageOptions="[5, 10, 20]"
        sortField="name"
        :sortOrder="1"
      >
        <Column field="name" header="Nombre" sortable>
          <template #body="{ data }">
            <i class="fa-solid fa-hospital mr-2 text-purple-500"></i>{{ data.name }}
          </template>
        </Column>
        <Column header="Acciones" style="width: 150px">
          <template #body="{ data }">
            <Button
              icon="pi pi-pencil"
              class="p-button-rounded p-button-text p-button-sm"
              @click="openEdit(data)"
            />
            <Button
              icon="pi pi-trash"
              class="p-button-rounded p-button-text p-button-sm p-button-danger"
              @click="handleDelete(data)"
            />
          </template>
        </Column>
      </DataTable>
    </template>
  </Card>

  <!-- ─── MODAL crear/editar ─── -->
  <Dialog
    v-model:visible="visible"
    modal
    :header="editingArea ? 'Editar área' : 'Nueva área'"
    :style="{ width: '25rem' }"
  >
    <div class="flex flex-col gap-4 mb-4">
      <label class="font-semibold">Nombre del área</label>
      <InputText
        v-model="formName"
        autocomplete="off"
        @keyup.enter="handleSave"
      />
    </div>
    <div class="flex justify-end gap-2">
      <Button label="Cancelar" severity="secondary" @click="visible = false" />
      <Button label="Guardar" @click="handleSave" />
    </div>
  </Dialog>
</template>