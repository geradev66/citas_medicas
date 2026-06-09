<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import Select from 'primevue/select';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';

import Calendar from 'primevue/calendar';
import Textarea from 'primevue/textarea';
import { useCitas } from '../../composables/useCitas';
import { usePacientes } from '../../composables/usePacientes';
import { useMedicos } from '../../composables/useMedicos';
import { useAreas } from '../../composables/useAreas';
import { toast } from 'vue3-toastify';

const { citas, fetchCitas, createCita, updateCita, deleteCita } = useCitas()
const { pacientes, fetchPacientes } = usePacientes()
const { medicos, fetchMedicos } = useMedicos()
const { areas, fetchAreas } = useAreas()

const dialogVisible = ref(false);
const editMode = ref(false);
const selectedDate = ref(null);
const loading = ref(false);
const calendarKey = ref(0);

function refreshCalendar() { calendarKey.value++ }

const timeValue = ref(null)
watch(timeValue, (v) => {
    if (v) form.value.hour = `${String(v.getHours()).padStart(2, '0')}:${String(v.getMinutes()).padStart(2, '0')}`
})

const form = ref({
    _id: null,
    patient: null,
    medic: null,
    date: null,
    hour: '',
    area: null,
    motivo: '',
    status: 'pendiente'
});

const statusOptions = ['pendiente', 'confirmada', 'cancelada', 'completada']

const slotOcupado = computed(() => {
    if (!form.value.medic || !form.value.date || !form.value.hour) return false
    const medicId = form.value.medic._id || form.value.medic
    const d = form.value.date
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    return citas.value.some(c =>
        c._id !== form.value._id &&
        (c.medic?._id || c.medic) === medicId &&
        c.date?.slice(0, 10) === dateStr &&
        c.hour === form.value.hour
    )
})

const filteredMedicos = computed(() =>
    form.value.area
        ? medicos.value.filter(m => m.especiality?._id === form.value.area._id || m.especiality === form.value.area._id)
        : medicos.value
)

const events = computed(() =>
    citas.value.filter(c => c.date && c.hour).map(c => {
        const dateStr = c.date.slice(0, 10)
        const startStr = `${dateStr}T${c.hour}:00`
        const [h, m] = c.hour.split(':')
        const endDate = new Date(dateStr)
        endDate.setHours(parseInt(h), parseInt(m) + 30)
        const endH = String(endDate.getHours()).padStart(2, '0')
        const endM = String(endDate.getMinutes()).padStart(2, '0')
        const endStr = `${dateStr}T${endH}:${endM}:00`
        return {
            id: c._id,
            title: `${c.patient?.name || '?'} ${c.patient?.lastName || ''} - ${c.medic?.name || '?'}  ${c.area?.name || '?'}`,
            start: startStr,
            end: endStr,
            backgroundColor: c.status === 'pendiente' ? '#6b7280' : c.status === 'confirmada' ? '#22c55e' : c.status === 'cancelada' ? '#ef4444' : '#2196f3',
            borderColor: c.status === 'pendiente' ? '#6b7280' : c.status === 'confirmada' ? '#22c55e' : c.status === 'cancelada' ? '#ef4444' : '#2196f3',
            extendedProps: { ...c }
        }
    })
)

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay'
  },
  locale: esLocale,
  height: 'auto',
  slotLabelFormat: {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  },
  slotDuration: '00:30:00',
  slotLabelInterval: '00:30:00',
  editable: true,
  selectable: true,
  weekends: true,
  events: events.value,   // ← clave
  dateClick: handleDateClick,
  eventClick: handleEventClick,
   
eventContent: (arg) => {
  const ext = arg.event.extendedProps
  const patient = ext?.patient
  const medic = ext?.medic
  const area = ext?.area?.name || ''
  const hour = ext?.hour || ''
  const status = ext?.status || 'pendiente'

  const statusColors = {
    pendiente:  { bg: '#f1f5f9', text: '#475569', dot: '#94a3b8' },
    confirmada: { bg: '#dcfce7', text: '#166534', dot: '#22c55e' },
    cancelada:  { bg: '#fee2e2', text: '#991b1b', dot: '#ef4444' },
    completada: { bg: '#dbeafe', text: '#1e40af', dot: '#3b82f6' },
  }
  const c = statusColors[status] || statusColors.pendiente

  return {
    html: `
      <div style="
        background:${c.bg};
        color:${c.text};
        border-radius:6px;
        padding:4px 7px;
        font-size:0.75rem;
        line-height:1.4;
        overflow:hidden;
        cursor:pointer;
      ">
        <div style="display:flex;align-items:center;gap:5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
          <span style="width:7px;height:7px;border-radius:50%;background:${c.dot};flex-shrink:0"></span>
          <span style="overflow:hidden;text-overflow:ellipsis">${hour} · ${patient?.name || '?'} ${patient?.lastName || ''}</span>
        </div>
        <div style="padding-left:12px;opacity:0.85;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:0.7rem">
          ${medic?.name || ''} ${area ? '· ' + area : ''}
        </div>
      </div>
    `
  }
},
  eventDrop: handleEventDrop
}))

function resetForm() {
    timeValue.value = null
    form.value = {
        _id: null,
        patient: null,
        medic: null,
        date: null,
        hour: '',
        area: null,
        motivo: '',
        status: 'pendiente'
    };
}

function handleDateClick(info) {
    resetForm();
    editMode.value = false;
    const parts = info.dateStr.split('-');
    form.value.date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    selectedDate.value = info.dateStr;
    dialogVisible.value = true;
}

function handleEventClick(info) {
    resetForm();
    editMode.value = true;
    const event = info.event;
    const ext = event.extendedProps;
    const extId = (v) => v?._id || v
    form.value = {
        _id: ext._id,
        patient: pacientes.value.find(p => p._id === extId(ext.patient)) || ext.patient,
        medic: medicos.value.find(m => m._id === extId(ext.medic)) || ext.medic,
        date: new Date(event.start),
        hour: ext.hour,
        area: areas.value.find(a => a._id === extId(ext.area)) || ext.area,
        motivo: ext.motivo || '',
        status: ext.status || 'pendiente'
    };
    if (ext.hour) {
        const [h, m] = ext.hour.split(':')
        const d = new Date()
        d.setHours(parseInt(h), parseInt(m), 0, 0)
        timeValue.value = d
    }
    dialogVisible.value = true;
}

async function handleEventDrop(info) {
    const event = info.event;
    const cita = citas.value.find(c => c._id === event.id)
    if (!cita) return
    const dateStr = event.startStr.slice(0, 10)
    const hourStr = event.startStr.slice(11, 16)
    await updateCita({ _id: cita._id, date: dateStr, hour: hourStr })
    refreshCalendar()
}

function openNuevaCita() {
    resetForm();
    editMode.value = false;
    selectedDate.value = null;
    dialogVisible.value = true;
}

async function saveCita() {
    if (!form.value.patient || !form.value.medic || !form.value.date || !form.value.hour) {
        toast.warn('Completa todos los campos requeridos')
        return
    }
    if (slotOcupado.value) {
        toast.warn('El médico ya tiene una cita en ese horario, elige otra hora')
        return
    }

    loading.value = true
    const year = form.value.date.getFullYear();
    const month = String(form.value.date.getMonth() + 1).padStart(2, '0');
    const day = String(form.value.date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`

    const payload = {
        patient: form.value.patient._id || form.value.patient,
        medic: form.value.medic._id || form.value.medic,
        area: form.value.area?._id || form.value.area,
        date: dateStr,
        hour: form.value.hour,
        motivo: form.value.motivo,
        status: form.value.status
    }

    try {
        if (editMode.value && form.value._id) {
            await updateCita({ _id: form.value._id, ...payload })
            toast.success('Cita actualizada correctamente')
        } else {
            await createCita(payload)
            toast.success('Cita creada correctamente')
        }
        dialogVisible.value = false;
        refreshCalendar()
    } catch {
        toast.error('Error al guardar la cita')
    } finally {
        loading.value = false
    }
}

async function handleDelete(id) {
    if (!id) return
    loading.value = true
    try {
        await deleteCita({ _id: id })
        toast.success('Cita eliminada correctamente')
        dialogVisible.value = false
        refreshCalendar()
    } catch {
        toast.error('Error al eliminar la cita')
    } finally {
        loading.value = false
    }
}

watch(() => form.value.area, () => {
    if (form.value.area && form.value.medic) {
        const belongs = medicos.value.some(m =>
            (m.especiality?._id === form.value.area._id || m.especiality === form.value.area._id) &&
            (m._id === form.value.medic._id || m._id === form.value.medic)
        )
        if (!belongs) form.value.medic = null
    }
})

onMounted(() => {
    fetchCitas()
    fetchPacientes()
    fetchMedicos()
    fetchAreas()
})
</script>

<template>
    <div class="font-semibold text-2xl mb-4">Citas</div>
    <Card>
        <template #content>
            <div class="flex justify-content-end mb-3">
                <Button label="Nueva Cita" icon="pi pi-plus" @click="openNuevaCita" />
            </div>

            <FullCalendar :key="calendarKey" :options="calendarOptions" />

            <Dialog
                v-model:visible="dialogVisible"
                :header="editMode ? 'Editar Cita' : 'Nueva Cita'"
                :modal="true"
                :style="{ width: '600px' }"
                class="p-fluid"
            >
                <div class="grid grid-cols-2 gap-4">
                    <div class="field flex flex-col">
                        <label for="paciente">Paciente</label>
                        <Select
                            id="paciente"
                            v-model="form.patient"
                            :options="pacientes"
                            optionLabel="name"
                            placeholder="Seleccionar paciente"
                        />
                    </div>
                    <div class="field flex flex-col">
                        <label for="area">Área</label>
                        <Select
                            id="area"
                            v-model="form.area"
                            :options="areas"
                            optionLabel="name"
                            placeholder="Seleccionar área"
                        />
                    </div>
                    <div class="field flex flex-col">
                        <label for="hora">Hora</label>
                        <Calendar id="hora" v-model="timeValue" timeOnly hourFormat="24" showIcon placeholder="09:00" />
                    </div>

                    
                     

                    <div class="field flex flex-col">
                        <label for="fecha">Fecha</label>
                        <Calendar id="fecha" v-model="form.date" showIcon dateFormat="yy-mm-dd" />
                    </div>

                   <div class="field flex flex-col">
                        <label for="medico">Médico</label>
                        <Select
                            id="medico"
                            v-model="form.medic"
                            :options="filteredMedicos"
                            optionLabel="name"
                            placeholder="Seleccionar médico"
                        />
                    </div>


                    <div class="field flex flex-col">
                        <label for="estado">Estado</label>
                        <Select
                            id="estado"
                            v-model="form.status"
                            :options="statusOptions"
                            placeholder="Seleccionar estado"
                        />
                    </div>
                </div>

                <div v-if="slotOcupado" class="bg-red-100 border-1 border-red-400 text-red-700 px-4 py-3 rounded mb-3 text-sm">
                    <i class="pi pi-exclamation-triangle mr-2"></i>
                    El médico ya tiene una cita el <strong>{{ form.date ? new Date(form.date).toLocaleDateString('es-ES') : '' }}</strong> a las <strong>{{ form.hour }}</strong>. Elige otra hora.
                </div>

                <div class="field flex flex-col">
                    <label for="motivo">Motivo</label>
                    <Textarea id="motivo" v-model="form.motivo" rows="3" placeholder="Motivo de la consulta" />
                </div>

                <template #footer>
                    <div class="flex justify-between">
                        <div>
                            <Button
                                v-if="editMode"
                                label="Eliminar"
                                icon="pi pi-trash"
                                class="p-button-danger p-button-text"
                                @click="handleDelete(form._id)"
                            />
                        </div>
                        <div class="flex gap-2">
                            <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="dialogVisible = false" />
                            <Button label="Guardar" icon="pi pi-check" @click="saveCita" :loading="loading" :disabled="slotOcupado" />
                        </div>
                    </div>
                </template>
            </Dialog>
        </template>
    </Card>
</template>

<style lang="scss" scoped>
.field {
    margin-bottom: 1.25rem;
}
</style>

<style lang="scss">
.fc {
    --fc-border-color: #d1d5db;
    --fc-button-bg-color: #3b82f6;
    --fc-button-border-color: #3b82f6;
    --fc-button-hover-bg-color: #2563eb;
    --fc-button-hover-border-color: #2563eb;
    --fc-button-active-bg-color: #1d4ed8;
    --fc-button-active-border-color: #1d4ed8;
    --fc-today-bg-color: rgba(59, 130, 246, 0.08);
    --fc-event-bg-color: #3b82f6;
    --fc-event-border-color: #3b82f6;
    --fc-event-text-color: #fff;
    --fc-page-bg-color: transparent;
    --fc-neutral-bg-color: #fff;

    font-family: inherit;

    .fc-toolbar-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: #1e293b;
    }

    .fc-button {
        font-weight: 500;
        font-size: 0.875rem;
        padding: 0.5rem 0.875rem;
        border-radius: 0.5rem;
        transition: all 0.15s ease;
        box-shadow: none;

        .fc-icon {
            font-size: 1rem;
        }
    }

    .fc-button-primary:not(:disabled).fc-button-active,
    .fc-button-primary:not(:disabled):active {
        box-shadow: none;
    }

    .fc-toolbar-chunk {
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }

    .fc-daygrid-day {
        border-radius: 0;
        transition: background-color 0.15s ease;

        &.fc-day-today {
            background: var(--fc-today-bg-color);
        }

        &:hover {
            background: rgba(59, 130, 246, 0.04);
        }
    }

    .fc-daygrid-day-frame {
        min-height: 100px;
        padding: 4px;
    }

    .fc-daygrid-day-number {
        font-size: 0.875rem;
        font-weight: 500;
        color: #475569;
        padding: 6px 8px 0 0;
        text-decoration: none;
    }

    .fc-daygrid-day-top {
        flex-direction: row-reverse;
    }

    .fc-daygrid-day-events {
        min-height: 2.5rem;
    }

    .fc-daygrid-event {
  border-radius: 6px !important;
  padding: 0 !important;          // ← quita el padding del wrapper
  border: none !important;
  background: transparent !important;  // el color lo maneja el div interno
  
  .fc-event-main {
    padding: 0;
    overflow: hidden;
  }
}

    .fc-daygrid-event-dot {
        display: none;
    }

    .fc-event-title {
        font-weight: 500;
    }

    .fc-col-header-cell {
        padding: 10px 0;
        background: #f8fafc;
        border-bottom: 2px solid #e2e8f0;

        .fc-col-header-cell-cushion {
            font-size: 0.8rem;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            text-decoration: none;
        }
    }

    .fc-day-other {
        background: #f8fafc;
        opacity: 0.6;
    }

    .fc-scrollgrid {
        border-radius: 0.75rem;
        border: 1px solid #e2e8f0;
        overflow: hidden;
    }

    .fc-scrollgrid-section > td {
        border: none;
    }

    .fc-scrollgrid-section-header > td {
        border-bottom: 1px solid #e2e8f0;
    }

    .fc-timegrid-slot {
        height: 2.5rem;
    }

    .fc-timegrid-col.fc-day-today {
        background: var(--fc-today-bg-color);
    }

    .fc-timegrid-now-indicator-line {
        border-color: #f50057;
    }

    .fc-timegrid-now-indicator-arrow {
        border-color: #f50057;
        color: #f50057;
    }

    .fc-more-popover {
        border-radius: 0.75rem;
        border: 1px solid #e2e8f0;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

        .fc-popover-header {
            background: #f8fafc;
            padding: 0.5rem 0.75rem;
            font-size: 0.875rem;
            font-weight: 600;
        }
    }

    .fc-popover-close {
        display: flex;
        align-items: center;
        justify-content: center;
    }
}
</style>
