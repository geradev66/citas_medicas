import {defineStore} from 'pinia'
import {ref} from 'vue'
import {api} from '../service/api'

export const usePacientesStore = defineStore('pacientes', () =>{
    const pacientes = ref([])
    const loading = ref(false)
    const error = ref(null)

    const fetchPacientes = async() =>{
        lading.value = true
        error.value = null
        try{
            const response = await api.get('/pacientes')
            pacientes.value = response.data
        }catch(err){
            error.value = err.response?.data?.message || err.message || 'Error desconocido'
        }finally{
            loading.value = false
        }
    }
    return {pacientes, loading, error, fetchPacientes}
})