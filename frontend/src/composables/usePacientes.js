import {ref} from "vue"
import{api} from "../service/api"

export function usePacientes(){

    const pacientes = ref([])
    const loading = ref(false)
    const error = ref(null)

    const fetchPacientes = async() =>{
        loading.value= true
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

    const createPaciente = async(paciente) =>{
        loading.value= true
        error.value = null
        try{
            const response = await api.post('/pacientes', paciente)
            pacientes.value.push(response.data)
            
        }catch(err){
            error.value = err.response?.data?.message || err.message || 'Error desconocido'
        }finally{
            loading.value = false
        }
    }

    const updatePaciente = async(paciente) =>{
        loading.value = true
        error.value = null
        try{
            const response = await api.put(`/pacientes/${paciente._id}`, paciente)
            pacientes.value[pacientes.value.findIndex(p => p._id === paciente._id)] = response.data
        }catch(err){
            error.value = err.response?.data?.message || err.message || 'Error desconocido'
        }finally{
            loading.value = false
        }
    }

    const deletePaciente = async(paciente) => {
        loading.value = true
        error.value = null
        try{
            await api.delete(`/pacientes/${paciente._id}`)
            pacientes.value = pacientes.value.filter(p => p._id !== paciente._id)
        }catch(err){
            error.value = err.response?.data?.message || err.message || 'Error desconocido'
        }finally{
            loading.value = false
    }
        }

    return {pacientes, loading, error, fetchPacientes, createPaciente, updatePaciente, deletePaciente}   
}