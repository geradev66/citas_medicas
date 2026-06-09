import {ref} from "vue"
import {api} from "../service/api"

export function useCitas(){

    const citas = ref([])
    const loading = ref(false)
    const error = ref(null)

    const fetchCitas = async () => {
        loading.value = true
        error.value = null
        try{
            const response = await api.get('/citas')
            citas.value = response.data
        }catch(err){
            error.value = err.response?.data?.message || err.message || 'Error desconocido'
        }finally{
            loading.value = false
        }
    }

    const createCita = async (cita) => {
        loading.value = true
        error.value = null
        try{
            const response = await api.post('/citas', cita)
            citas.value.push(response.data)
        }catch(err){
            error.value = err.response?.data?.message || err.message || 'Error desconocido'
        }finally{
            loading.value = false
        }
    }

    const updateCita = async (cita) => {
        loading.value = true
        error.value = null
        try{
            const response = await api.put(`/citas/${cita._id}`, cita)
            const idx = citas.value.findIndex(c => c._id === cita._id)
            if (idx !== -1) citas.value[idx] = response.data
        }catch(err){
            error.value = err.response?.data?.message || err.message || 'Error desconocido'
        }finally{
            loading.value = false
        }
    }

    const deleteCita = async (cita) => {
        loading.value = true
        error.value = null
        try{
            await api.delete(`/citas/${cita._id}`)
            citas.value = citas.value.filter(c => c._id !== cita._id)
        }catch(err){
            error.value = err.response?.data?.message || err.message || 'Error desconocido'
        }finally{
            loading.value = false
        }
    }

    return {citas, loading, error, fetchCitas, createCita, updateCita, deleteCita}
}
